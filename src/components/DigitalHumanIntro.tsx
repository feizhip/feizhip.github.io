import { useEffect, useRef, useState } from 'react'

import GlassSurface from '@/components/GlassSurface'
import { digitalHuman as dh } from '@/lib/data'
import type { DhStory } from '@/types/content'
import { cn } from '@/lib/cn'

/**
 * 数字人 IP 板块（页面最前，参考 Kiki's Space 结构）：
 * 1. Hero 横幅 —— 场景插画背景 + 大标题 + 简介
 * 2. 胶囊导航 —— 角色介绍 / 精选故事 / 真人作品
 * 3. 角色展示 —— 抠图立绘居中 + 浮动玻璃卡（CHARACTER / ITEM）
 * 4. 精选故事 —— 四段全宽故事视频 + 单一悬浮描述方块（随滚动切换内容）
 */

function HeroBanner() {
  return (
    <div className="container-page pt-6 md:pt-10">
      <div className="hero-circle-in relative overflow-hidden rounded-3xl border border-hairline">
        {/* 背景视频（物联谷动画）循环播放 + 暗化蒙版让文字可读 */}
        <video
          src="/videos/dh-hero-bg.mp4"
          poster="/images/dh/hero-bg-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-0/85 via-bg-0/65 to-bg-0/30" />
        {/* eyebrow 局部暗化蒙版：让 hero 顶部小标在视频强光下仍清晰可读 */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg-0/55 to-transparent" />
        {/* 中央暖白径向蒙版：让标题/简介区在视频强光下仍清晰可读 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_center,rgba(251,247,240,0.7)_0%,rgba(251,247,240,0.35)_45%,transparent_72%)]" />
        {/* 移动端加强蒙版：人物面部在窄屏比例偏大，额外加深中央覆盖让标题更稳 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_70%_at_50%_45%,rgba(251,247,240,0.55)_0%,rgba(251,247,240,0.18)_50%,transparent_78%)] md:hidden" />

        <div className="relative z-10 px-6 pb-12 pt-16 text-center md:pb-20 md:pt-24">
          <p className="inline-block rounded-full bg-bg-0/75 px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] text-fg-2 shadow-[0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur">
            {dh.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold text-fg-0 drop-shadow-[0_2px_6px_rgba(20,10,0,0.6)] md:text-6xl">
            {dh.welcome_zh}
            <span className="mt-2 block text-xl font-medium text-fg-2 drop-shadow-[0_1px_3px_rgba(20,10,0,0.7)] md:text-2xl">
              {dh.welcome_en}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-fg-1 drop-shadow-[0_1px_3px_rgba(20,10,0,0.55)] md:text-base">
            {dh.intro}
          </p>

          {/* 胶囊导航 */}
          <nav className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {dh.pill_nav.map((pill) => (
              <a
                key={pill.anchor}
                href={pill.anchor}
                className="focus-ring rounded-full border border-hairline bg-white/60 px-5 py-2 text-sm text-fg-1 shadow-[0_4px_16px_-6px_rgba(150,90,30,0.18)] backdrop-blur transition hover:border-accent/50 hover:bg-white/85 hover:text-fg-0"
              >
                {pill.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

function CharacterShowcase() {
  const c = dh.character
  return (
    <section id="dh-character" className="container-page mt-16 md:mt-24">
      <div className="relative mx-auto max-w-3xl">
        {/* 背后光圈：暖橙×暖黄梦幻光晕 */}
        <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,179,43,0.28),rgba(242,100,25,0.1)_55%,transparent_70%)] md:h-[460px] md:w-[460px]" />

        {/* 角色抠图立绘（hover 放大） */}
        <div className="relative z-10 mx-auto w-[240px] transition-transform duration-300 ease-out hover:scale-[1.06] md:w-[320px]">
          <img
            src={c.cutout}
            alt={`数字人形象 ${c.name}`}
            className="block w-full drop-shadow-[0_24px_40px_rgba(140,80,20,0.3)]"
          />
        </div>

        {/* CHARACTER 浮动卡（左上 · hover 放大） */}
        <div className="absolute left-0 top-0 z-20 hidden w-52 transition-transform duration-300 ease-out hover:scale-110 md:block">
          <div className="glass dh-float-a rounded-2xl p-4">
            <p className="eyebrow">CHARACTER</p>
            <p className="mt-1 font-display text-2xl font-bold text-fg-0">{c.name}</p>
            <p className="mt-1 text-xs text-fg-2">{c.name_en}</p>
            <p className="mt-2 text-xs leading-relaxed text-fg-1">{c.tags.join(' · ')}</p>
          </div>
        </div>

        {/* ITEM 浮动卡（右上 · hover 放大） */}
        <div className="absolute right-0 top-6 z-20 hidden w-52 transition-transform duration-300 ease-out hover:scale-110 md:block">
          <div className="glass dh-float-b rounded-2xl p-4">
            <p className="eyebrow">{c.item_label}</p>
            <p className="mt-1 text-base font-semibold text-fg-0">{c.item_name}</p>
            <p className="mt-1 text-xs leading-relaxed text-fg-2">{c.item_desc}</p>
          </div>
        </div>

        {/* 小屏：浮动卡改为并排 */}
        <div className="mt-6 grid gap-3 md:hidden">
          <div className="glass rounded-2xl p-4">
            <p className="eyebrow">CHARACTER</p>
            <p className="mt-1 font-display text-xl font-bold text-fg-0">{c.name}</p>
            <p className="mt-1 text-xs text-fg-1">{c.tags.join(' · ')}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="eyebrow">{c.item_label}</p>
            <p className="mt-1 text-sm font-semibold text-fg-0">{c.item_name}</p>
            <p className="mt-1 text-xs text-fg-2">{c.item_desc}</p>
          </div>
        </div>
      </div>

      {/* 大名字 + 金句 */}
      <div className="mt-10 text-center">
        <p className="font-display text-5xl font-bold tracking-wide text-fg-0 md:text-7xl">
          {c.name_en}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm italic leading-relaxed text-fg-2">
          「{c.quote}」
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 精选故事：四段全宽视频 + 单一悬浮描述方块                             */
/* （GlassSurface 玻璃质感 · 方块本体常驻，仅文字层交叉渐变切换）        */
/* ------------------------------------------------------------------ */

function StoryVideo({ story }: { story: DhStory }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-hairline">
      {story.video ? (
        <video
          src={story.video}
          poster={story.poster}
          autoPlay
          muted
          loop
          playsInline
          className="h-[68vh] min-h-[420px] w-full object-cover md:h-[78vh]"
        />
      ) : (
        <img
          src={story.poster}
          alt={story.title_zh}
          className="h-[68vh] min-h-[420px] w-full object-cover md:h-[78vh]"
        />
      )}
      {/* 暖棕轻遮罩（让悬浮方块更易读，但不盖住视频细节） */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2a190a]/55 via-transparent to-[#2a190a]/15" />

      {/* 视频待投放徽标（仅占位卡显示） */}
      {!story.video && (
        <span className="absolute right-4 top-4 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs text-fg-1 shadow-sm backdrop-blur">
          视频待投放
        </span>
      )}
    </div>
  )
}

function Stories() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [inSection, setInSection] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const pillRef = useRef<HTMLDivElement | null>(null)
  const act4SeenRef = useRef(false) // 标记 act4 是否曾被滚到屏幕中部

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[]
    if (cards.length === 0) return

    /* 段级可见性：section 在屏幕中部（top/bottom 各 50vh 边界内）→ 显示，否则关闭。
       用这个代替之前的 firstObs——更稳健，不受 act1 滚出影响。 */
    const secObs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInSection(true)
        else setInSection(false)
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )
    secObs.observe(sectionRef.current!)

    /* 「快结束」补充关闭：act4 曾被滚到屏幕中部（act4Seen=true），
       且现在仅剩 < 30% 可见 → 关闭方块。
       用 ref 记录「曾展示过」避免前面卡片时（act3 顶部对齐屏幕顶部时
       act4 在屏幕底部露 18%）误关闭。 */
    const lastCard = cards[cards.length - 1]
    const endObs = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.5) act4SeenRef.current = true
        if (act4SeenRef.current && e.intersectionRatio < 0.3) setInSection(false)
      },
      { threshold: [0, 0.3, 0.5] },
    )
    if (lastCard) endObs.observe(lastCard)

    /* 卡级追踪：哪张卡最居中就激活哪张 */
    const cardObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const idx = Number((e.target as HTMLElement).dataset.idx)
          if (e.intersectionRatio >= 0.45) setActiveIdx(idx)
        })
      },
      { threshold: [0.25, 0.45, 0.6, 0.8] },
    )
    cards.forEach((c) => cardObs.observe(c))

    return () => {
      secObs.disconnect()
      endObs.disconnect()
      cardObs.disconnect()
    }
  }, [])

  /* 方块位置：跟随当前激活卡的屏幕位置（实时 rAF 计算）
     这样方块始终「嵌」在视频卡的中下部，不再 fixed 屏幕中央脱离画面。 */
  useEffect(() => {
    if (!inSection) return
    let raf = 0
    const update = () => {
      raf = 0
      const card = cardRefs.current[activeIdx]
      if (card && pillRef.current) {
        const r = card.getBoundingClientRect()
        const vh = window.innerHeight || 1
        const desiredY = r.top + r.height * 0.55   // 卡的中下部（屏幕坐标）
        const offsetY = desiredY - vh * 0.5         // 相对屏幕中央的偏移
        pillRef.current.style.transform = `translate(-50%, calc(-50% + ${offsetY}px))`
      }
      raf = requestAnimationFrame(update)
    }
    update()
    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [activeIdx, inSection])

  return (
    <section id="dh-stories" ref={sectionRef} className="container-page mt-20 md:mt-28">
      {/* 标题 */}
      <div className="flex items-end justify-between">
        <p className="eyebrow">SELECTED STORIES</p>
        <h2 className="font-display text-3xl font-bold text-fg-0 md:text-5xl">
          {dh.stories_title_en}
        </h2>
      </div>
      <p className="mt-1 font-display text-xl font-bold text-fg-0 md:text-2xl">
        {dh.stories_title_zh}
      </p>

      {/* 堆叠的全宽故事视频 */}
      <div className="mt-8 space-y-8">
        {dh.stories.map((story, i) => (
          <div
            key={story.id}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            data-idx={i}
          >
            <StoryVideo story={story} />
          </div>
        ))}
      </div>

      {/* 单一悬浮描述方块（玻璃质感 · 内部装当前故事画面作背景 · 文字层交叉渐变） */}
      <div
        ref={pillRef}
        aria-hidden={!inSection}
        className={cn(
          'pointer-events-none fixed left-1/2 top-1/2 z-40 -translate-x-1/2 transition-opacity duration-500',
          inSection ? 'opacity-100' : 'opacity-0',
        )}
      >
        <GlassSurface radius={60} className="w-[min(92vw,600px)] shadow-[0_70px_140px_-36px_rgba(60,30,8,0.75)]">
          <div className="relative h-[246px] overflow-hidden rounded-[inherit] md:h-[236px]">
            {/* 背景：当前故事画面（视频首帧 / 场景近景）—— 参考 Kiki's Space */}
            {dh.stories.map((story, i) => (
              <img
                key={story.id}
                src={story.pill_bg ?? story.poster}
                alt=""
                aria-hidden
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
                  i === activeIdx ? 'opacity-100' : 'opacity-0',
                )}
              />
            ))}

            {/* 暖棕渐变让白字清晰，画面清晰可见 */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a0f06]/15 via-[#1a0f06]/15 to-[#1a0f06]/40" />

            {/* 四块文字面板（白字，堆叠交叉渐变） */}
            <div className="relative h-full">
              {dh.stories.map((story, i) => {
                const on = i === activeIdx
                return (
                  <div
                    key={story.id}
                    aria-hidden={!on}
                    className={cn(
                      'absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-8 py-5 text-center transition-all duration-500 ease-out md:px-10',
                      on
                        ? 'opacity-100 translate-y-0'
                        : 'pointer-events-none translate-y-2.5 opacity-0',
                    )}
                  >
                    <p className="text-[10px] uppercase leading-relaxed tracking-[0.16em] text-white/85 sm:tracking-[0.22em]">
                      {story.eyebrow} · {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-bold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-2xl md:text-[27px]">
                      {story.title_zh}
                    </h3>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)] sm:text-xs sm:tracking-widest">
                      {story.title_en}
                    </p>
                    <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)] sm:text-sm">
                      {story.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </GlassSurface>
      </div>
    </section>
  )
}

export default function DigitalHumanIntro() {
  return (
    <section id="digital-human" className="pb-10 pt-2 md:pb-16">
      <HeroBanner />
      <CharacterShowcase />
      <Stories />
    </section>
  )
}
