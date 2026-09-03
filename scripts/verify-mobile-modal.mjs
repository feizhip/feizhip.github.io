import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
]

const url = process.argv[2]
const outPath = process.argv[3]
const WIDTH = Number(process.argv[4] || 320)
const HEIGHT = Number(process.argv[5] || 800)
const WAIT = Number(process.argv[6] || 3000)
const CLICK_SEL = process.argv[7] || '.spiral-stage [data-idx]'

const browser = EDGE_CANDIDATES.find((p) => existsSync(p)) || null
if (!browser) { console.error('未找到 Edge/Chrome'); process.exit(2) }

const proc = spawn(
  browser,
  ['--headless=new', '--disable-gpu', '--no-default-browser-check', '--no-first-run',
   '--user-data-dir=' + tmpdir() + '/edge-verify-' + Date.now(),
   '--remote-debugging-port=9223', '--hide-scrollbars'],
  { stdio: 'ignore' },
)
process.on('exit', () => { try { proc.kill() } catch {} })

await sleep(2000)

const tabs = await fetch('http://127.0.0.1:9223/json').then((r) => r.json())
let tab = tabs.find((t) => t.type === 'page')
if (!tab) {
  tab = await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' }).then((r) => r.json())
}

class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = []
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && this.pending.has(m.id)) { const { res } = this.pending.get(m.id); this.pending.delete(m.id); res(m) }
      else if (m.method) { for (const h of this.handlers) h(m) }
    })
  }
  on(h) { this.handlers.push(h); return this }
  send(method, params) {
    const id = ++this.id
    return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params: params || {} })) })
  }
}

const errors = [], warnings = []
const ws = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }) })
const c = new Cdp(ws)
c.on((m) => {
  if (m.method === 'Runtime.consoleAPICalled') {
    const t = (m.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(' ')
    if (m.params.type === 'error') errors.push('console.error: ' + t)
    else if (m.params.type === 'warning') warnings.push('console.warn: ' + t)
  }
  if (m.method === 'Runtime.exceptionThrown') errors.push('未捕获: ' + (m.params.exceptionDetails?.text || ''))
})

await c.send('Runtime.enable')
await c.send('Page.enable')
await c.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: true })
await c.send('Page.navigate', { url })
await sleep(WAIT)

// 滚动到 #work
await c.send('Runtime.evaluate', { expression: "document.getElementById('work')?.scrollIntoView({block:'start'}) || window.scrollTo(0, 600)", returnByValue: true })
await sleep(1500)

// 点击第一张项目卡
const r = await c.send('Runtime.evaluate', {
  expression: `(()=>{ const el=document.querySelector(${JSON.stringify(CLICK_SEL)}); if(!el) return 'NO_EL'; el.click(); return 'CLICKED'; })()`,
  returnByValue: true,
})
console.log('[click] result=' + JSON.stringify(r?.result || r))
await sleep(1200)

const shotRes = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
const data = shotRes?.result?.data
if (!data) { console.log('[shot] no data, abort'); proc.kill(); process.exit(1) }
const buf = Buffer.from(data, 'base64')
mkdirSync(dirname(resolve(outPath)), { recursive: true })
writeFileSync(resolve(outPath), buf)
console.log('[shot] saved: ' + OUT_PART(outPath) + ' (' + (buf.length / 1024).toFixed(1) + ' KB)')
console.log('[shot] errors=' + errors.length + ' warnings=' + warnings.length)

function OUT_PART(p) { return p }
proc.kill()
process.exit(0)