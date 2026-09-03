import { useEffect, useRef, useState, type CSSProperties, type WheelEvent } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Project } from '@/types/content'
import { cn } from '@/lib/cn'

interface Props {
  items: Project[]
  onOpen: (project: Project) => void
  openId: string | null
  /** 紧凑模式：嵌入 Hero 右栏用——尺寸缩小 + 滚轮仅在悬停时接管（不劫持页面滚动）） */
  compact?: boolean
}

/**
 * 单螺旋照片墙 v3 —— 螺旋楼梯（Helix Staircase）
 * ------------------------------------------------------------
 * 核心变化：从 v2 的「扁平圆环 + rotateX 倾斜」
 *        → 真正的 3D 螺旋楼梯，每张卡有 Y 轴垂直偏移。
 *
 * 几何原理：
 *   每张卡的位置 = rotateY(θ) translateZ(R) + translateY(H·sin(θ))
 *   - θ 决定水平圆周位置（前后左右）
 *   - sin(θ) 决定垂直高度 → 形成楼梯爬升/下降效果
 *   - 整体看起来像走上一座螺旋楼梯，每级台阶是一张项目卡片
 *
 * 交互不变：滚轮 / 拖拽 / 方向键 旋转螺旋，松手自动吸附最近卡，
 *         点击当前卡弹出详情浮层。
 */

const TAU = Math.PI * 2
const DRAG_SENS = 0.005
const WHEEL_SENS = 0.0035

/* ---- 螺旋楼梯参数（full 模式） ---- */
const RADIUS = 580          /* 水平圆环半径（增大让 8 张卡分散不挤） */
const HELIX_AMP = 150       /* 螺旋振幅（px）：最高卡 vs 最低卡的垂直差距的一半 */
const CARD_W = 320
const CARD_H = 420

/* ---- 紧凑模式参数（Hero 右栏） ---- */
const C_RADIUS = 305
const C_HELIX_AMP = 82
const C_CARD_W = 205
const C_CARD_H = 270

