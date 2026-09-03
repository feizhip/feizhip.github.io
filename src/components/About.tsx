import { about } from '@/lib/data'
import { cn } from '@/lib/cn'

/**
 * 关于我 v2
 * ------------------------------------------------------------
 * 更紧凑的布局：个人照作为视觉锚点 + 文字信息流式排列。
 * 不再是死板的"左文字右教育卡"——而是自然的信息展开。
 */
export default function About() {
  return (
    <section id="about" className="relative border-t border-hairline py-24">
      {/* 微背景 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-20 h-[500px] w-[600px] bg-[radial-gradient(ellipse_at_center,var(--accent-soft),transparent_70%)] opacity-20 blur-3xl" />
      </div>

      <div className="container-page relative">
        {/* 标题 */}
        <div className="text-center">
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {about.title_zh}
          </h2>
          <p className="mt-2 text-sm tracking-wider2 text-fg-2">{about.title_en}</p>
        </div>

        {/* 主体：左大照片 + 右文字信息流 */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* 左：个人照（视觉锚点，占大列） */}
          <div className="min-w-0">
            {about.photo && (
              <div className="group relative overflow-hidden rounded-2xl border border-hairline bg-bg-1">
                <img
                  src={about.photo}
                  alt={about.photo_caption ?? '个人照片'}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a190a]/45 via-transparent to-transparent" />
                {about.photo_caption && (
                  <div className="absolute bottom-0 left-0 right-0 px-5 py-3">
                    <p className="text-xs text-white/85">{about.photo_caption}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右：自我介绍 + 性格 + 技能 + 教育（紧凑流式） */}
          <div className="min-w-0 space-y-8">
            {/* 自我介绍 */}
            {about.bio.length > 0 && !(about.bio.length === 1 && about.bio[0].startsWith('待补充')) && (
              <div>
                <h3 className="eyebrow">自我介绍</h3>
                <div className="mt-3 space-y-3">
                  {about.bio.map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-fg-1">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 性格 + 技能 */}
            <div className="space-y-4">
              <ChipGroup label="性格" items={about.personality} />
              <ChipGroup label={`技能 · ${about.skills.length}`} items={about.skills} />
            </div>

            {/* 教育（紧凑版） */}
            <div className="rounded-2xl border border-hairline bg-bg-1 p-5 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <p className="eyebrow mb-0">教育</p>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="font-display text-lg font-bold leading-tight text-fg-0">
                    {about.education.school}
                  </p>
                  <p className="mt-0.5 text-sm text-fg-1">
                    {about.education.major} · {about.education.degree}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-2">{about.education.period}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {about.education.courses.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-hairline px-2.5 py-0.5 text-[10px] text-fg-1 transition-colors hover:border-[color:var(--border-strong)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---- 标签组 ---- */

function ChipGroup({ label, items, wide }: { label: string; items: string[]; wide?: boolean }) {
  return (
    <div>
      <p className="mb-2 text-[11px] text-fg-2">{label}</p>
      <div className={cn('flex flex-wrap gap-1.5', wide && 'sm:flex-wrap')}>
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] transition-colors',
              item === '待补充'
                ? 'border-dashed border-hairline italic text-fg-2'
                : 'border-hairline text-fg-1 hover:border-[color:var(--border-strong)] hover:text-fg-0',
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
