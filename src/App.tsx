import DataInspector from '@/components/DataInspector'
import Hero from '@/components/Hero'
import Honors from '@/components/Honors'
import Nav from '@/components/Nav'
import About from '@/components/About'
import Work from '@/components/Work'
import Contact from '@/components/Contact'

import { profile } from '@/lib/data'

/**
 * 阶段 2+ 合并后：
 * - Hero / Work（含单螺旋）/ Honors / About / Contact 全部是真组件
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
        <Hero />
        <Work />
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
