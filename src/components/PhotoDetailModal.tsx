import { useEffect, useCallback } from 'react'

import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react'

import type { Project } from '@/types/content'
import { cn } from '@/lib/cn'

/**
 * 项目详情浮层
 * ------------------------------------------------------------
 * 点击螺旋墙当前卡后弹出，覆盖全屏。
 * 布局：左侧大图 + 右侧信息栏（标题/描述/标签/指标/导航）。
 * 支持：ESC 关闭 / 左右箭头切换 / 点击背景关闭 / 触摸滑动提示。
 *
 * 仿照李沛霖 Portfolio 的"点击照片→展开详情"交互模式。
 */

interface Props {
  project: Project | null
  allProjects: Project[]
  onClose: () => void
  onNavigate: (project: Project) => void
}

export default function PhotoDetailModal({ project, allProjects, onClose, onNavigate }: Props) {
  /* ESC 关闭 */
  const handleKey = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (!project) return
      const idx = allProjects.findIndex((p) => p.id === project.id)
      if (e.key === 'ArrowRight' && idx < allProjects.length - 1) onNavigate(allProjects[idx + 1])
      if (e.key === 'ArrowLeft' && idx > 0) onNavigate(allProjects[idx - 1])
    },
    [project, allProjects, onClose, onNavigate],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden' /* 防止背景滚动 */
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  if (!project) return null

  const isResearch = !!project.doi
  const currentIndex = allProjects.findIndex((p) => p.id === project.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < allProjects.length - 1

  function goPrev() { if (hasPrev) onNavigate(allProjects[currentIndex - 1]) }
  function goNext() { if (hasNext) onNavigate(allProjects[currentIndex + 1]) }

  /* 点击遮罩层关闭 */
  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2a190a]/55 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} 详情`}
    >
      {/* 关闭按钮 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭"
        className="focus-ring absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-fg-1 shadow-sm transition-all hover:bg-white hover:text-fg-0"
      >
        <X size={18} />
      </button>

      {/* 主内容区 */}
      <div className="relative flex h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-hairline bg-bg-0 shadow-[0_40px_90px_-30px_rgba(90,50,10,0.45)] sm:m-4">
        {/* ====== 左侧：大图 ====== */}
        <div className="relative flex shrink-0 items-center justify-center bg-[#efe4cf] sm:w-[55%]">
          {project.cover.src ? (
            project.cover.type === 'video' ? (
              <video
                src={project.cover.src}
                muted
                loop
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={project.cover.src}
                alt={project.cover.caption ?? project.title}
                className="h-full w-full object-cover"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f8efe0] to-[#ecd9ba]">
              <p className="font-display text-xl font-bold text-fg-2">{project.title}</p>
            </div>
          )}

          {/* 图片底部 caption */}
          {project.cover.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2a190a]/85 to-transparent px-5 py-3">
              <p className="text-xs text-white/80">{project.cover.caption}</p>
            </div>
          )}
        </div>

        {/* ====== 右侧：信息栏 ====== */}
        <div className="flex flex-col overflow-y-auto p-6 sm:p-8 lg:w-[45%]">
          {/* 标题区 */}
          <div>
            <p className="text-[11px] tracking-widest text-accent uppercase">
              {isResearch ? '科研论文 · Research' : project.role}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-fg-0 md:text-3xl">
              {project.title}
            </h2>
            <p className="mt-1 text-sm text-fg-2">{project.subtitle}</p>
          </div>

          {/* 元信息 */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <Meta label="周期">{project.period}</Meta>
            {isResearch ? (
              <>
                <Meta label="发表">{project.published_at ?? '—'}</Meta>
                <Meta label="期刊">{project.venue ?? '—'}</Meta>
                <Meta label="分区">{project.level ?? '—'}</Meta>
              </>
            ) : (
              <>
                <Meta label="角色">{project.role}</Meta>
                <Meta label="访问">
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      打开链接 <ExternalLink size={11} />
                    </a>
                  ) : (
                    '—'
                  )}
                </Meta>
              </>
            )}
          </div>

          {/* 分割线 */}
          <div className="my-6 h-px bg-hairline" />

          {/* 概述 */}
          <section>
            <h3 className="eyebrow">概述</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-1">{project.summary}</p>
          </section>

          {/* 核心亮点 */}
          <section className="mt-6">
            <h3 className="eyebrow">核心亮点</h3>
            <ul className="mt-2 space-y-2">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-sm text-fg-1">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 技术栈 */}
          <section className="mt-6">
            <h3 className="eyebrow">技术 / 方法</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-hairline px-2.5 py-1 text-[11px] text-fg-1 transition-colors hover:border-[color:var(--border-strong)]"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* 关键指标 */}
          {project.metrics.length > 0 && (
            <section className="mt-6">
              <h3 className="eyebrow">关键指标</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {project.metrics.map((m) => (
                  <div key={m.label} className="rounded-lg border border-hairline bg-bg-1 p-3">
                    <p className="font-display text-xl font-bold text-accent">{m.value}</p>
                    <p className="text-[10px] text-fg-2">{m.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* DOI */}
          {isResearch && project.doi && (
            <p className="mt-6 text-[11px] text-fg-2">
              DOI:{' '}
              <a
                href={`https://doi.org/${project.doi}`}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {project.doi}
              </a>
            </p>
          )}

          {/* 底部操作区 */}
          <div className="mt-auto pt-6">
            {!isResearch && project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-[color:var(--bg-0)] transition-transform hover:scale-[1.03]"
              >
                访问项目 <ExternalLink size={14} />
              </a>
            )}

            {/* 导航按钮 */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={goPrev}
                disabled={!hasPrev}
                className={cn(
                  'focus-ring flex items-center gap-1 rounded-full border px-4 py-2 text-xs transition-colors',
                  hasPrev
                    ? 'border-hairline text-fg-1 hover:border-[color:var(--border-strong)] hover:text-fg-0'
                    : 'cursor-not-allowed border-transparent text-fg-2/30',
                )}
              >
                <ChevronLeft size={14} /> 上一张
              </button>

              <span className="text-[10px] tracking-wider text-fg-2/50">
                {currentIndex + 1} / {allProjects.length}
              </span>

              <button
                type="button"
                onClick={goNext}
                disabled={!hasNext}
                className={cn(
                  'focus-ring flex items-center gap-1 rounded-full border px-4 py-2 text-xs transition-colors',
                  hasNext
                    ? 'border-hairline text-fg-1 hover:border-[color:var(--border-strong)] hover:text-fg-0'
                    : 'cursor-not-allowed border-transparent text-fg-2/30',
                )}
              >
                下一张 <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- 小元信息格 ---- */

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] tracking-widest text-fg-2 uppercase">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-fg-0">{children}</p>
    </div>
  )
}
