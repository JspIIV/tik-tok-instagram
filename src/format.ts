import { SOL_USD } from './store'
import type { Platform } from './types'

export const PLATFORM_LABEL: Record<Platform, string> = { tiktok: 'TikTok', instagram: 'Instagram' }
export const PLATFORMS: Platform[] = ['tiktok', 'instagram']

export function sol(n: number, digits = 2) {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })} SOL`
}

export function usd(solAmount: number) {
  return `$${(solAmount * SOL_USD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function compactUsd(solAmount: number) {
  const v = solAmount * SOL_USD
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

export function shortAddr(a: string) {
  return `${a.slice(0, 4)}…${a.slice(-4)}`
}

// Kısa yaş etiketi: 24m, 8h, 9d
export function age(ts: number) {
  const m = Math.max(0, Math.floor((Date.now() - ts) / 60000))
  if (m < 60) return `${m}dk`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}sa`
  return `${Math.floor(h / 24)}g`
}
