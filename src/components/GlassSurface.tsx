import { cn } from '@/lib/cn'
import '@/styles/GlassSurface.css'

/**
 * GlassSurface —— 玻璃质感容器
 * ------------------------------------------------------------
 * 参考实现里用 SVG feImage + feDisplacementMap 做真折射玻璃，
 * 但 Chromium/Edge 不支持 `backdrop-filter: url(#svg)`（参考组件
 * 自己也会落到 --fallback 路径），所以这里采用等效的稳健做法：
 *
 *   - backdrop-filter blur + saturate（真实模糊背后内容）
 *   - 多层白→暖渐变玻璃体 + 顶部镜面高光（specular）
 *   - 细腻 hairline 描边 + 底部暖橙透光（模拟玻璃边缘折射）
 *
 * 稳定存在：容器本身不做任何 key/动画，内容变化只在子层进行，
 * 玻璃块外观始终不变 → 视觉连贯。
 */

interface GlassSurfaceProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  /** 圆角（px），默认 24 */
  radius?: number
  /** 模糊强度（px），默认 18 */
  blur?: number
}

export default function GlassSurface({
  children,
  className = '',
  style = {},
  radius = 24,
  blur = 18,
}: GlassSurfaceProps) {
  return (
    <div
      className={cn('gsurface', className)}
      style={
        {
          ...style,
          '--gs-radius': `${radius}px`,
          '--gs-blur': `${blur}px`,
        } as React.CSSProperties
      }
    >
      {/* 顶部镜面高光 + 底部暖色透光（纯装饰，不挡交互） */}
      <div className="gsurface__sheen" aria-hidden />
      <div className="gsurface__content">{children}</div>
    </div>
  )
}
