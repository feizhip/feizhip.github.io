/**
 * 全站内容数据类型
 * ------------------------------------------------------------
 * 改 src/data/*.json 时要同步改这里（唯一的事实来源）。
 * 字段是否必填、格式要求由 scripts/validate-data.mjs 在运行时兜底校验。
 */

/** 首页 Hero —— 姓名 / tagline / 简介 / CTA */
export interface Profile {
  eyebrow: string
  name_zh: string
  name_en: string
  tagline_zh: string
  tagline_en: string
  summary: string
  cta_primary_label: string
  cta_primary_target: string
  cta_secondary_label: string
  cta_secondary_target: string
  available_badge: string
  scroll_hint: string
}

export interface NavItem {
  id: string
  label_zh: string
  label_en: string
  href: string
}

/** 顶部导航 */
export interface Nav {
  logo_text: string
  /** 头像图片 URL（项目内路径或外链），填了就在左上角显示图片而不是文字 */
  logo_image?: string
  items: NavItem[]
  status_badge: string
  status_badge_target: string
}

export interface Metric {
  label: string
  value: string
}

/**
 * 单螺旋照片墙的一张卡 —— 也就是一个"项目"。
 * 开放式：网站、论文、活动等任何想展示的事都可塞进来。
 * 详情字段对各类项目通用，科研类项目额外填 venue/level/published_at/doi。
 */
export interface ProjectCover {
  /** 媒体类型：image | video。运行时由 scripts/validate-data.mjs 校验 */
  type: string
  /** 图片或视频的 URL，null = 显示程序生成的占位图 */
  src: string | null
  /** 卡面下方显示的图说 */
  caption: string | null
}

export interface Project {
  id: string
  title: string
  subtitle: string
  /** 项目周期，例如 "2026.05 - 至今" */
  period: string
  cover: ProjectCover
  /** 外链（产品官网 / 论文 DOI 等），无则 null */
  link: string | null
  /** 项目身份：独立开发 / 科研 / 团队 / 活动 等 */
  role: string
  summary: string
  highlights: string[]
  stack: string[]
  metrics: Metric[]
  /** 科研论文类专用 */
  venue?: string
  level?: string
  /** 期刊正式发表日期 YYYY-MM-DD */
  published_at?: string | null
  doi?: string
  /** 备用外链，DOI 论文用 */
  url?: string | null
}

export interface Projects {
  eyebrow: string
  title_zh: string
  title_en: string
  items: Project[]
}

export interface Honor {
  id: string
  title: string
  issuer: string | null
  level: string | null
  year: string | null
}

export interface Honors {
  eyebrow: string
  title_zh: string
  title_en: string
  items: Honor[]
}

export interface Education {
  school: string
  major: string
  degree: string
  period: string
  courses: string[]
}

export interface About {
  eyebrow: string
  title_zh: string
  title_en: string
  /** 个人照片路径（null 或不填 = 不显示） */
  photo?: string
  /** 照片说明 */
  photo_caption?: string
  bio: string[]
  personality: string[]
  interests: string[]
  skills: string[]
  education: Education
}

/**
 * 联系方式。
 * phone / wechat 属隐私字段：数据结构里保留，但页面默认不渲染。
 */
export interface Social {
  type: string
  label: string
  url: string | null
}

export interface Contact {
  eyebrow: string
  title_zh: string
  title_en: string
  email: string | null
  location: string | null
  phone: string | null
  wechat: string | null
  socials: Social[]
  cta_label: string
}
