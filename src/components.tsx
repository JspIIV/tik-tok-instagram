import { ArrowRightLeft, ChevronDown, Clock } from 'lucide-react'
import { creatorEarnings, displayName, marketCapSol, type Profile } from './store'
import type { Payment, Token } from './types'
import { age, compactUsd, usd } from './format'
import { Avatar, Banner, CreatorAvatar, PlatformDot, PumpIcon, StatusBadge, TokenArt, Verified } from './ui'

export function TokenCard({ t }: { t: Token }) {
  const name = displayName(t.platform, t.handle)
  return (
    <div className="group rounded-[22px] border border-white/[0.06] bg-card p-3 transition hover:border-white/15">
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        <TokenArt seed={t.mint} imageUrl={t.imageUrl} label={t.ticker} className="transition duration-500 group-hover:scale-105" />
        <span className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/80">
          <PumpIcon className="h-4 w-4" />
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/75 px-2.5 py-0.5 text-xs text-zinc-200">{age(t.createdAt)}</span>
        <span className="absolute bottom-2.5 left-2.5 flex max-w-[85%] items-center gap-1.5 rounded-full bg-black/80 py-1 pl-1 pr-2.5 text-[13px] font-medium backdrop-blur">
          <span className="relative">
            <Avatar seed={`${t.platform}:${t.handle}`} name={name} className="h-6 w-6 text-xs" />
            <PlatformDot platform={t.platform} />
          </span>
          <span className="truncate">{name}</span>
          {t.creatorStatus === 'verified' && <Verified className="h-3.5 w-3.5 shrink-0" />}
        </span>
      </div>
      <div className="px-1.5 pb-1.5 pt-3">
        <p className="flex items-baseline gap-2 truncate text-[17px] font-medium">
          <span className="truncate">{t.name}</span>
          <span className="shrink-0 font-mono text-xs text-zinc-500">{t.ticker}</span>
        </p>
        <p className="mt-1.5 flex items-baseline gap-3 text-xl font-semibold tracking-tight">
          <span>
            {compactUsd(marketCapSol(t))} <span className="text-xs font-normal text-zinc-500">MC</span>
          </span>
          <span className="text-base">
            {compactUsd(creatorEarnings(t))} <span className="text-xs font-normal text-zinc-500">gönderildi</span>
          </span>
        </p>
        {t.creatorStatus !== 'verified' && (
          <div className="mt-2">
            <StatusBadge status={t.creatorStatus} />
          </div>
        )}
      </div>
    </div>
  )
}

export function ProfileCard({ p }: { p: Profile }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/[0.06] bg-card">
      <div className="h-28">
        <Banner seed={`${p.platform}:${p.handle}`} />
      </div>
      <div className="-mt-12 space-y-3 p-5 pt-0">
        <div className="relative inline-flex rounded-full ring-4 ring-card">
          <CreatorAvatar platform={p.platform} handle={p.handle} name={p.name} className="h-20 w-20 text-3xl" />
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-2xl font-semibold tracking-tight">
            {p.name} {p.verified && <Verified className="h-5 w-5" />}
          </p>
          <p className="text-lg text-zinc-500">@{p.handle}</p>
        </div>
        {p.verified ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2.5 py-1 text-sm text-zinc-400">$ Kayıtlı creator</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/10 px-2.5 py-1 text-sm text-amber-300">Henüz giriş yapmadı</span>
        )}
        <p className="flex flex-wrap gap-x-5 text-lg">
          <span>
            <b className="font-semibold">{p.tokens}</b> <span className="text-zinc-500">token</span>
          </span>
          <span>
            <b className="font-semibold">{usd(p.receivedSol)}</b> <span className="text-zinc-500">kazandı</span>
          </span>
        </p>
      </div>
    </div>
  )
}

const STATUS_PILL: Record<Payment['status'], { cls: string; text: string }> = {
  sent: { cls: 'bg-white/[0.06] text-zinc-400', text: 'Gönderildi' },
  pending: { cls: 'bg-amber-400/10 text-amber-300', text: 'Bekliyor' },
  limit: { cls: 'border border-amber-400/40 bg-amber-400/10 text-amber-300', text: '$750 / 24 saat limitine ulaşıldı' },
}

export function PaymentRow({ p, compact }: { p: Payment; compact?: boolean }) {
  const name = displayName(p.platform, p.handle)
  const pill = STATUS_PILL[p.status]
  return (
    <div className={`grid grid-cols-[1fr_auto] items-center gap-3 rounded-[22px] border border-white/[0.06] bg-card ${compact ? 'px-4 py-3' : 'px-5 py-4 sm:px-6 sm:py-5'}`}>
      <div className="min-w-0">
        <p className={`truncate font-semibold tracking-tight ${compact ? 'text-2xl' : 'text-3xl sm:text-[40px]'}`}>{usd(p.amountSol)}</p>
        <p className={`truncate text-zinc-400 ${compact ? 'text-sm' : 'text-lg'}`}>
          gönderildi → <b className="font-semibold text-white">{name}</b>
          {p.status !== 'pending' && <Verified className="ml-1 inline h-4 w-4 align-[-2px]" />}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:gap-6">
        <div className={`hidden shrink-0 items-center gap-2 ${compact ? 'md:flex' : 'sm:flex'}`}>
          <span className="relative">
            <Avatar seed="treasury" name="p" className="h-11 w-11 text-base" />
          </span>
          <ArrowRightLeft className="h-4 w-4 text-zinc-600" />
          <CreatorAvatar platform={p.platform} handle={p.handle} name={name} className="h-11 w-11" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {!compact && p.status === 'limit' && (
              <span className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-sm 2xl:inline-flex ${pill.cls}`}>
                <Clock className="h-3.5 w-3.5" />
                {pill.text}
              </span>
            )}
            {!compact && <ChevronDown className="h-4 w-4 text-zinc-600" />}
          </div>
          <span className="text-sm text-zinc-500">{age(p.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

export function MostPaidRow({ p }: { p: Profile }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/[0.06] bg-card px-5 py-4">
      <div className="flex items-center gap-2">
        <Avatar seed="treasury" name="p" className="h-11 w-11 text-base" />
        <ArrowRightLeft className="h-4 w-4 text-zinc-600" />
        <CreatorAvatar platform={p.platform} handle={p.handle} name={p.name} className="h-11 w-11" />
      </div>
      <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{usd(p.receivedSol)}</p>
    </div>
  )
}
