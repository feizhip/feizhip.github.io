/**
 * 数据校验
 * ------------------------------------------------------------
 * 检查 src/data/*.json 的字段是否齐全、格式是否正确。
 *
 *   node scripts/validate-data.mjs            # 警告模式（dev 用，不阻断）
 *   node scripts/validate-data.mjs --strict   # 严格模式（build 用，有错就退出码 1）
 *
 * 为什么需要它？
 *   JSON 里少写一个字段，页面上就是一片空白，很难一眼看出是数据问题。
 *   这个脚本在打包前把问题挡下来，并精确到「哪个文件 · 哪个字段 · 为什么」。
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(root, 'src', 'data')
const strict = process.argv.includes('--strict')

const problems = []
const notes = []

const fail = (file, where, msg) => problems.push({ file, where, msg })
const note = (file, where, msg) => notes.push({ file, where, msg })

function load(name) {
  const p = join(dataDir, name)
  if (!existsSync(p)) {
    fail(name, '', '文件不存在')
    return null
  }
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch (e) {
    fail(name, '', `不是合法的 JSON：${e.message}`)
    return null
  }
}

/* ---------- 小工具 ---------- */
const isStr = (v) => typeof v === 'string' && v.trim().length > 0
const isStrOrNull = (v) => v === null || isStr(v)
const isStrArr = (v) => Array.isArray(v) && v.every(isStr)
const isAnchor = (v) => isStr(v) && v.startsWith('#')

