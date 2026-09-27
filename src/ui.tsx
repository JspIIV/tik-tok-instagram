import type { ReactNode } from 'react'
import { BadgeCheck, CircleAlert, CircleX } from 'lucide-react'
import type { CreatorStatus, Platform } from './types'
import { PLATFORM_LABEL, PLATFORMS } from './format'


export function TikTokIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

export function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  return platform === 'tiktok' ? <TikTokIcon className={className} /> : <InstagramIcon className={className} />
}

const PLATFORM_TEXT: Record<Platform, string> = { tiktok: 'text-tiktok', instagram: 'text-insta' }

export function Handle({ platform, handle, className = '' }: { platform: Platform; handle: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm text-zinc-300 ${className}`}>
      <PlatformIcon platform={platform} className={`h-3.5 w-3.5 ${PLATFORM_TEXT[platform]}`} />@{handle}
    </span>
  )
}

const STATUS: Record<CreatorStatus, { label: string; cls: string; Icon: typeof BadgeCheck }> = {
  verified: { label: 'Creator onayladı', cls: 'bg-accent/10 text-accent ring-accent/25', Icon: BadgeCheck },
  unverified: { label: 'Creator onaylamadı', cls: 'bg-amber-400/10 text-amber-300 ring-amber-400/25', Icon: CircleAlert },
  rejected: { label: 'Creator reddetti', cls: 'bg-red-400/10 text-red-300 ring-red-400/25', Icon: CircleX },
}

export function StatusBadge({ status }: { status: CreatorStatus }) {
  const { label, cls, Icon } = STATUS[status]
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${cls}`}
      title={status === 'unverified' ? 'Hesap sahibi bu tokeni henüz görmedi veya onaylamadı. Destekliyor olmayabilir.' : undefined}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

export function PlatformToggle({ value, onChange }: { value: Platform; onChange: (p: Platform) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.03] p-1 ring-1 ring-white/5">
      {PLATFORMS.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            value === p ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <PlatformIcon platform={p} className={`h-4 w-4 ${value === p ? PLATFORM_TEXT[p] : ''}`} />
          {PLATFORM_LABEL[p]}
        </button>
      ))}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm ${className}`}>{children}</div>
  )
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-red-400">{error}</span>
      ) : (
        hint && <span className="block text-xs text-zinc-600">{hint}</span>
      )}
    </label>
  )
}

export const inputCls =
  'w-full rounded-xl border border-white/[0.07] bg-black/40 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-zinc-600 focus:border-accent/60 focus:ring-4 focus:ring-accent/10'

export const buttonCls =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_-6px_var(--color-accent)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none'

export const ghostButtonCls =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'

const AVATAR_GRADIENTS = [
  'from-accent to-tiktok',
  'from-insta to-amber-400',
  'from-tiktok to-indigo-500',
  'from-violet-500 to-insta',
  'from-amber-300 to-accent',
]

export function TokenAvatar({ ticker, imageUrl, size = 'h-11 w-11' }: { ticker: string; imageUrl: string; size?: string }) {
  if (imageUrl) return <img src={imageUrl} alt="" className={`${size} shrink-0 rounded-xl object-cover ring-1 ring-white/10`} />
  const g = AVATAR_GRADIENTS[[...ticker].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length]
  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${g} text-sm font-bold text-zinc-950`}
    >
      {ticker.slice(0, 2) || '?'}
    </div>
  )
}

export function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>
  )
}
