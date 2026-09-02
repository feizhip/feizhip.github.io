import { honors } from '@/lib/data'

/**
 * 荣誉 / 奖项
 * ------------------------------------------------------------
 * 左侧细线时间线（左侧奖项级别 + 颁发单位，右侧标题）。
 * 年份字段空着时显示「—」，等本人提供。
 */
export default function Honors() {
  return (
    <section id="honors" className="border-t border-hairline py-20">
      <div className="container-page">
        <p className="eyebrow">{honors.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
          {honors.title_zh}
        </h2>
        <p className="mt-1 text-sm tracking-wider2 text-fg-2">{honors.title_en}</p>

        <ol className="relative mt-10 ml-4 border-l border-hairline">
          {honors.items.map((h) => (
            <li key={h.id} className="mb-6 ml-6 last:mb-0">
              <span
                aria-hidden
                className="absolute -left-[7px] mt-2 h-3 w-3 rounded-full border-2 border-[color:var(--accent)] bg-bg-0"
              />
              <p className="text-[11px] tracking-widest text-fg-2">
                {h.year ?? '—'} · {h.level ?? '—'}
              </p>
              <p className="mt-1 font-display text-lg font-bold">{h.title}</p>
              <p className="mt-0.5 text-xs text-fg-2">{h.issuer ?? '—'}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 inline-block rounded-full border border-dashed border-hairline px-4 py-1.5 text-[11px] text-fg-2">
          奖项的年份 / 颁发单位 / 级别等细节等本人提供后补充
        </p>
      </div>
    </section>
  )
}