export default function SpiralGallery({ items, onOpen, openId, compact = false }: Props) {
  const [rotation, setRotation] = useState(0)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const mobileListRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef({ dragging: false, startX: 0, startR: 0 })
  /* 紧凑模式下，滚轮只在鼠标悬停于舞台上时才旋转（否则放行页面滚动） */
  const hoveredRef = useRef(false)

  /* 移动端箭头：按卡片宽度步进滚动 */
  function mobileScrollBy(dir: 1 | -1) {
    const el = mobileListRef.current
    if (!el) return
    const card = el.querySelector('div')
    const step = card?.getBoundingClientRect().width || el.clientWidth
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const RADIUS_ = compact ? C_RADIUS : RADIUS
  const HELIX_AMP_ = compact ? C_HELIX_AMP : HELIX_AMP
  const CARD_W_ = compact ? C_CARD_W : CARD_W
  const CARD_H_ = compact ? C_CARD_H : CARD_H

  /* 滚轮结束后吸附到最近卡 */
  const snapTimer = useRef<number | null>(null)
  function scheduleSnap() {
    if (snapTimer.current) window.clearTimeout(snapTimer.current)
    snapTimer.current = window.setTimeout(() => {
      setRotation((r) => {
        const step = TAU / N
        const target = -Math.round(-r / step) * step
        return target
      })
    }, 180)
  }

  function handleWheel(e: WheelEvent<HTMLDivElement>) {
    if (compact && !hoveredRef.current) return /* 悬停外：放行页面滚动 */
    e.preventDefault()
    setRotation((r) => r + e.deltaY * WHEEL_SENS)
    scheduleSnap()
  }

  /* 拖拽 */
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = { dragging: true, startX: e.clientX, startR: rotation }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.dragging) return
    const dx = e.clientX - dragRef.current.startX
    setRotation(dragRef.current.startR + dx * DRAG_SENS)
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.dragging) return
    dragRef.current.dragging = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch { /* noop */ }
    setRotation((r) => {
      const step = TAU / N
      return -Math.round(-r / step) * step
    })
  }

  /* 键盘 */
  function handleKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') setRotation((r) => r - TAU / items.length)
    else if (e.key === 'ArrowLeft') setRotation((r) => r + TAU / items.length)
  }

  /* 非 passive wheel */
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const onWheel = (ev: globalThis.WheelEvent) => {
      if (compact && !hoveredRef.current) return /* 悬停外：放行页面滚动 */
      ev.preventDefault()
      setRotation((r) => r + ev.deltaY * WHEEL_SENS)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [compact])

  const N = items.length
  const step = TAU / N
  const currentIdx = (() => {
    const a = Math.round(-rotation / step)
    return ((a % N) + N) % N
  })()

  return (
    <div className="select-none">
      {/* ---------- 桌面：3D 螺旋楼梯 ---------- */}
      <div
        ref={stageRef}
        role="region"
        aria-label="项目单螺旋照片墙"
        tabIndex={0}
        onKeyDown={handleKey}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => { hoveredRef.current = true }}
        onMouseLeave={() => { hoveredRef.current = false }}
        className={cn(
          'spiral-stage relative mx-auto hidden w-full cursor-grab touch-none outline-none focus-visible:ring-2 focus-visible:ring-accent sm:block',
          compact ? 'h-[440px] max-w-full' : 'h-[720px] max-w-[1500px]',
        )}
        style={{ perspective: compact ? '1500px' : '2000px', perspectiveOrigin: '50% 45%' }}
      >
        {/* 螺旋轴 —— — 不再需要 rotateX 大角度倾斜，螺旋自身提供纵深 */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(-8deg)`,  /* 微倾即可，楼梯效果主要靠 Y 偏移 */
          }}
        >
          {items.map((it, i) => {
            const angle = rotation + i * step
            const wrapped = ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI
            const frontness = (Math.cos(wrapped) + 1) / 2       // 1=前, 0=后
            const isFront = frontness > 0.88

            /* ---- 螺旋楼梯核心：Y轴偏移 ---- */
            // sin(wrapped) ∈ [-1, 1]，乘以振幅得到垂直位移
            // 正弦波让卡片在旋转时自然地"上楼下楼"
            const yOffset = -HELIX_AMP_ * Math.sin(wrapped)   // 负号让左侧卡片升高（符合直觉）

            /* ---- 纵深衰减 ---- */
            const scale = 0.55 + 0.45 * frontness
            const opacity = 0.12 + 0.88 * frontness
            const blur = (1 - frontness) * 6
            const zIndex = Math.round(frontness * 200) + Math.round(Math.abs(yOffset))

            return (
              <div
                key={it.id}
                className={cn(
                  'spiral-card absolute left-1/2 top-1/2 rounded-2xl overflow-hidden',
                  isFront
                    ? 'shadow-[0_40px_80px_-24px_rgba(120,70,20,0.38)]'
                    : '',
                )}
                style={
                  {
                    width: CARD_W_,
                    height: CARD_H_,
                    marginLeft: -CARD_W_ / 2,
                    marginTop: -CARD_H_ / 2,
                    /* 关键变化：加了 translateY 实现楼梯效果 */
                    transform: `translateY(${yOffset}px) rotateY(${angle}rad) translateZ(${RADIUS_}px) scale(${scale})`,
                    opacity,
                    filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
                    zIndex,
                    transition: 'transform 0.5s cubic-bezier(.22,.61,.36,1), opacity 0.5s ease, filter 0.5s ease',
                  } as CSSProperties
                }
              >
                <CardFace project={it} isFront={isFront} onOpen={onOpen} />
              </div>
            )
          })}
        </div>

        {/* 底部极简提示 */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-1 left-0 right-0 flex items-end justify-between px-8 text-[9px] tracking-[0.25em] text-fg-2/60 uppercase"
        >
          <span>Scroll / Drag</span>
          <span>Tap to Open</span>
        </div>
      </div>

      {/* ---------- 移动端：横滑列表 ---------- */}
      <div className="relative mt-4 sm:hidden">
        <div
          ref={mobileListRef}
          className="flex snap-x snap-proximity gap-3 overflow-x-auto pb-2"
          style={{
            touchAction: 'pan-x pan-y',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            scrollbarWidth: 'none',
          } as CSSProperties}
        >
          {items.map((it) => (
            <div
              key={it.id}
              className={cn(
                'relative w-[72vw] max-w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl',
                it.id === openId ? 'ring-2 ring-accent' : '',
              )}
              style={{ aspectRatio: '3 / 4' }}
            >
              <CardFace project={it} isFront mobile onOpen={onOpen} />
            </div>
          ))}
        </div>

        {/* 左右箭头：触摸滑不动时的兜底切换 */}
        <button
          type="button"
          aria-label="上一个项目"
          onClick={() => mobileScrollBy(-1)}
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-bg-0/85 text-fg-1 shadow-md backdrop-blur transition active:scale-90"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="下一个项目"
          onClick={() => mobileScrollBy(1)}
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-bg-0/85 text-fg-1 shadow-md backdrop-blur transition active:scale-90"
        >
          <ChevronRight size={18} />
        </button>

        <p className="mt-2 text-center text-[11px] text-fg-2">左右滑动或点箭头浏览 · 点卡片看详情</p>
      </div>

      {/* 指示点 */}
      <div className="mt-5 flex justify-center gap-2">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setRotation(-i * step)}
            aria-label={`切到第 ${i + 1} 个：${it.title}`}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === currentIdx ? 'w-7 bg-accent' : 'w-1.5 bg-fg-2/35 hover:bg-fg-2/60',
            )}
          />
        ))}
      </div>

      {/* 当前项标题（桌面） */}
      <p className="mt-4 hidden text-center sm:block">
        <span className="text-xs tracking-wider text-fg-2">
          {currentIdx + 1} / {N}
        </span>
        <span className="mx-3 text-fg-2/30">·</span>
        <span className="text-sm font-medium text-fg-1">{items[currentIdx]?.title}</span>
      </p>
    </div>
  )
}

/* ---------- 单张卡面 ---------- */

function CardFace({
  project,
  isFront,
  onOpen,
  mobile,
}: {
  project: Project
  isFront: boolean
  onOpen?: (p: Project) => void
  mobile?: boolean
}) {
  const { cover } = project
  const hasMedia = cover.src != null

  return (
    <button
      type="button"
      onClick={isFront && onOpen ? () => onOpen(project) : undefined}
      aria-label={`${project.title} · ${isFront ? '点击查看详情' : ''}`}
      tabIndex={isFront || mobile ? 0 : -1}
      className={cn(
        'group relative h-full w-full overflow-hidden rounded-2xl text-left',
        isFront || mobile ? 'cursor-pointer' : 'cursor-grab',
      )}
    >
      {/* 图片 / 占位 */}
      {hasMedia ? (
        cover.type === 'video' ? (
          <video
            src={cover.src!}
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img src={cover.src!} alt={cover.caption ?? project.title} className="h-full w-full object-cover" />
        )
      ) : (
        <PlaceholderCover title={project.title} subtitle={project.subtitle} />
      )}

      {/* 渐变遮罩 + 文字（压在图片上，暖棕色遮罩保可读） */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2a190a]/92 via-[#2a190a]/45 to-transparent p-5 pt-16">
        {/* 角色标签 */}
        <span className="mb-2 inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] tracking-wider text-white backdrop-blur-sm">
          {project.role}
        </span>
        <p className="font-display text-lg font-bold leading-tight text-white">
          {project.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-white/70">{project.subtitle}</p>
      </div>

      {/* 当前卡高光边框 */}
      {isFront && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset ring-white/50"
        />
      )}
    </button>
  )
}

function PlaceholderCover({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#f8efe0] via-[#f3e6cf] to-[#ecd9ba]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,var(--accent-2-soft),transparent_62%)]"
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-display text-2xl font-bold leading-tight text-[color:var(--fg-name)] md:text-3xl">
          {title}
        </p>
        <p className="h-px w-10 bg-[color:var(--accent-ring)]" />
        <p className="text-[10px] tracking-widest text-fg-2">{subtitle}</p>
      </div>
    </div>
  )
}