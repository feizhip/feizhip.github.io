/**
 * 字体搬运工
 * ------------------------------------------------------------
 * 为什么需要这个脚本？
 *   @fontsource 的 CJK 字体（思源宋体）默认按 unicode-range 切成
 *   100+ 个子集，直接 import 会把 dist 撑到 ~15MB / 438 个文件。
 *   这里只挑出真正需要的 5 个 woff2 子集，拷到 public/fonts/，
 *   dist 降到 ~1.6MB / 5 个字体文件。
 *
 * 什么时候跑？
 *   npm install 之后自动跑（package.json 的 postinstall）
 *   手动重跑：npm run setup:fonts
 */

import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nm = join(root, 'node_modules', '@fontsource')
const out = join(root, 'public', 'fonts')

/** 需要拷贝到 public/fonts/ 的字体文件 */
const FILES = [
  ['inter/files/inter-latin-400-normal.woff2', 'inter-latin-400-normal.woff2'],
  ['inter/files/inter-latin-500-normal.woff2', 'inter-latin-500-normal.woff2'],
  ['inter/files/inter-latin-600-normal.woff2', 'inter-latin-600-normal.woff2'],
  [
    'noto-serif-sc/files/noto-serif-sc-latin-700-normal.woff2',
    'noto-serif-sc-latin-700-normal.woff2',
  ],
  [
    'noto-serif-sc/files/noto-serif-sc-chinese-simplified-700-normal.woff2',
    'noto-serif-sc-chinese-simplified-700-normal.woff2',
  ],
]

if (!existsSync(nm)) {
  console.error('[setup-fonts] 找不到 node_modules/@fontsource，请先运行 npm install')
  process.exit(1)
}

mkdirSync(out, { recursive: true })

let copied = 0
for (const [from, to] of FILES) {
  const src = join(nm, from)
  const dst = join(out, to)
  if (!existsSync(src)) {
    console.error(`[setup-fonts] 缺少字体文件：${from}`)
    console.error('             试试删掉 node_modules 后重新 npm install')
    process.exit(1)
  }
  copyFileSync(src, dst)
  copied += 1
}

console.log(`[setup-fonts] 已拷贝 ${copied} 个字体文件到 public/fonts/`)
