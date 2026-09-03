import { honors } from '@/lib/data'

/**
 * 荣誉 / 奖项
 * ------------------------------------------------------------
 * 紧凑布局：每个奖项渲染为大气泡椭圆胶囊（rounded-full），
 * flex-wrap 自然散开（参考 BubbleMenu 风格：错开旋转 + hover 高亮），
 * 保留暖白底 / 暖棕字 / 思源宋体——不离网站整体气质。
 *
 * 年份/级别/颁发单位空时显示「—」，等本人提供。
 */
const ROTATIONS = ['-6deg', '4.5deg', '-3deg', '7deg', '-5deg']

export default function Honors() {
  return (
    <section id="honors" className="border-t border-hairline py-20">
      <div className="container-page">
        <p className="eyebrow">{honors.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
          {honors.title_zh}
        </h2>
        <p className="mt-1 text-sm tracking-wider2 text-fg-2">{honors.title_en}</p>

        <ul className="mt-14 flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {honors.items.map((h, i) => (
            <li
              key={h.id}
              style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]})` }}
              className="group relative inline-flex cursor-pointer flex-col items-center justify-center rounded-full border border-hairline bg-bg-1 px-9 py-5 transition-all duration-300 hover:scale-[1.08] hover:border-accent hover:bg-accent hover:text-[color:var(--bg-0)] hover:shadow-[0_22px_50px_-18px_rgba(242,100,25,0.65)] hover:rotate-0 motion-reduce:transition-none md:px-11 md:py-6"
            >
              {/* 奖项主标题：大字号思源宋体粗体 */}
              <span className="font-display text-xl font-bold leading-tight md:text-2xl">
                {h.title}
              </span>
              {/* 元信息：年份 · 级别 · 颁发单位（占位） */}
              <span className="mt-1.5 text-[10px] tracking-widest text-fg-2 transition-colors group-hover:text-[color:var(--bg-0)]/70">
                {h.year ?? '—'} · {h.level ?? '—'} · {h.issuer ?? '—'}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-center text-[11px] text-fg-2">
          年份 / 颁发单位 / 级别等细节待本人提供后补充
        </p>
      </div>
    </section>
  )
}