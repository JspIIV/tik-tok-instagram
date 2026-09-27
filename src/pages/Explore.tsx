import { useMemo, useState } from 'react'
import { ArrowRight, Lock, Search, Wallet, Zap } from 'lucide-react'
import { CREATOR_SHARE, creatorEarnings, feesGenerated, normalizeHandle, type TokenStore } from '../store'
import {
  Handle,
  LiveDot,
  StatusBadge,
  TokenAvatar,
  TikTokIcon,
  InstagramIcon,
  buttonCls,
  ghostButtonCls,
  inputCls,
} from '../ui'
import { sol, timeAgo } from '../format'

const STEPS = [
  {
    Icon: Zap,
    title: 'Tokeni bir hesaba bağla',
    text: 'pump.fun tokeni çıkar, ücretlerin gideceği TikTok veya Instagram kullanıcı adını yaz.',
  },
  {
    Icon: Lock,
    title: 'Ücretler kilitlenir',
    text: 'Creator ücretinin %100’ü kalıcı olarak paid.social hazinesine yönlenir. Kimse sonradan değiştiremez.',
  },
  {
    Icon: Wallet,
    title: 'Creator sadece giriş yapar',
    text: `Hesap sahibi TikTok/Instagram ile girer, ücretin %${CREATOR_SHARE * 100}’i otomatik cüzdanına gelir. Adres yok, form yok.`,
  },
]

export default function Explore({ store }: { store: TokenStore }) {
  const [q, setQ] = useState('')
  const query = normalizeHandle(q)
  const visible = store.tokens.filter(t => t.creatorStatus !== 'rejected')

  const tokens = useMemo(
    () =>
      visible
        .filter(
          t =>
            !query ||
            t.handle.includes(query) ||
            t.ticker.toLowerCase().includes(query) ||
            t.name.toLowerCase().includes(query),
        )
        .sort((a, b) => b.volumeSol - a.volumeSol),
    [visible, query],
  )

  const totalVolume = visible.reduce((s, t) => s + t.volumeSol, 0)
  const totalToCreators = visible.reduce((s, t) => s + creatorEarnings(t), 0)
  const creators = new Set(visible.map(t => `${t.platform}:${t.handle}`)).size

  return (
    <div className="space-y-14">
      <section className="grid items-end gap-10 pt-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
            <LiveDot /> pump.fun creator ücretleri · Solana
          </span>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl xl:text-[3.75rem]">
            Token ücretlerini{' '}
            <span className="inline-flex items-baseline gap-2 text-tiktok">
              <TikTokIcon className="h-8 w-8 self-center sm:h-11 sm:w-11" />
              TikTok
            </span>{' '}
            ve{' '}
            <span className="inline-flex items-baseline gap-2 text-insta">
              <InstagramIcon className="h-8 w-8 self-center sm:h-11 sm:w-11" />
              Instagram
            </span>{' '}
            hesaplarına gönder.
          </h1>
          <p className="max-w-xl text-lg text-zinc-400">
            Bir tokeni herhangi bir creator’ın kullanıcı adına eşle. İşlem ücretleri o hesaba akar — cüzdan kurmasına,
            bir şey talep etmesine gerek yok.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#/launch" className={buttonCls}>
              Token çıkar <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#/creator" className={ghostButtonCls}>
              Ben creator’ım
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Creator’lara giden" value={sol(totalToCreators, 2)} accent className="col-span-2" />
          <Stat label="Toplam hacim" value={sol(totalVolume, 0)} />
          <Stat label="Creator" value={String(creators)} />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {STEPS.map(({ Icon, title, text }, i) => (
          <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-accent">
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-mono text-xs text-zinc-600">0{i + 1}</span>
            </div>
            <p className="font-medium">{title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{text}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            Tokenler <span className="rounded-md bg-white/[0.05] px-1.5 font-mono text-xs text-zinc-500">{tokens.length}</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-600" />
            <input className={`${inputCls} pl-10`} value={q} onChange={e => setQ(e.target.value)} placeholder="@kullanıcı veya token ara" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="hidden grid-cols-[2rem_1fr_11rem_8rem_9rem] gap-4 border-b border-white/[0.05] bg-white/[0.02] px-5 py-2.5 text-[11px] uppercase tracking-wider text-zinc-600 md:grid">
            <span>#</span>
            <span>Token</span>
            <span>Ücret alıcısı</span>
            <span className="text-right">Hacim</span>
            <span className="text-right">Creator’a</span>
          </div>
          {tokens.map((t, i) => (
            <div
              key={t.id}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-white/[0.04] px-5 py-4 transition last:border-0 hover:bg-white/[0.02] md:grid-cols-[2rem_1fr_11rem_8rem_9rem]"
            >
              <span className="hidden font-mono text-sm text-zinc-600 md:block">{i + 1}</span>
              <div className="flex min-w-0 items-center gap-3">
                <TokenAvatar ticker={t.ticker} imageUrl={t.imageUrl} />
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {t.name} <span className="font-mono text-xs text-zinc-500">${t.ticker}</span>
                  </p>
                  <p className="truncate text-xs text-zinc-600">{timeAgo(t.createdAt)}</p>
                </div>
              </div>
              <div className="col-start-1 row-start-2 flex flex-wrap items-center gap-2 md:col-start-auto md:row-start-auto md:flex-col md:items-start md:gap-1">
                <Handle platform={t.platform} handle={t.handle} />
                <StatusBadge status={t.creatorStatus} />
              </div>
              <p className="hidden text-right font-mono text-sm text-zinc-300 md:block">{sol(t.volumeSol, 0)}</p>
              <div className="col-start-2 row-span-2 row-start-1 text-right md:col-start-auto md:row-span-1 md:row-start-auto">
                <p key={Math.floor(creatorEarnings(t) * 100)} className="tick font-mono text-sm font-medium text-accent">
                  {sol(creatorEarnings(t))}
                </p>
                <p className="text-[11px] text-zinc-600">ücret {sol(feesGenerated(t), 2)}</p>
              </div>
            </div>
          ))}
          {tokens.length === 0 && <p className="py-14 text-center text-sm text-zinc-500">Sonuç yok.</p>}
        </div>
        <p className="text-xs text-zinc-600">
          “Creator onaylamadı” rozeti: hesap sahibi henüz giriş yapıp bu tokeni onaylamadı. Token onun tarafından
          çıkarılmamıştır ve onu desteklediği anlamına gelmez.
        </p>
      </section>
    </div>
  )
}

function Stat({ label, value, accent, className = '' }: { label: string; value: string; accent?: boolean; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 ${className}`}>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-2 font-mono font-medium tracking-tight ${accent ? 'text-3xl text-accent' : 'text-xl'}`}>{value}</p>
    </div>
  )
}
