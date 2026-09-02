import { useState, type CSSProperties, type ReactNode } from 'react'

import type { Project } from '@/types/content'
import { cn } from '@/lib/cn'

/**
 * 项目详情面板（被 Work 区块在卡片下方内联展开）
 * 同时承担「弹层」和「折叠」两种状态。
 */
export default function ProjectDetail({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const isResearch = !!project.doi

  return (
    <article className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-bg-1">
      {/* 顶部：标题 + 关闭 */}
      <header className="flex items-start gap-4 border-b border-hairline p-6">
        <div className="flex-1">
          <p className="eyebrow">{isResearch ? '科研论文' : project.role}</p>
          <h3 className="mt-2 font-display text-2xl font-bold leading-tight md:text-3xl">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-fg-2">{project.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭详情"
          className="focus-ring shrink-0 rounded-full border border-hairline px-3 py-1.5 text-xs text-fg-1 transition-colors hover:border-[color:var(--border-strong)] hover:text-fg-0"
        >
          关闭 ✕
        </button>
      </header>

      {/* 元信息条 */}
      <div className="grid gap-3 border-b border-hairline px-6 py-4 text-xs sm:grid-cols-2 md:grid-cols-4">
        <MetaCell label="项目周期">{project.period}</MetaCell>
        {isResearch ? (
          <>
            <MetaCell label="发表日期">{project.published_at ?? '—'}</MetaCell>
            <MetaCell label="期刊">{project.venue ?? '—'}</MetaCell>
            <MetaCell label="分区">{project.level ?? '—'}</MetaCell>
          </>
        ) : (
          <>
            <MetaCell label="角色">{project.role}</MetaCell>
            <MetaCell label="访问">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {prettyUrl(project.link)}
                </a>
              ) : (
                '—'
              )}
            </MetaCell>
          </>
        )}
      </div>

      {/* 正文 */}
      <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr]">
        <section>
          <h4 className="eyebrow">概述</h4>
          <p className="mt-2 text-sm leading-relaxed text-fg-1">{project.summary}</p>

          <h4 className="eyebrow mt-6">核心亮点</h4>
          <ul className="mt-2 space-y-1.5">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-sm text-fg-1">
                <span className="text-accent">·</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>

          {isResearch && (
            <p className="mt-6 text-[11px] text-fg-2">
              DOI:&nbsp;
              {project.doi && (
                <a
                  className="text-accent hover:underline"
                  href={`https://doi.org/${project.doi}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {project.doi}
                </a>
              )}
            </p>
          )}
        </section>

        <section className="space-y-5">
          <div>
            <h4 className="eyebrow">技术 / 方法</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-hairline px-2.5 py-1 text-[11px] text-fg-1"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {project.metrics.length > 0 && (
            <div>
              <h4 className="eyebrow">关键指标</h4>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {project.metrics.map((m) => (
                  <div key={m.label} className="rounded-lg border border-hairline p-3">
                    <p className="font-display text-2xl font-bold text-accent">
                      {m.value}
                    </p>
                    <p className="text-[11px] text-fg-2">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isResearch && project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-[color:var(--bg-0)] transition-transform hover:scale-[1.03]"
            >
              访问项目 →
            </a>
          )}
        </section>
      </div>
    </article>
  )
}

function MetaCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] tracking-widest text-fg-2">{label}</p>
      <p className="mt-0.5 text-fg-0">{children}</p>
    </div>
  )
}

function prettyUrl(u: string) {
  try {
    return new URL(u).host + (new URL(u).pathname === '/' ? '' : new URL(u).pathname)
  } catch {
    return u
  }
}

/* 简单的折叠动画包装（用 CSS 变量控制） */
export function DetailCollapse({ open, children }: { open: boolean; children: ReactNode }) {
  /* 不用 framer-motion；用 CSS grid-template-rows 0fr ↔ 1fr 经典写法 */
  const ref = useState<HTMLDivElement | null>(null)
  void ref
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
      style={{ '--tw-translate-y': '0' } as CSSProperties}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}