function isUrl(v) {
  if (!isStr(v)) return false
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

const isEmail = (v) => isStr(v) && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

/** 必填字符串 */
function needStr(file, obj, key, at) {
  if (!isStr(obj?.[key])) fail(file, `${at}.${key}`, '必填，必须是非空字符串')
}

/** 可空字符串（字段必须存在，允许 null） */
function needOptStr(file, obj, key, at) {
  if (!(key in (obj || {}))) {
    fail(file, `${at}.${key}`, '字段缺失（不需要就填 null）')
  } else if (!isStrOrNull(obj[key])) {
    fail(file, `${at}.${key}`, '必须是字符串或 null')
  }
}

/** 字符串数组 */
function needStrArr(file, obj, key, at) {
  if (!isStrArr(obj?.[key])) fail(file, `${at}.${key}`, '必须是字符串数组')
}

/** 列表内 id 不能重复 */
function checkUniqueIds(file, items, at) {
  if (!Array.isArray(items)) return
  const seen = new Set()
  items.forEach((it, i) => {
    const id = it?.id
    if (!isStr(id)) {
      fail(file, `${at}[${i}].id`, '必填，必须是非空字符串')
      return
    }
    if (seen.has(id)) fail(file, `${at}[${i}].id`, `id "${id}" 重复了`)
    seen.add(id)
  })
}

/* ============================================================
   逐文件检查
   ============================================================ */

function checkProfile() {
  const f = 'profile.json'
  const d = load(f)
  if (!d) return
  ;['eyebrow', 'name_zh', 'name_en', 'tagline_zh', 'tagline_en', 'summary',
    'cta_primary_label', 'cta_secondary_label', 'available_badge', 'scroll_hint',
  ].forEach((k) => needStr(f, d, k, 'profile'))

  if (!isAnchor(d.cta_primary_target)) {
    fail(f, 'profile.cta_primary_target', '必须是 # 开头的锚点，例如 "#work"')
  }
  if (!isAnchor(d.cta_secondary_target)) {
    fail(f, 'profile.cta_secondary_target', '必须是 # 开头的锚点，例如 "#about"')
  }
}

function checkNav() {
  const f = 'nav.json'
  const d = load(f)
  if (!d) return
  needStr(f, d, 'logo_text', 'nav')
  needStr(f, d, 'status_badge', 'nav')
  if (!isAnchor(d.status_badge_target)) {
    fail(f, 'nav.status_badge_target', '必须是 # 开头的锚点')
  }
  if (!Array.isArray(d.items) || d.items.length === 0) {
    fail(f, 'nav.items', '至少要有 1 个导航项')
    return
  }
  d.items.forEach((it, i) => {
    const at = `nav.items[${i}]`
    ;['id', 'label_zh', 'label_en'].forEach((k) => needStr(f, it, k, at))
    if (!isAnchor(it?.href)) fail(f, `${at}.href`, '必须是 # 开头的锚点')
  })
}

function checkProjects() {
  const f = 'projects.json'
  const d = load(f)
  if (!d) return
  ;['eyebrow', 'title_zh', 'title_en'].forEach((k) => needStr(f, d, k, 'projects'))
  if (!Array.isArray(d.items) || d.items.length === 0) {
    fail(f, 'projects.items', '至少要有 1 个项目')
    return
  }
  checkUniqueIds(f, d.items, 'projects.items')
  d.items.forEach((it, i) => {
    const at = `projects.items[${i}]`
    ;['title', 'subtitle', 'period', 'summary'].forEach((k) => needStr(f, it, k, at))
    if (it?.link != null && !isUrl(it.link)) {
      fail(f, `${at}.link`, `"${it.link}" 不是合法网址（要以 http:// 或 https:// 开头）`)
    }
    if (it?.url != null && !isUrl(it.url)) {
      fail(f, `${at}.url`, '不是合法网址')
    }
    needStrArr(f, it, 'highlights', at)
    needStrArr(f, it, 'stack', at)
    if (!Array.isArray(it?.metrics)) fail(f, `${at}.metrics`, '必须是数组（没有就填 []）')
    else
      it.metrics.forEach((m, j) => {
        ;['label', 'value'].forEach((k) => needStr(f, m, k, `${at}.metrics[${j}]`))
      })

    /* cover 必须是 { type: 'image'|'video', src: string|null, caption: string|null } */
    const c = it?.cover
    if (!c || typeof c !== 'object') {
      fail(f, `${at}.cover`, '必须是对象 { type, src, caption? }')
    } else {
      if (c.type !== 'image' && c.type !== 'video') {
        fail(f, `${at}.cover.type`, '必须是 "image" 或 "video"')
      }
      needOptStr(f, c, 'src', `${at}.cover`)
      needOptStr(f, c, 'caption', `${at}.cover`)
      if (c.src != null && !isUrl(c.src) && !c.src.startsWith('/')) {
        fail(f, `${at}.cover.src`, `"${c.src}" 不是合法 URL（外链 http(s):// 或站内路径 /...）`)
      }
      if (c.src == null) note(f, `${at}.cover.src`, '暂无媒体，页面会显示占位图')
    }

    /* 科研论文类专用字段（都可选，但类型要正确） */
    if ('published_at' in (it || {})) {
      if (it.published_at != null && !/^\d{4}-\d{2}-\d{2}$/.test(it.published_at)) {
        fail(f, `${at}.published_at`, '日期格式必须是 YYYY-MM-DD')
      }
    }
    if (it?.venue != null && !isStr(it.venue)) {
      fail(f, `${at}.venue`, '必须是字符串或 null')
    }
    if (it?.level != null && !isStr(it.level)) {
      fail(f, `${at}.level`, '必须是字符串或 null')
    }
    if (it?.doi != null && !isStr(it.doi)) {
      fail(f, `${at}.doi`, '必须是字符串或 null')
    }
  })
}

function checkHonors() {
  const f = 'honors.json'
  const d = load(f)
  if (!d) return
  ;['eyebrow', 'title_zh', 'title_en'].forEach((k) => needStr(f, d, k, 'honors'))
  if (!Array.isArray(d.items) || d.items.length === 0) {
    fail(f, 'honors.items', '至少要有 1 个奖项')
    return
  }
  checkUniqueIds(f, d.items, 'honors.items')
  d.items.forEach((it, i) => {
    const at = `honors.items[${i}]`
    needStr(f, it, 'title', at)
    ;['issuer', 'level', 'year'].forEach((k) => needOptStr(f, it, k, at))
  })
}

function checkAbout() {
  const f = 'about.json'
  const d = load(f)
  if (!d) return
  ;['eyebrow', 'title_zh', 'title_en'].forEach((k) => needStr(f, d, k, 'about'))
  ;['bio', 'personality', 'interests', 'skills'].forEach((k) => needStrArr(f, d, k, 'about'))

  const e = d.education
  if (!e || typeof e !== 'object') {
    fail(f, 'about.education', '缺失或不是对象')
    return
  }
  ;['school', 'major', 'degree', 'period'].forEach((k) => needStr(f, e, k, 'about.education'))
  needStrArr(f, e, 'courses', 'about.education')
}

function checkContact() {
  const f = 'contact.json'
  const d = load(f)
  if (!d) return
  ;['eyebrow', 'title_zh', 'title_en', 'cta_label'].forEach((k) => needStr(f, d, k, 'contact'))

  needOptStr(f, d, 'email', 'contact')
  if (d?.email != null && !isEmail(d.email)) {
    fail(f, 'contact.email', `"${d.email}" 不是合法的邮箱地址`)
  }
  needOptStr(f, d, 'location', 'contact')
  ;['phone', 'wechat'].forEach((k) => {
    needOptStr(f, d, k, 'contact')
    if (d?.[k] != null) {
      note(f, `contact.${k}`, '隐私字段已填写，但页面默认不展示（需要展示要说一声）')
    } else {
      note(f, `contact.${k}`, '暂未填写，页面会跳过该字段')
    }
  })

  if (!Array.isArray(d?.socials)) {
    fail(f, 'contact.socials', '必须是数组（没有就填 []）')
    return
  }
  d.socials.forEach((s, i) => {
    const at = `contact.socials[${i}]`
    ;['type', 'label'].forEach((k) => needStr(f, s, k, at))
    needOptStr(f, s, 'url', at)
    if (s?.url != null && !isUrl(s.url)) {
      fail(f, `${at}.url`, '不是合法网址（要以 http:// 或 https:// 开头）')
    }
    if (s?.url == null) note(f, `${at}.url`, '暂无链接，页面会灰显')
  })
  if (d?.email == null) note(f, 'contact.email', '没填邮箱，HR 会联系不上')
}

/* ============================================================
   执行
   ============================================================ */

const CHECKS = [
  checkProfile,
  checkNav,
  checkProjects,
  checkHonors,
  checkAbout,
  checkContact,
]

console.log(`[validate-data] 检查 src/data/ 下 ${CHECKS.length} 个数据文件（${strict ? '严格' : '警告'}模式）`)

for (const fn of CHECKS) {
  try {
    fn()
  } catch (e) {
    fail('(未知)', fn.name, `检查脚本自身出错：${e.message}`)
  }
}

if (problems.length > 0) {
  console.error(`\n[validate-data] ✗ 发现 ${problems.length} 个问题：\n`)
  const byFile = new Map()
  for (const p of problems) {
    if (!byFile.has(p.file)) byFile.set(p.file, [])
    byFile.get(p.file).push(p)
  }
  for (const [file, list] of byFile) {
    console.error(`  ${file}`)
    for (const p of list) {
      console.error(`    ✗ ${p.where || file} — ${p.msg}`)
    }
    console.error('')
  }
  if (strict) {
    console.error('  打包已中止。修好上面的问题再运行 npm run build。\n')
    process.exit(1)
  } else {
    console.error('  这些问题会在 npm run build 时阻断打包，建议现在就修。\n')
  }
} else {
  console.log('[validate-data] ✓ 必填字段与格式全部通过')
}

if (notes.length > 0) {
  console.log(`[validate-data] ${notes.length} 条提醒（不阻断）：`)
  for (const n of notes) {
    console.log(`    · ${n.file} → ${n.where}：${n.msg}`)
  }
  console.log('')
}

process.exit(strict && problems.length > 0 ? 1 : 0)
