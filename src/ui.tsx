import type { ReactNode } from 'react'
import { BadgeCheck, ChevronLeft, ChevronRight, CircleAlert, CircleX } from 'lucide-react'
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

export function SolanaIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M5 6.5h14l-2.5 3H2.5zM5 14.5h14l-2.5 3H2.5zM2.5 10.5h14l2.5 3H5z" />
    </svg>
  )
}

export function PumpIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g transform="rotate(-45 12 12)">
        <rect x="3" y="8" width="18" height="8" rx="4" fill="#fff" />
        <path d="M12 8h5a4 4 0 0 1 0 8h-5z" fill="#4ade80" />
      </g>
    </svg>
  )
}

export function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#fff" />
      <path d="M11 23V9h6.2a4.6 4.6 0 0 1 0 9.2H11" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22.5" cy="23" r="2" fill="#000" />
    </svg>
  )
}

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  return platform === 'tiktok' ? <TikTokIcon className={className} /> : <InstagramIcon className={className} />
}

function hash(s: string) {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}

// Görseli olmayan tokenler için deterministik soyut kapak
export function TokenArt({ seed, imageUrl, label, className = '' }: { seed: string; imageUrl?: string; label: string; className?: string }) {
  if (imageUrl) return <img src={imageUrl} alt="" className={`h-full w-full object-cover ${className}`} />
  const h = hash(seed)
  const a = h % 360
  const b = (a + 40 + (h % 120)) % 360
  const x = 20 + (h % 60)
  const y = 20 + ((h >> 8) % 60)
  const r = 26 + ((h >> 16) % 20)
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={`h-full w-full ${className}`} aria-hidden>
      <defs>
        <linearGradient id={`g${h}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${a} 85% 62%)`} />
          <stop offset="1" stopColor={`hsl(${b} 80% 45%)`} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#g${h})`} />
      <circle cx={x} cy={y} r={r} fill={`hsl(${b} 90% 80% / .45)`} />
      <circle cx={100 - x} cy={100 - y / 2} r={r * 0.7} fill={`hsl(${a} 90% 30% / .35)`} />
      <text x="50" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill="#fff" fillOpacity=".92" fontFamily="Inter, sans-serif" letterSpacing="-1">
        {label.slice(0, 4)}
      </text>
    </svg>
  )
}

export function Avatar({ seed, name, className = 'h-6 w-6' }: { seed: string; name: string; className?: string }) {
  const a = hash(seed) % 360
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-[0.55em] font-bold text-white ring-1 ring-white/10 ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${a} 70% 55%), hsl(${(a + 70) % 360} 70% 35%))` }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}

export function Banner({ seed }: { seed: string }) {
  const a = hash(seed + 'b') % 360
  return (
    <div
      className="h-full w-full"
      style={{
        background: `radial-gradient(120% 90% at 80% 10%, hsl(${a} 70% 45%), transparent 60%), radial-gradient(80% 80% at 10% 100%, hsl(${(a + 140) % 360} 70% 35%), transparent 60%), #111`,
      }}
    />
  )
}

export function Verified({ className = 'h-4 w-4' }: { className?: string }) {
  return <BadgeCheck className={`${className} fill-sky-500 text-[#0b0b0b]`} />
}

const PLATFORM_TEXT: Record<Platform, string> = { tiktok: 'text-tiktok', instagram: 'text-insta' }

// Avatarın köşesindeki platform işareti
export function PlatformDot({ platform }: { platform: Platform }) {
  return (
    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black ring-2 ring-[#161616]">
      <PlatformIcon platform={platform} className={`h-2.5 w-2.5 ${PLATFORM_TEXT[platform]}`} />
    </span>
  )
}

export function CreatorAvatar({ platform, handle, name, className = 'h-12 w-12' }: { platform: Platform; handle: string; name: string; className?: string }) {
  return (
    <span className="relative inline-flex">
      <Avatar seed={`${platform}:${handle}`} name={name} className={`${className} text-lg`} />
      <PlatformDot platform={platform} />
    </span>
  )
}

const STATUS: Record<CreatorStatus, { label: string; cls: string; Icon: typeof BadgeCheck }> = {
  verified: { label: 'Creator onayladı', cls: 'bg-emerald-400/10 text-emerald-300', Icon: BadgeCheck },
  unverified: { label: 'Creator onaylamadı', cls: 'bg-amber-400/10 text-amber-300', Icon: CircleAlert },
  rejected: { label: 'Creator reddetti', cls: 'bg-red-400/10 text-red-300', Icon: CircleX },
}

export function StatusBadge({ status }: { status: CreatorStatus }) {
  const { label, cls, Icon } = STATUS[status]
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}
      title={status === 'unverified' ? 'Hesap sahibi bu tokeni henüz onaylamadı. Destekliyor olmayabilir.' : undefined}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

export function PlatformToggle({ value, onChange }: { value: Platform; onChange: (p: Platform) => void }) {
  return (
    <div className="flex gap-2">
      {PLATFORMS.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-5 text-[15px] transition ${
            value === p ? 'border-white/70 text-white' : 'border-white/[0.08] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
            <PlatformIcon platform={p} className={`h-4 w-4 ${PLATFORM_TEXT[p]}`} />
          </span>
          {PLATFORM_LABEL[p]}
        </button>
      ))}
    </div>
  )
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition ${
        active ? 'border-white/50 bg-white/[0.06] text-white' : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[26px] border border-white/[0.06] bg-card ${className}`}>{children}</div>
}

export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center gap-4 text-zinc-500">
      <button disabled={page <= 0} onClick={() => onChange(page - 1)} className="p-1 transition hover:text-white disabled:opacity-30" aria-label="Önceki">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="min-w-10 text-center font-mono text-sm tracking-widest">
        {page + 1} / {Math.max(1, pages)}
      </span>
      <button disabled={page >= pages - 1} onClick={() => onChange(page + 1)} className="p-1 text-zinc-300 transition hover:text-white disabled:opacity-30" aria-label="Sonraki">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="flex items-center gap-2 text-[28px] font-medium tracking-[-0.04em] sm:text-[34px]">{children}</h2>
}

export function Field({ label, hint, error, children }: { label: string; hint?: ReactNode; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2.5">
      <span className="text-[15px] font-medium text-zinc-200">{label}</span>
      {children}
      {error ? <span className="block text-sm text-red-400">{error}</span> : hint && <span className="block text-sm text-zinc-500">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'w-full rounded-2xl border border-white/[0.06] bg-[#262626] px-5 py-4 text-base outline-none transition placeholder:text-zinc-500 focus:border-white/30'

export const buttonCls =
  'inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-medium text-black transition hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40'

export const ghostButtonCls =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.02] px-7 py-3.5 text-[15px] font-medium text-white transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-40'
