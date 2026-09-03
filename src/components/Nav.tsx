import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { gsap } from 'gsap'

import { nav } from '@/lib/data'
import { cn } from '@/lib/cn'
import '@/styles/PillNav.css'

/**
 * 药丸导航 PillNav（参考 GSAP PillNav 组件，适配本站）
 * ------------------------------------------------------------
 * - 白玻璃药丸；hover 时橙色圆从底部升起铺满，文字双层翻转
 * - 当前区块对应的药丸保持「点亮」状态（IntersectionObserver）
 * - logo hover 旋转 360°；首次加载 logo 弹出 + 菜单展开动画
 * - 滚动后整条导航加毛玻璃底 + 细分割线
 * - 移动端收进抽屉（胶囊式链接）
 */

const EASE = 'power3.easeOut'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('home')
  const [open, setOpen] = useState(false)

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([])
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([])
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([])
  const logoImgRef = useRef<HTMLImageElement | null>(null)
  const logoTweenRef = useRef<gsap.core.Tween | null>(null)
  const logoRef = useRef<HTMLAnchorElement | null>(null)
  const navItemsRef = useRef<HTMLDivElement | null>(null)

  /* 滚动后加毛玻璃背景 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* 滚动高亮：观察每个锚点区块，谁进入视口中部谁点亮 */
  useEffect(() => {
    const els = nav.items
      .map((it) => document.getElementById(it.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null)

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  /* 把「当前激活」的药丸点亮：圆铺满 + 文字换成奶油色 */
  function applyActive(activeId: string) {
    const activeIdx = nav.items.findIndex((it) => it.id === activeId)
    circleRefs.current.forEach((circle, i) => {
      if (!circle?.parentElement) return
      const pill = circle.parentElement
      const label = pill.querySelector<HTMLElement>('.pill-label')
      const white = pill.querySelector<HTMLElement>('.pill-label-hover')
      const h = pill.getBoundingClientRect().height
      activeTweenRefs.current[i]?.kill()
      if (i === activeIdx) {
        gsap.set(circle, { scale: 1.12, xPercent: -50 })
        if (label) gsap.set(label, { y: -(h + 8) })
        if (white) gsap.set(white, { y: 0, opacity: 1 })
      } else {
        gsap.set(circle, { scale: 0, xPercent: -50 })
        if (label) gsap.set(label, { y: 0 })
        if (white) gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 })
      }
    })
  }

  /* 布局：按药丸实际尺寸计算升起圆的几何（圆心在药丸底边中点） */
  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return
        const pill = circle.parentElement
        const rect = pill.getBoundingClientRect()
        const { width: w, height: h } = rect
        if (w === 0 || h === 0) return
        const R = ((w * w) / 4 + h * h) / (2 * h) /* 圆心在底边中点、覆盖整宽的最小圆半径 */
        const D = Math.ceil(2 * R) + 2
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
        const originY = D - delta

        circle.style.width = `${D}px`
        circle.style.height = `${D}px`
        circle.style.bottom = `-${delta}px`

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` })

        const label = pill.querySelector<HTMLElement>('.pill-label')
        const white = pill.querySelector<HTMLElement>('.pill-label-hover')
        if (label) gsap.set(label, { y: 0 })
        if (white) gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 })

        const index = circleRefs.current.indexOf(circle)
        if (index === -1) return

        tlRefs.current[index]?.kill()
        const tl = gsap.timeline({ paused: true })
        tl.to(circle, { scale: 1.12, xPercent: -50, duration: 2, ease: EASE, overwrite: 'auto' }, 0)
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease: EASE, overwrite: 'auto' }, 0)
        if (white) tl.to(white, { y: 0, opacity: 1, duration: 2, ease: EASE, overwrite: 'auto' }, 0)
        tlRefs.current[index] = tl
      })
      applyActive(active)
    }

    layout()
    const onResize = () => layout()
    window.addEventListener('resize', onResize)
    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {})
    }

    /* 首次加载：logo 弹出 + 菜单横向展开 */
    const logo = logoRef.current
    const navItems = navItemsRef.current
    if (logo) {
      gsap.set(logo, { scale: 0 })
      gsap.to(logo, { scale: 1, duration: 0.6, ease: EASE })
    }
    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: 'hidden', opacity: 0 })
      gsap.to(navItems, { width: 'auto', opacity: 1, duration: 0.6, ease: EASE, clearProps: 'width,overflow,opacity' })
    }

    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* 激活区块变化时重新点亮 */
  useEffect(() => {
    applyActive(active)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  /* hover 进出：时间轴 tweenTo 正/反放 */
  function handleEnter(i: number) {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease: EASE, overwrite: 'auto' })
  }
  function handleLeave(i: number) {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease: EASE, overwrite: 'auto' })
    /* 离开时如果是激活药丸，恢复点亮态 */
    const activeIdx = nav.items.findIndex((it) => it.id === active)
    if (i === activeIdx) {
      requestAnimationFrame(() => applyActive(active))
    }
  }

  function handleLogoEnter() {
    const img = logoImgRef.current
    if (!img) return
    logoTweenRef.current?.kill()
    gsap.set(img, { rotate: 0 })
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.2, ease: EASE, overwrite: 'auto' })
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled || open
          ? 'border-b border-hairline bg-[color:var(--bg-nav)] backdrop-blur-md'
          : 'border-b border-transparent',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo：hover 旋转，点击回顶部 */}
        <a
          ref={logoRef}
          href="#home"
          aria-label="回到顶部"
          className="pill-logo focus-ring"
          onMouseEnter={handleLogoEnter}
        >
          {nav.logo_image ? (
            <img ref={logoImgRef} src={nav.logo_image} alt="个人头像" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold tracking-wide text-accent">
              {nav.logo_text}
            </span>
          )}
        </a>

        {/* 桌面药丸组 */}
        <div ref={navItemsRef} className="pill-nav hidden md:block">
          <ul className="pill-list" role="menubar" aria-label="主导航">
            {nav.items.map((it, i) => (
              <li key={it.id} role="none">
                <a
                  role="menuitem"
                  href={it.href}
                  aria-label={it.label_zh}
                  aria-current={active === it.id ? 'true' : undefined}
                  className="pill focus-ring"
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el
                    }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{it.label_zh}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {it.label_zh}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 右侧：状态徽章 + 移动端菜单按钮 */}
        <div className="flex items-center gap-2">
          <a
            href={nav.status_badge_target}
            className="focus-ring hidden items-center gap-2 rounded-full border border-hairline bg-white/50 px-3.5 py-1.5 text-xs text-fg-1 backdrop-blur transition-colors hover:border-[color:var(--border-strong)] hover:text-fg-0 sm:flex"
          >
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            {nav.status_badge}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? '关闭菜单' : '打开菜单'}
            className="focus-ring rounded-md p-2 text-fg-1 transition-colors hover:text-fg-0 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* 移动端抽屉：胶囊式 */}
      <div
        className={cn(
          'overflow-hidden bg-[color:var(--bg-drawer)] backdrop-blur-md transition-[max-height] duration-300 ease-out md:hidden',
          open ? 'max-h-96 border-b border-hairline' : 'max-h-0',
        )}
      >
        <nav aria-label="移动端导航" className="container-page flex flex-col gap-2 py-3">
          {nav.items.map((it) => (
            <a
              key={it.id}
              href={it.href}
              onClick={() => setOpen(false)}
              className={cn(
                'mobile-pill focus-ring',
                active === it.id ? 'is-active' : 'text-fg-1',
              )}
            >
              <span className="text-sm">{it.label_zh}</span>
              <span className="text-[11px] tracking-widest opacity-70">{it.label_en}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
