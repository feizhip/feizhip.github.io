/**
 * 内容总览（?debug=1 可见）
 * ------------------------------------------------------------
 * 用来一次性看清所有数据：profile / nav / projects（含科研论文）
 * / honors / about / contact。
 * 不替代主站，只给本人/HR 校对文案用。
 */

import type { ReactNode } from 'react'

import { about, contact, honors, nav, profile, projects } from '@/lib/data'

/* ---------- 小零件 ---------- */

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-hairline px-3 py-1 text-xs text-fg-1">
      {children}
    </span>
  )
}

function Block({
  eyebrow,
  title,
  source,
  children,
}: {
  eyebrow: string
  title: string
  source: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-hairline py-10">
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <code className="rounded bg-bg-2 px-2 py-0.5 text-[11px] text-fg-2">{source}</code>
      </div>
      {children}
    </section>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <span className="text-fg-2 italic">{children}</span>
}

function Card({ children }: { children: ReactNode }) {
  return <article className="glass rounded-xl p-5">{children}</article>
}

/* ---------- 主组件 ---------- */

export default function DataInspector() {
  return (
    <main className="min-h-screen bg-bg-0 text-fg-0">
      <div className="container-page max-w-4xl py-16">
        {/* ===== Hero / profile.json ===== */}
        <header>
          <p className="eyebrow">{profile.eyebrow}</p>
          <h1 className="mt-4 font-display text-6xl font-bold leading-none md:text-8xl">
            {profile.name_zh}
          </h1>
          <p className="mt-3 text-xl tracking-wider2 text-accent md:text-2xl">
            {profile.tagline_en}
          </p>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-fg-1">{profile.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-accent-soft px-4 py-2 text-xs text-accent">
              {profile.cta_primary_label} → {profile.cta_primary_target}
            </span>
            <span className="rounded-full border border-hairline px-4 py-2 text-xs text-fg-1">
              {profile.cta_secondary_label} → {profile.cta_secondary_target}
            </span>
          </div>
          <p className="mt-6 text-xs text-fg-2">{profile.available_badge}</p>
        </header>

        {/* ===== 导航 / nav.json ===== */}
        <Block eyebrow={`${nav.items.length} ITEMS`} title="导航" source="nav.json">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent text-xs font-semibold text-accent">
              {nav.logo_text}
            </span>
            {nav.items.map((it) => (
              <span key={it.id} className="text-sm text-fg-1">
                {it.label_zh}
                <span className="ml-1.5 text-xs text-fg-2">{it.label_en}</span>
                <span className="ml-1.5 text-[11px] text-fg-2">{it.href}</span>
              </span>
            ))}
            <span className="ml-auto rounded-full border border-hairline px-3 py-1 text-xs text-fg-2">
              {nav.status_badge}
            </span>
          </div>
        </Block>

        {/* ===== 项目 + 论文（合并到 projects.json）/ projects.json ===== */}
        <Block
          eyebrow={`${projects.items.length} ITEMS`}
          title={projects.title_zh}
          source="projects.json"
        >
          <div className="space-y-4">
            {projects.items.map((p) => {
              const isResearch = !!p.doi
              return (
                <Card key={p.id}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-xl font-bold">{p.title}</h3>
                    <span className="text-sm text-accent">{p.subtitle}</span>
                    <span className="ml-auto text-xs text-fg-2">{p.period}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-fg-2">
                    <span className="rounded bg-accent-soft px-2 py-0.5 text-accent">
                      {isResearch ? '科研论文' : p.role}
                    </span>
                    {p.venue && <span>{p.venue}</span>}
                    {p.level && <span>· {p.level}</span>}
                    {p.published_at && <span>· 发表于 {p.published_at}</span>}
                  </div>

                  <p className="mt-3 text-sm text-fg-1">{p.summary}</p>

                  <ul className="mt-3 space-y-1">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex gap-2 text-xs leading-relaxed text-fg-2">
                        <span className="text-accent">·</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>

                  {p.metrics.length > 0 && (
                    <div className="mt-4 flex gap-4">
                      {p.metrics.map((m) => (
                        <div key={m.label}>
                          <p className="font-display text-2xl font-bold text-accent">
                            {m.value}
                          </p>
                          <p className="text-[11px] text-fg-2">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 text-[11px] text-fg-2">
                    {p.link ? (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                      >
                        {p.link}
                      </a>
                    ) : p.doi ? (
                      <a
                        href={`https://doi.org/${p.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                      >
                        DOI: {p.doi}
                      </a>
                    ) : (
                      <Empty>无外链</Empty>
                    )}
                  </p>
                </Card>
              )
            })}
          </div>
        </Block>

        {/* ===== 奖项 / honors.json ===== */}
        <Block eyebrow={`${honors.items.length} ITEMS`} title={honors.title_zh} source="honors.json">
          <ul className="grid gap-2 sm:grid-cols-2">
            {honors.items.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-lg border border-hairline px-4 py-3"
              >
                <span className="text-sm">{h.title}</span>
                {h.year || h.level || h.issuer ? (
                  <span className="text-[11px] text-fg-2">
                    {[h.year, h.level, h.issuer].filter(Boolean).join(' · ')}
                  </span>
                ) : (
                  <span className="text-[11px] text-fg-2 italic">待补充</span>
                )}
              </li>
            ))}
          </ul>
        </Block>

        {/* ===== 关于我 / about.json ===== */}
        <Block eyebrow={about.eyebrow} title={about.title_zh} source="about.json">
          <div className="space-y-3">
            {about.bio.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-fg-1">
                {para}
              </p>
            ))}
          </div>
          <div className="mt-6">
            <p className="mb-2 text-[11px] text-fg-2">性格</p>
            <div className="flex flex-wrap gap-1.5">
              {about.personality.map((p) => (
                <Chip key={p}>{p}</Chip>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-[11px] text-fg-2">兴趣</p>
            <div className="flex flex-wrap gap-1.5">
              {about.interests.map((p) => (
                <Chip key={p}>{p}</Chip>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-[11px] text-fg-2">技能 · {about.skills.length}</p>
            <div className="flex flex-wrap gap-1.5">
              {about.skills.map((p) => (
                <Chip key={p}>{p}</Chip>
              ))}
            </div>
          </div>
          <div className="mt-6 rounded-lg border border-hairline p-4">
            <p className="text-sm font-semibold">
              {about.education.school} · {about.education.major}（{about.education.degree}）
            </p>
            <p className="mt-1 text-xs text-fg-2">{about.education.period}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {about.education.courses.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>
          </div>
        </Block>

        {/* ===== 联系 / contact.json ===== */}
        <Block eyebrow={contact.eyebrow} title="联系" source="contact.json">
          <h3 className="font-display text-xl">{contact.title_zh}</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-fg-2">EMAIL</p>
              <p className="mt-1 text-sm text-accent">
                {contact.email ?? <Empty>未填写</Empty>}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-fg-2">LOCATION</p>
              <p className="mt-1 text-sm">{contact.location ?? <Empty>未填写</Empty>}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-fg-2">SOCIAL</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {contact.socials.map((s) =>
                  s.url ? (
                    <a
                      key={s.type}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-accent hover:underline"
                    >
                      {s.label}
                    </a>
                  ) : (
                    <span key={s.type} className="text-sm text-fg-2" title="待补充">
                      {s.label} <span className="text-[10px]">（待补）</span>
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-hairline bg-bg-1 p-4">
            <p className="text-[11px] text-fg-2">隐私字段（数据结构里有，页面不渲染）</p>
            <p className="mt-1 text-xs">
              手机：{contact.phone ?? <Empty>未填写</Empty>} · 微信：
              {contact.wechat ?? <Empty>未填写</Empty>}
            </p>
          </div>
        </Block>

        <footer className="border-t border-hairline py-8 text-xs text-fg-2">
          {projects.items.length} 个项目 / {honors.items.length} 项奖项 · 全部内容来自 src/data/*.json · 改 JSON 这里会立刻变
        </footer>
      </div>
    </main>
  )
}
