import DataInspector from '@/components/DataInspector'
import DigitalHumanIntro from '@/components/DigitalHumanIntro'
import Hero from '@/components/Hero'
import Honors from '@/components/Honors'
import Nav from '@/components/Nav'
import About from '@/components/About'
import Contact from '@/components/Contact'

import { profile } from '@/lib/data'

/**
 * 页面结构（2026-09-03 v5）：
 * - 最前：数字人 IP 板块（角色 + 四幕故事）
 * - 之后：真人内容。Hero 右栏即紧凑单螺旋照片墙（原 MZ 方碑位置），
 *   原独立 Work 区已并入 Hero，点击螺旋卡直接弹详情浮层。
 * - 加 ?debug 参数可回到「内容总览」页
 */
export default function App() {
  const debug =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')

  if (debug) return <DataInspector />

  return (
    <>
      <Nav />
      <main>
        <DigitalHumanIntro />
        <Hero />
        <Honors />
        <About />
        <Contact />
      </main>

      <footer className="border-t border-hairline py-8">
        <div className="container-page flex flex-wrap items-baseline justify-between gap-2 text-xs text-fg-2">
          <span>
            © {new Date().getFullYear()} {profile.name_zh} · {profile.name_en}
          </span>
          <span>{profile.tagline_en}</span>
        </div>
      </footer>
    </>
  )
}
