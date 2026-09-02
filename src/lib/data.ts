/**
 * 数据加载层
 * ------------------------------------------------------------
 * 全站所有文案都从这里出去，组件里不允许写死任何内容文字。
 * 想改网站内容 → 改 src/data/*.json，不用碰组件。
 *
 * 这里用显式类型标注（而不是 as 断言），JSON 字段写错会被 tsc 直接拦下。
 */

import aboutJson from '@/data/about.json'
import contactJson from '@/data/contact.json'
import honorsJson from '@/data/honors.json'
import navJson from '@/data/nav.json'
import profileJson from '@/data/profile.json'
import projectsJson from '@/data/projects.json'

import type { About, Contact, Honors, Nav, Profile, Projects } from '@/types/content'

export const profile: Profile = profileJson
export const nav: Nav = navJson
/** 单螺旋照片墙数据源 = 作品/项目清单（开放式：网站、论文、活动都可塞） */
export const projects: Projects = projectsJson
export const honors: Honors = honorsJson
export const about: About = aboutJson
export const contact: Contact = contactJson

/** 打包出口，组件里 `import { data } from '@/lib/data'` 一把梭也行 */
export const data = {
  profile,
  nav,
  projects,
  honors,
  about,
  contact,
}

export type SiteData = typeof data
