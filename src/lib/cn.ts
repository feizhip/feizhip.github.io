import { clsx, type ClassValue } from 'clsx'

/** Tailwind class 合并工具：cn('a', cond && 'b', { c: flag }) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
