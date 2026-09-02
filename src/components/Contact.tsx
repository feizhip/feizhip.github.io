import { useState } from 'react'

import { contact } from '@/lib/data'
import { cn } from '@/lib/cn'

/**
 * 联系
 * - 邮箱可点复制（带轻量 toast 反馈）
 * - 城市 / 社交链接空时显示「未填写 / 待补」
 * - 隐私字段（手机 / 微信）刻意不渲染
 */
export default function Contact() {
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    if (!contact.email) return
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* 浏览器拒绝时静默 */
    }
  }

  return (
    <section id="contact" className="border-t border-hairline py-20">
      <div className="container-page">
        <p className="eyebrow">{contact.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
          {contact.title_zh}
        </h2>
        <p className="mt-1 text-sm tracking-wider2 text-fg-2">{contact.title_en}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Field label="EMAIL">
            {contact.email ? (
              <button
                type="button"
                onClick={copyEmail}
                className="focus-ring rounded-md text-accent transition-colors hover:underline"
                aria-label="复制邮箱"
              >
                {contact.email}
              </button>
            ) : (
              <Empty>未填写</Empty>
            )}
          </Field>
          <Field label="LOCATION">
            {contact.location ?? <Empty>未填写</Empty>}
          </Field>
          <Field label="SOCIAL">
            <div className="flex flex-wrap gap-2">
              {contact.socials.map((s) =>
                s.url ? (
                  <a
                    key={s.type}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-hairline px-3 py-1 text-[11px] text-fg-1 hover:border-[color:var(--border-strong)]"
                  >
                    {s.label}
                  </a>
                ) : (
                  <span
                    key={s.type}
                    title="待补"
                    className="rounded-full border border-dashed border-hairline px-3 py-1 text-[11px] text-fg-2"
                  >
                    {s.label} <span className="text-[9px]">（待补）</span>
                  </span>
                ),
              )}
            </div>
          </Field>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={copyEmail}
            disabled={!contact.email}
            className={cn(
              'focus-ring inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium transition-transform',
              contact.email
                ? 'bg-accent text-[color:var(--bg-0)] hover:scale-[1.03]'
                : 'bg-bg-2 text-fg-2 cursor-not-allowed',
            )}
          >
            {contact.cta_label} →
          </button>
          {copied && (
            <span className="rounded-full bg-accent-soft px-3 py-1.5 text-xs text-accent">
              ✓ 已复制到剪贴板
            </span>
          )}
        </div>

        <p className="mt-8 text-[11px] text-fg-2">
          手机 / 微信：隐私字段，页面默认不展示（数据已存 JSON 里）
        </p>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-fg-2">{label}</p>
      <div className="mt-2 text-sm">{children}</div>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="text-fg-2 italic">{children}</span>
}
