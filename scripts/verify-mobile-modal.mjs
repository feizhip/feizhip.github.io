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

// 等所有入场动画完成
await sleep(5000)
// 滚到 #home（Hero + Work 合并）
const sr = await c.send('Runtime.evaluate', { expression: "(()=>{ try { const e=document.getElementById('home'); if(!e) return 'NO_HOME'; const r=e.getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.top + 400); return 'OK scrolledY=' + window.scrollY; } catch(err) {return 'ERR ' + err.message} })()", returnByValue: true })
console.log('[scroll] ' + JSON.stringify(sr?.result?.value))
await sleep(2500)

// 找项目卡（移动端是 .snap-x 容器内的卡片 div）
const r = await c.send('Runtime.evaluate', {
  expression: `(()=>{
    const hs = document.getElementById('home');
    if (!hs) return 'NO_HOME';
    const cards = hs.querySelectorAll('.snap-x > div');
    if (!cards.length) return 'NO_CARDS in_home snapx len=' + hs.outerHTML.length;
    cards[0].click();
    return 'CLICKED_count=' + cards.length;
  })()`,
  returnByValue: true,
})
const val = r?.result?.value
const err = r?.exceptionDetails?.text
console.log('[click] value=' + JSON.stringify(val) + (err ? ' err=' + err : ''))
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