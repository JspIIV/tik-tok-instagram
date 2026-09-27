import type { Platform } from './types'

export const PLATFORM_LABEL: Record<Platform, string> = { tiktok: 'TikTok', instagram: 'Instagram' }
export const PLATFORMS: Platform[] = ['tiktok', 'instagram']
export function sol(n: number, digits = 4) {
  return `${n.toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits })} SOL`
}

export function shortAddr(a: string) {
  return `${a.slice(0, 4)}…${a.slice(-4)}`
}

export function timeAgo(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return 'şimdi'
  if (m < 60) return `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} sa önce`
  return `${Math.floor(h / 24)} gün önce`
}
