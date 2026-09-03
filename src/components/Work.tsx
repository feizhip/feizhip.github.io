import { useState } from 'react'

import PhotoDetailModal from '@/components/PhotoDetailModal'
import SpiralGallery from '@/components/SpiralGallery'

import { projects as projectsData } from '@/lib/data'
import type { Project } from '@/types/content'

/**
 * 作品 / 项目区块 v2
 * ------------------------------------------------------------
 * 整段 = 单螺旋照片墙 + 点击弹出详情浮层。
 * 不再有内联展开——点击当前卡 → 全屏 PhotoDetailModal。
 */
export default function Work() {
  const [openProject, setOpenProject] = useState<Project | null>(null)

  function open(p: Project) {
    setOpenProject(p)
  }

  function navigateTo(p: Project) {
    setOpenProject(p)
  }

  return (
    <section id="work" className="relative border-t border-hairline py-24">
      {/* 背景微光 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,var(--accent-2-soft),transparent_70%)] opacity-70 blur-3xl" />
      </div>

      <div className="container-page relative">
        {/* 标题 */}
        <div className="text-center">
          <p className="eyebrow">{projectsData.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {projectsData.title_zh}
          </h2>
          <p className="mt-2 text-sm tracking-wider2 text-fg-2 md:text-base">
            {projectsData.title_en}
          </p>
        </div>

        {/* 螺旋墙 */}
        <div className="mt-14">
          <SpiralGallery
            items={projectsData.items}
            onOpen={open}
            openId={openProject?.id ?? null}
          />
        </div>
      </div>

      {/* 详情浮层 */}
      {openProject && (
        <PhotoDetailModal
          project={openProject}
          allProjects={projectsData.items}
          onClose={() => setOpenProject(null)}
          onNavigate={navigateTo}
        />
      )}
    </section>
  )
}
