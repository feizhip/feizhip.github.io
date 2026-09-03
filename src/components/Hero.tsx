import { useState, type CSSProperties } from 'react'

import PhotoDetailModal from '@/components/PhotoDetailModal'
import SpiralGallery from '@/components/SpiralGallery'

import { profile, projects } from '@/lib/data'
import type { Project } from '@/types/content'

/** 粒子位置手工排布，避免每次渲染随机跳动 */
const PARTICLES = [
  { left: '12%', top: '68%', size: 3, dur: '7s', delay: '0s' },
  { left: '26%', top: '82%', size: 2, dur: '9s', delay: '1.4s' },
  { left: '44%', top: '90%', size: 4, dur: '6s', delay: '0.6s' },
  { left: '58%', top: '76%', size: 2, dur: '8s', delay: '2.2s' },
  { left: '72%', top: '88%', size: 3, dur: '7.5s', delay: '3s' },
  { left: '86%', top: '70%', size: 2, dur: '10s', delay: '1s' },
  { left: '92%', top: '84%', size: 3, dur: '6.5s', delay: '2.6s' },
  { left: '5%', top: '88%', size: 2, dur: '8.5s', delay: '3.4s' },
]

/**
 * 首屏 Hero
 * 左：姓名 / 中英 tagline / 简介 / 两个 CTA / 状态徽章
 * 右：紧凑版单螺旋照片墙（原来 MZ 玻璃方碑的位置）——滚轮/拖拽旋转，点击弹详情
 */
export default function Hero() {
  const [openProject, setOpenProject] = useState<Project | null>(null)

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden">
      {/* 背景光晕 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="hero-glow absolute left-1/2 top-[-120px] h-[560px] w-[860px] max-w-[140vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)] blur-2xl" />
      </div>

      <div className="container-page relative grid grid-cols-1 items-center gap-10 pb-24 pt-28 md:grid-cols-[1.1fr_0.9fr] md:pt-24">
        {/* ---------- 左：文字 ---------- */}
        <div>
          <p className="eyebrow">{profile.eyebrow}</p>

          <h1 className="mt-5 font-display font-bold leading-[1.02] tracking-tight text-[color:var(--fg-name)] text-[clamp(3.2rem,9vw,6.5rem)]">
            {profile.name_zh}
          </h1>

          <p className="mt-4 font-display text-lg text-fg-1 md:text-xl">{profile.tagline_zh}</p>
          <p className="mt-1.5 text-base tracking-wider2 text-accent md:text-lg">
            {profile.tagline_en}
          </p>

          <p className="mt-8 max-w-xl text-sm leading-relaxed text-fg-1 md:text-[15px]">
            {profile.summary}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={profile.cta_primary_target}
              className="focus-ring rounded-full bg-accent px-7 py-3 text-sm font-medium text-[color:var(--bg-0)] transition-transform duration-200 hover:scale-[1.04]"
            >
              {profile.cta_primary_label}
            </a>
            <a
              href={profile.cta_secondary_target}
              className="focus-ring rounded-full border border-hairline px-7 py-3 text-sm text-fg-1 transition-colors duration-200 hover:border-[color:var(--border-strong)] hover:text-fg-0"
            >
              {profile.cta_secondary_label}
            </a>
          </div>

          <p className="mt-11 text-[11px] tracking-[0.16em] text-fg-2">
            {profile.available_badge}
          </p>
        </div>

        {/* ---------- 右：紧凑单螺旋照片墙 ---------- */}
        <div className="relative min-w-0 select-none">
          {/* 螺旋背后的暖光 */}
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[340px] w-[340px] rounded-full bg-[radial-gradient(closest-side,var(--accent-2-soft),transparent)] blur-xl" />
          </div>

          {/* 上升粒子（保留少量氛围） */}
          {PARTICLES.slice(0, 4).map((p, i) => (
            <span
              key={i}
              aria-hidden
              className="particle pointer-events-none absolute rounded-full bg-accent"
              style={
                {
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                  '--pdur': p.dur,
                  '--pdelay': p.delay,
                } as CSSProperties
              }
            />
          ))}

          <SpiralGallery
            compact
            items={projects.items}
            onOpen={setOpenProject}
            openId={openProject?.id ?? null}
          />
        </div>
      </div>

      {/* 底部滚动提示 */}
      <p className="absolute inset-x-0 bottom-7 text-center text-[10px] tracking-[0.3em] text-fg-2">
        {profile.scroll_hint}
      </p>

      {/* 项目详情浮层 */}
      {openProject && (
        <PhotoDetailModal
          project={openProject}
          allProjects={projects.items}
          onClose={() => setOpenProject(null)}
          onNavigate={setOpenProject}
        />
      )}
    </section>
  )
}
