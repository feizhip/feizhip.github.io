import { useState } from 'react'

import { contact } from '@/lib/data'
import { cn } from '@/lib/cn'

/**
 * 联系
 * - 邮箱 / 微信号可点复制（带轻量 toast 反馈）
 * - LOCATION / SOCIAL 板块已删（按用户要求），只留 EMAIL + WECHAT + Contact 按钮
 */
export default function Contact() {
  const [copied, setCopied] = useState<'email' | 'wechat' | null>(null)

  async function copyText(text: string, which: 'email' | 'wechat') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      /* 浏览器拒绝时静默 */
    }
  }

  function copyEmail() {
    if (!contact.email) return
    copyText(contact.email, 'email')
  }

  function copyWechat() {
    if (!contact.wechat) return
    copyText(contact.wechat, 'wechat')
  }

  return (
    <section id="contact" className="border-t border-hairline py-20">
      <div className="container-page">
        <p className="eyebrow">{contact.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
          {contact.title_zh}
        </h2>
        <p className="mt-1 text-sm tracking-wider2 text-fg-2">{contact.title_en}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
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
          <Field label="WECHAT">
            {contact.wechat ? (
              <button
                type="button"
                onClick={copyWechat}
                className="focus-ring rounded-md font-mono text-accent transition-colors hover:underline"
                aria-label="复制微信号"
              >
                {contact.wechat}
              </button>
            ) : (
              <Empty>未填写</Empty>
            )}
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
