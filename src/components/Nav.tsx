import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import { nav } from '@/lib/data'
import { cn } from '@/lib/cn'

/**
 * 顶部固定导航
 * - 滚动后从纯透明变成毛玻璃 + 底部细线
 * - 当前所在区块的链接高亮（IntersectionObserver）
 * - 移动端收进抽屉
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('home')
  const [open, setOpen] = useState(false)

  /* 滚动超过一點就加毛玻璃背景 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* 滚动高亮：观察每个锚点区块，谁进入视口中部谁高亮 */
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
      /* 视口中偏上的一条带，避免底部区块提前抢高亮 */
      { rootMargin: '-40% 0px -55% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

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
        {/* Logo：回顶部，文字 / 头像二选一（nav.json 的 logo_image 优先） */}
        <a
          href="#home"
          aria-label="回到顶部"
          className="focus-ring relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[color:var(--accent-ring)]"
        >
          {nav.logo_image ? (
            <img
              src={nav.logo_image}
              alt="个人头像"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold tracking-wide text-accent">
              {nav.logo_text}
            </span>
          )}
        </a>

        {/* 桌面导航 */}
        <nav aria-label="主导航" className="hidden items-center gap-7 md:flex">
          {nav.items.map((it) => (
            <a
              key={it.id}
              href={it.href}
              aria-current={active === it.id ? 'true' : undefined}
              className={cn(
                'focus-ring relative py-1 text-sm transition-colors',
                active === it.id ? 'text-fg-0' : 'text-fg-2 hover:text-fg-1',
              )}
            >
              {it.label_zh}
              <span
                aria-hidden
                className={cn(
                  'absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent transition-opacity',
                  active === it.id ? 'opacity-100' : 'opacity-0',
                )}
              />
            </a>
          ))}
        </nav>

        {/* 右侧：状态徽章 + 移动端菜单按钮 */}
        <div className="flex items-center gap-2">
          <a
            href={nav.status_badge_target}
            className="focus-ring hidden items-center gap-2 rounded-full border border-hairline px-3.5 py-1.5 text-xs text-fg-1 transition-colors hover:border-[color:var(--border-strong)] sm:flex"
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

      {/* 移动端抽屉 */}
      <div
        className={cn(
          'overflow-hidden bg-[color:var(--bg-drawer)] backdrop-blur-md transition-[max-height] duration-300 ease-out md:hidden',
          open ? 'max-h-80 border-b border-hairline' : 'max-h-0',
        )}
      >
        <nav aria-label="移动端导航" className="container-page flex flex-col py-2">
          {nav.items.map((it) => (
            <a
              key={it.id}
              href={it.href}
              onClick={() => setOpen(false)}
              className={cn(
                'focus-ring flex items-baseline justify-between border-b border-hairline py-3 text-sm last:border-b-0',
                active === it.id ? 'text-accent' : 'text-fg-1',
              )}
            >
              <span>{it.label_zh}</span>
              <span className="text-[11px] tracking-widest text-fg-2">{it.label_en}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
