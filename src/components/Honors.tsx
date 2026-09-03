import { honors } from '@/lib/data'

/**
 * 荣誉 / 奖项
 * ------------------------------------------------------------
 * 紧凑布局：每个奖项渲染为气泡椭圆胶囊（rounded-full），
 * 多列网格自动排列，整体倾斜错开（参考 BubbleMenu 的 PillLink 风格——
 * 旋转+hover 变色，但**不是菜单**，是奖项卡片墙）。
 *
 * 年份/级别/颁发单位空时显示「待补充」。
 */
const ROTATIONS = ['-2.5deg', '1.8deg', '-1.2deg', '2.6deg', '-2deg']

export default function Honors() {
  return (
    <section id="honors" className="border-t border-hairline py-20">
      <div className="container-page">
        <p className="eyebrow">{honors.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
          {honors.title_zh}
        </h2>
        <p className="mt-1 text-sm tracking-wider2 text-fg-2">{honors.title_en}</p>

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {honors.items.map((h, i) => (
            <li
              key={h.id}
              style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]})` }}
              className="group relative inline-flex items-center gap-3 self-start rounded-full border border-hairline bg-bg-1 px-5 py-3 transition-all duration-300 hover:scale-[1.04] hover:border-accent hover:bg-accent hover:text-[color:var(--bg-0)] hover:shadow-[0_12px_30px_-12px_rgba(242,100,25,0.55)] hover:rotate-0 motion-reduce:transition-none"
            >
              {/* 元信息（占位 · 年份 · 级别 · 颁发单位） */}
              <span className="shrink-0 text-[10px] tracking-widest text-fg-2 transition-colors group-hover:text-[color:var(--bg-0)]/75">
                {h.year ?? '—'} · {h.level ?? '—'}
              </span>
              <span aria-hidden className="h-3 w-px bg-hairline transition-colors group-hover:bg-[color:var(--bg-0)]/40" />
              <span className="font-display text-sm font-bold leading-tight">
                {h.title}
              </span>
              {/* 颁发单位（小字 / hover 隐藏） */}
              <span className="hidden text-[10px] text-fg-2 transition-colors group-hover:text-[color:var(--bg-0)]/70 sm:inline">
                · {h.issuer ?? '—'}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-[11px] text-fg-2">
          年份 / 颁发单位 / 级别等细节待本人提供后补充
        </p>
      </div>
    </section>
  )
}