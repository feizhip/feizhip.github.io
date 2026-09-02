/**
 * 页面验收器
 * ------------------------------------------------------------
 * 用本机已有的 Edge（Chromium 内核）通过 CDP 无头打开页面，
 * 一次性拿到：截图 + console 报错 + 页面标题。
 *
 * 为什么不用 agent-browser？
 *   它要 npm install -g 再下载 ~500MB Chromium。本机已有 Edge，
 *   直接复用即可，零安装、零下载。
 *
 * 用法：
 *   node scripts/verify-page.mjs <url> <输出png路径> [宽] [高] [等待ms] [滚动目标选择器]
 *
 * 例：
 *   node scripts/verify-page.mjs http://127.0.0.1:5173/ docs/screenshots/02-hero.png 1440 900 3000
 *   node scripts/verify-page.mjs http://127.0.0.1:5173/ docs/screenshots/03-scrolled.png 1440 900 3000 "#work"
 *
 * 退出码：0 = 无 console 报错；1 = 有报错或运行失败
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
]

const url = process.argv[2]
const outPath = process.argv[3]
const WIDTH = Number(process.argv[4] || 1440)
const HEIGHT = Number(process.argv[5] || 900)
const WAIT = Number(process.argv[6] || 2500)
/** 可选：截图前先平滑滚动到这里（验证锚点跳转 / 导航高亮） */
const SCROLL_SEL = process.argv[7] || ''

if (!url || !outPath) {
  console.error(
    '用法: node scripts/verify-page.mjs <url> <输出png路径> [宽] [高] [等待ms] [滚动目标选择器]',
  )
  process.exit(2)
}

function findBrowser() {
  return EDGE_CANDIDATES.find((p) => existsSync(p)) || null
}

const browser = findBrowser()
if (!browser) {
  console.error('[verify-page] 没找到 Edge 或 Chrome，无法截图')
  process.exit(2)
}

const PORT = 9300 + Math.floor(Math.random() * 400)
const profile = mkdtempSync(resolve(tmpdir(), 'vbrowser-'))

const proc = spawn(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=' + WIDTH + ',' + HEIGHT,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

function cleanup() {
  try {
    proc.kill()
  } catch {
    /* 已退出就算了 */
  }
}

/** 轮询等待 DevTools HTTP 端点就绪 */
async function waitForDevTools(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (r.ok) return await r.json()
    } catch {
      /* 还没起来 */
    }
    await sleep(300)
  }
  throw new Error('浏览器 DevTools 端点超时未就绪')
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.listeners = []
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve: res, reject: rej } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result)
      } else if (msg.method) {
        this.listeners.forEach((fn) => fn(msg))
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((res, rej) => this.pending.set(id, { resolve: res, reject: rej }))
  }
  on(fn) {
    this.listeners.push(fn)
  }
}

let version
try {
  version = await waitForDevTools()
} catch (e) {
  console.error('[verify-page]', e.message)
  cleanup()
  process.exit(2)
}

console.log(`[verify-page] 浏览器: ${version.Browser}`)

// 开一个新标签页
const newTab = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, {
  method: 'PUT',
})
const tab = await newTab.json()
if (!tab.webSocketDebuggerUrl) {
  console.error('[verify-page] 拿不到调试连接地址')
  cleanup()
  process.exit(2)
}

const errors = []
const warnings = []
const ws = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true })
  ws.addEventListener('error', rej, { once: true })
})

const cdp = new Cdp(ws)
cdp.on((m) => {
  if (m.method === 'Runtime.consoleAPICalled') {
    const type = m.params.type
    const text = (m.params.args || [])
      .map((a) => a.value ?? a.description ?? a.type)
      .join(' ')
    if (type === 'error') errors.push(`console.error: ${text}`)
    else if (type === 'warning') warnings.push(`console.warn: ${text}`)
  }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails || {}
    errors.push(`未捕获异常: ${d.text || ''} ${d.exception?.description || ''}`.trim())
  }
  if (m.method === 'Log.entryAdded') {
    const e = m.params.entry || {}
    if (e.level === 'error') errors.push(`浏览器日志: ${e.text}`)
  }
})

await cdp.send('Runtime.enable')
await cdp.send('Log.enable')
await cdp.send('Page.enable')
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: WIDTH,
  height: HEIGHT,
  deviceScaleFactor: 1,
  mobile: false,
})

await cdp.send('Page.navigate', { url })
await sleep(WAIT)

// 等字体加载完再截图，否则中文可能是回退字体
try {
  await Promise.race([cdp.send('document.readyState'), sleep(3000)])
  await cdp.send('Runtime.evaluate', {
    expression: 'document.fonts ? document.fonts.ready.then(()=>true) : true',
    awaitPromise: true,
    returnByValue: true,
  })
} catch {
  /* 字体等待失败不阻塞截图 */
}

// 可选：平滑滚动到目标区块，等动画走完再截
if (SCROLL_SEL) {
  const r = await cdp.send('Runtime.evaluate', {
    expression: `(() => { const el = document.querySelector(${JSON.stringify(SCROLL_SEL)}); if (!el) return 'MISSING'; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return 'OK' })()`,
    returnByValue: true,
  })
  if (r?.result?.value === 'MISSING') {
    errors.push(`滚动目标不存在: ${SCROLL_SEL}`)
  } else {
    await sleep(1600)
  }
}

const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
const buf = Buffer.from(shot.data, 'base64')

mkdirSync(dirname(resolve(outPath)), { recursive: true })
writeFileSync(resolve(outPath), buf)

const titleRes = await cdp.send('Runtime.evaluate', {
  expression: 'document.title',
  returnByValue: true,
})

console.log(`[verify-page] 标题: ${titleRes?.result?.value ?? '(空)'}`)
console.log(`[verify-page] 截图: ${resolve(outPath)} (${(buf.length / 1024).toFixed(1)} KB)`)
console.log(`[verify-page] console error: ${errors.length} 条 | warn: ${warnings.length} 条`)
errors.slice(0, 12).forEach((e) => console.error('   ✗ ' + e))
warnings.slice(0, 6).forEach((w) => console.warn('   ! ' + w))

try {
  ws.close()
} catch {
  /* ignore */
}
cleanup()

process.exit(errors.length > 0 ? 1 : 0)
