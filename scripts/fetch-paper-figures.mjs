/**
 * 论文配图提取器
 * ------------------------------------------------------------
 * 用本机 Edge 打开论文页面，把里面的 <figure> 图片和它自己的图注抓下来，
 * 存进 public/images/papers/，供螺旋照片展 / 项目封面使用。
 *
 * 图注一律用论文原文，不自己写，避免编造内容。
 *
 * 用法：
 *   node scripts/fetch-paper-figures.mjs <文章URL> <前缀> [最多几张]
 *
 * 例：
 *   node scripts/fetch-paper-figures.mjs https://doi.org/10.3389/fpls.2025.1643700 yolo11 3
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
]

const url = process.argv[2]
const prefix = process.argv[3] || 'fig'
const max = Number(process.argv[4] || 3)
/** 可选：只下载指定序号（用 --list 打出的序号，逗号分隔） */
const pickArg = process.argv[5] || ''

if (!url) {
  console.error(
    '用法: node scripts/fetch-paper-figures.mjs <文章URL> <前缀> [最多几张] [序号逗号分隔]',
  )
  process.exit(2)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'images', 'papers')

const browser = EDGE_CANDIDATES.find((p) => existsSync(p))
if (!browser) {
  console.error('[fetch-figures] 没找到 Edge 或 Chrome')
  process.exit(2)
}

const PORT = 9400 + Math.floor(Math.random() * 300)
const profile = join(await import('node:os').then((m) => m.tmpdir()), `fig-${Date.now()}`)
mkdirSync(profile, { recursive: true })

const proc = spawn(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

async function waitDevTools(timeoutMs = 20000) {
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
  throw new Error('浏览器 DevTools 端点超时')
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && this.pending.has(m.id)) {
        const { resolve: res, reject: rej } = this.pending.get(m.id)
        this.pending.delete(m.id)
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((res, rej) => this.pending.set(id, { resolve: res, reject: rej }))
  }
}

let version
try {
  version = await waitDevTools()
} catch (e) {
  console.error('[fetch-figures]', e.message)
  proc.kill()
  process.exit(2)
}
console.log(`[fetch-figures] 浏览器: ${version.Browser}`)

const tab = await (
  await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
).json()

const ws = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true })
  ws.addEventListener('error', rej, { once: true })
})
const cdp = new Cdp(ws)

await cdp.send('Page.enable')
await cdp.send('Runtime.enable')
await cdp.send('Page.navigate', { url })
await sleep(4000)

// 滚到底触发懒加载，再强制 eager
await cdp.send('Runtime.evaluate', {
  expression: 'window.scrollTo(0, document.body.scrollHeight)',
})
await sleep(2500)
await cdp.send('Runtime.evaluate', {
  expression: "document.querySelectorAll('img').forEach(i => { i.loading = 'eager' })",
})
await sleep(2500)
await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' })
await sleep(800)

const collectExpr = `(() => {
  const out = []
  document.querySelectorAll('figure').forEach((f, idx) => {
    const img = f.querySelector('img')
    if (!img) return
    const src = img.currentSrc || img.src
    if (!src || src.startsWith('data:')) return
    let cap = ''
    const fc = f.querySelector('figcaption')
    if (fc) cap = (fc.innerText || '').replace(/\\s+/g, ' ').trim()
    if (!cap) {
      const c = f.querySelector('.caption, .figure-caption, [class*="caption"]')
      if (c) cap = (c.innerText || '').replace(/\\s+/g, ' ').trim()
    }
    out.push({ idx, src, alt: img.alt || '', cap, w: img.naturalWidth, h: img.naturalHeight })
  })
  return out
})()`

const res = await cdp.send('Runtime.evaluate', {
  expression: collectExpr,
  returnByValue: true,
  awaitPromise: true,
})

const figures = (res?.result?.value || []).filter(
  (f) => f.w >= 300 && f.h >= 200 && /\.(jpe?g|png|webp)(\?|$)/i.test(f.src),
)

console.log(`[fetch-figures] 页面共找到 ${res?.result?.value?.length ?? 0} 个 figure，合格 ${figures.length} 个`)
console.log('[fetch-figures] 候选清单（序号 / 尺寸 / 图注）：')
figures.forEach((f, i) => {
  console.log(`  [${i}] ${f.w}x${f.h}  ${(f.cap || f.alt || '(无图注)').slice(0, 90)}`)
})

if (max <= 0) {
  console.log('\n[fetch-figures] max=0，只列清单不下载')
  try {
    ws.close()
  } catch {
    /* ignore */
  }
  proc.kill()
  process.exit(0)
}

mkdirSync(outDir, { recursive: true })

const picked = pickArg
  ? pickArg
      .split(',')
      .map((s) => figures[Number(s.trim())])
      .filter(Boolean)
  : figures.slice(0, max)
const saved = []

for (const [i, f] of picked.entries()) {
  const ext = (f.src.match(/\.(jpe?g|png|webp)(\?|$)/i)?.[1] || 'jpg').toLowerCase()
  const name = `${prefix}-${String(i + 1).padStart(2, '0')}.${ext === 'jpeg' ? 'jpg' : ext}`
  try {
    const r = await fetch(f.src, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        Referer: url,
      },
    })
    if (!r.ok) {
      console.error(`  ✗ ${name} 下载失败 HTTP ${r.status}`)
      continue
    }
    const buf = Buffer.from(await r.arrayBuffer())
    writeFileSync(join(outDir, name), buf)
    saved.push({ file: `/images/papers/${name}`, caption: f.cap, size: f.w + 'x' + f.h })
    console.log(`  ✓ ${name}  ${(buf.length / 1024).toFixed(0)} KB  ${f.w}x${f.h}`)
  } catch (e) {
    console.error(`  ✗ ${name} 出错: ${e.message}`)
  }
}

console.log('\n[fetch-figures] 结果 JSON：')
console.log(JSON.stringify(saved, null, 2))

try {
  ws.close()
} catch {
  /* ignore */
}
proc.kill()
console.log(`\n[fetch-figures] 图片目录: ${resolve(outDir)}`)
