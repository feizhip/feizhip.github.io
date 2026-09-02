import type { CSSProperties } from 'react'

import { profile } from '@/lib/data'

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
 * 右：CSS 玻璃方碑（纯 CSS，不引 Three.js）
 */
export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden">
      {/* 背景光晕 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="hero-glow absolute left-1/2 top-[-120px] h-[560px] w-[860px] max-w-[140vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)] blur-2xl" />
      </div>

      <div className="container-page relative grid items-center gap-14 pb-24 pt-32 md:grid-cols-[1.15fr_0.85fr] md:pt-28">
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

        {/* ---------- 右：玻璃方碑 ---------- */}
        <div aria-hidden className="relative mx-auto hidden h-[460px] w-[320px] select-none md:block">
          {/* 光柱 */}
          <div className="absolute left-1/2 top-[-10px] h-[68%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[color:var(--accent)] to-transparent opacity-40" />

          {/* 玻璃板 */}
          <div className="monolith absolute inset-x-8 top-20 h-[330px] overflow-hidden rounded-2xl border border-[color:var(--border-strong)] bg-gradient-to-b from-white/[0.07] to-white/[0.015] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            {/* 顶部金光 */}
            <div className="absolute inset-0 bg-[radial-gradient(130%_60%_at_50%_-10%,var(--accent-soft),transparent_62%)]" />
            {/* 内描边高光 */}
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent" />

            <div className="relative flex h-full flex-col items-center justify-center gap-4">
              <span className="font-display text-[68px] font-bold leading-none text-[color:var(--fg-name)]">
                {profile.name_en.split(' ').map((w) => w[0]).join('')}
              </span>
              <span className="h-px w-14 bg-[color:var(--accent-ring)]" />
              <span className="text-[10px] tracking-[0.32em] text-fg-2">PORTFOLIO · 2026</span>
            </div>
          </div>

          {/* 底座投影 */}
          <div className="absolute bottom-14 left-1/2 h-6 w-40 -translate-x-1/2 rounded-[50%] bg-black/60 blur-md" />

          {/* 上升粒子 */}
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="particle absolute rounded-full bg-accent"
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
        </div>
      </div>

      {/* 底部滚动提示 */}
      <p className="absolute inset-x-0 bottom-7 text-center text-[10px] tracking-[0.3em] text-fg-2">
        {profile.scroll_hint}
      </p>
    </section>
  )
}
