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
const url = process.argv[2] || 'http://localhost:5173'
const WIDTH = Number(process.argv[3] || 390)
const HEIGHT = Number(process.argv[4] || 844)
const OUT = process.argv[5] || '_ref/mob-probe.png'
const PORT = Number(process.argv[6] || 9331)

const browser = EDGE_CANDIDATES.find((p) => existsSync(p)) || null
if (!browser) { console.log('NO_BROWSER'); process.exit(2) }

const proc = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-default-browser-check', '--no-first-run',
  '--user-data-dir=' + tmpdir() + '/edge-mobprobe-' + Date.now(),
  '--remote-debugging-port=' + PORT, '--hide-scrollbars', '--window-size=' + WIDTH + ',' + HEIGHT,
], { stdio: 'ignore' })
process.on('exit', () => { try { proc.kill() } catch {} })

await sleep(1800)
const tabs = await fetch(`http://127.0.0.1:${PORT}/json`).then((r) => r.json())
let tab = tabs.find((t) => t.type === 'page')
if (!tab) tab = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json())

class Cdp {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = []
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && this.pending.has(m.id)) { const { res } = this.pending.get(m.id); this.pending.delete(m.id); res(m) }
      else if (m.method) { for (const h of this.handlers) h(m) }
    })
  }
  on(h) { this.handlers.push(h); return this }
  send(method, params) {
    const id = ++this.id
    return new Promise((res) => { this.pending.set(id, { res }); this.ws.send(JSON.stringify({ id, method, params: params || {} })) })
  }
}

const ws = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }) })
const c = new Cdp(ws)
await c.send('Runtime.enable')
await c.send('Page.enable')
await c.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: true })
await c.send('Page.navigate', { url })
await sleep(6000)

async function ev(expression) {
  const r = await c.send('Runtime.evaluate', { expression, returnByValue: true })
  return r?.result?.result?.value ?? r?.result?.exceptionDetails?.text ?? 'VOID'
}

// 1. 找作品墙（移动端 .snap-x 容器）
console.log('[1] ' + await ev(`(()=>{
  const home = document.getElementById('home');
  const cont = home ? home.querySelector('.snap-x') : null;
  if (!cont) return 'HOME=' + (home?'yes':'NO') + ' snapx=NO sections=' + document.querySelectorAll('section').length;
  const kids = cont.children.length;
  return 'HOME=yes snapx=yes cards=' + kids + ' contW=' + cont.clientWidth + ' scrollW=' + cont.scrollWidth;
})()`))

// 2. 滚动到 home 让卡片可见
await ev(`(()=>{ const e=document.getElementById('home'); if(e) e.scrollIntoView({block:'start'}); })()`)
await sleep(1500)
await ev(`window.scrollBy(0, document.getElementById('home') ? -100 : 0)`)
await sleep(800)

// 3. 记录初始 scrollLeft，点「下一个」按钮
const before = await ev(`(()=>{ const cont=document.getElementById('home').querySelector('.snap-x'); return cont ? cont.scrollLeft : -1; })()`)
const btnState = await ev(`(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='下一个项目'); if(!b) return 'NO_NEXT_BTN'; b.click(); return 'CLICKED'; })()`)
await sleep(900)
const after = await ev(`(()=>{ const cont=document.getElementById('home').querySelector('.snap-x'); return cont ? cont.scrollLeft : -1; })()`)
console.log('[2] nextBtn=' + btnState + ' scrollLeft ' + before + ' -> ' + after)

// 4. 截图
const shot = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
const data = shot?.result?.result?.data || shot?.result?.data
if (data) {
  const buf = Buffer.from(data, 'base64')
  mkdirSync(dirname(resolve(OUT)), { recursive: true })
  writeFileSync(resolve(OUT), buf)
  console.log('[3] shot saved ' + OUT + ' (' + (buf.length / 1024).toFixed(0) + 'KB)')
}
proc.kill()
process.exit(0)