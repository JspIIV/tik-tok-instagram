import type { ReactNode } from 'react'
import type { Platform } from './types'

export const PLATFORM_LABEL: Record<Platform, string> = { tiktok: 'TikTok', instagram: 'Instagram' }

export function PlatformBadge({ platform, handle }: { platform: Platform; handle: string }) {
  const cls =
    platform === 'tiktok'
      ? 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/30'
      : 'bg-pink-500/10 text-pink-300 ring-pink-500/30'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}>
      {PLATFORM_LABEL[platform]} · @{handle}
    </span>
  )
}

export function PlatformToggle({ value, onChange }: { value: Platform; onChange: (p: Platform) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(['tiktok', 'instagram'] as Platform[]).map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
            value === p
              ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
              : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
          }`}
        >
          {PLATFORM_LABEL[p]}
        </button>
      ))}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 ${className}`}>{children}</div>
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-red-400">{error}</span>
      ) : (
        hint && <span className="block text-xs text-zinc-500">{hint}</span>
      )}
    </label>
  )
}

export const inputCls =
  'w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-400'

export const buttonCls =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40'

export const ghostButtonCls =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40'

export function sol(n: number, digits = 4) {
  return `${n.toFixed(digits)} SOL`
}

export function shortAddr(a: string) {
  return `${a.slice(0, 4)}…${a.slice(-4)}`
}

export function TokenAvatar({ ticker, imageUrl }: { ticker: string; imageUrl: string }) {
  if (imageUrl) return <img src={imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-zinc-950">
      {ticker.slice(0, 2)}
    </div>
  )
}
