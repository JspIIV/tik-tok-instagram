import { useMemo, useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { creatorEarnings, displayName, feesGenerated, profilesOf, type Store } from '../store'
import type { Platform, Token } from '../types'
import { MostPaidRow, PaymentRow, ProfileCard, TokenCard } from '../components'
import { usd } from '../format'
import { Avatar, Card, Chip, CreatorAvatar, InstagramIcon, Pager, PumpIcon, SectionTitle, TikTokIcon, TokenArt, Verified, buttonCls, ghostButtonCls } from '../ui'

export default function Home({ store }: { store: Store }) {
  const visible = store.tokens.filter(t => t.creatorStatus !== 'rejected')
  const byMc = [...visible].sort((a, b) => b.volumeSol - a.volumeSol)
  const totalFees = visible.reduce((s, t) => s + feesGenerated(t), 0)
  const profiles = profilesOf(store.tokens)

  return (
    <div className="space-y-24">
      <section className="mx-auto max-w-4xl pt-10 text-center sm:pt-16">
        <h1 className="text-[44px] font-medium leading-[0.98] tracking-[-0.055em] sm:text-7xl lg:text-[86px]">
          Token ücretlerini{' '}
          <span className="inline-flex items-center gap-2 align-baseline">
            <TikTokIcon className="h-[0.8em] w-[0.8em]" /> TikTok
          </span>{' '}
          ve{' '}
          <span className="inline-flex items-center gap-2 align-baseline">
            <InstagramIcon className="h-[0.8em] w-[0.8em]" /> Instagram
          </span>
          ’a yönlendir
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-[22px]">
          Bir tokenin creator ücretlerini herhangi bir TikTok veya Instagram hesabına yönlendir, biz o hesaba ödeyelim.{' '}
          <span className="inline-flex translate-y-1 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-base text-white">
            <PumpIcon className="h-4 w-4" /> Pump
          </span>{' '}
          üzerinde başlat.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#/launch" className={buttonCls}>
            Token başlat
          </a>
          <a href="#/docs" className={ghostButtonCls}>
            Dokümanları oku
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
          <ExploreTile tokens={byMc} />
          <Card className="relative h-[400px] overflow-hidden p-5">
            <div className="fade-y h-full space-y-3 overflow-hidden">
              {store.payments.slice(0, 6).map(p => (
                <PaymentRow key={p.id} p={p} compact />
              ))}
            </div>
            <TileFooter label="Ödemeler" href="#/payments" />
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative h-[300px] overflow-hidden p-6">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Ücretler</span>
              <span>1G</span>
            </div>
            <p className="mt-1 text-4xl font-semibold tracking-tight">{usd(totalFees)}</p>
            <Sparkline seed={visible.length} className="absolute inset-x-0 bottom-14 h-24 w-full" />
            <TileFooter label="Analitik" href="#/analytics" />
          </Card>
          <LaunchTile tokens={visible} />
          <Card className="relative h-[300px] overflow-hidden p-6 font-mono text-[13px] leading-6">
            <div className="fade-y h-full overflow-hidden text-zinc-400">
              <p className="tracking-widest text-zinc-500">UYGUNLUK</p>
              <p>creator ücreti %100 → hazine, ayar kilitli</p>
              <p className="mt-4 tracking-widest text-zinc-500">TESPİT</p>
              <p>PumpFees programındaki hesap değişiklikleri, hazine adresine göre filtrelenir. Anlık, sorgulama yok.</p>
              <p className="mt-4 tracking-widest text-zinc-500">TALEP</p>
              <p>distribute_creator_fees → hazine. 0,01 SOL altı kasalar atlanır.</p>
              <p className="mt-4 tracking-widest text-zinc-500">ÖDEME</p>
              <p>Creator OAuth ile girer → cüzdanına otomatik transfer.</p>
            </div>
            <TileFooter label="Dokümanlar" href="#/docs" />
          </Card>
        </div>
      </section>

      <section className="grid gap-10 2xl:grid-cols-[1fr_minmax(0,480px)]">
        <TopTokens tokens={visible} />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle>Top profiller</SectionTitle>
          </div>
          <div className="grid gap-4 md:grid-cols-3 2xl:grid-cols-1">
            {profiles.slice(0, 3).map(p => (
              <ProfileCard key={`${p.platform}:${p.handle}`} p={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-10 2xl:grid-cols-[1fr_minmax(0,480px)]">
        <div className="space-y-6">
          <SectionTitle>Son ödemeler</SectionTitle>
          <div className="space-y-3">
            {store.payments.slice(0, 5).map(p => (
              <PaymentRow key={p.id} p={p} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <SectionTitle>En çok kazananlar</SectionTitle>
          <div className="space-y-3">
            {profiles.slice(0, 5).map(p => (
              <MostPaidRow key={`${p.platform}:${p.handle}`} p={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function TileFooter({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-card via-card/90 to-transparent px-6 pb-5 pt-10 text-lg"
    >
      <span>{label}</span>
      <span className="flex items-center gap-1 text-zinc-400 transition hover:text-white">
        Aç <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  )
}

function ExploreTile({ tokens }: { tokens: Token[] }) {
  const cols = [0, 1, 2].map(c => tokens.filter((_, i) => i % 3 === c))
  return (
    <Card className="relative h-[400px] overflow-hidden">
      <div className="fade-y grid h-full grid-cols-3 gap-3 px-3">
        {cols.map((col, c) => (
          <div key={c} className="overflow-hidden">
            <div className="marquee-y space-y-3" style={{ animationDuration: `${36 + c * 8}s`, animationDirection: c === 1 ? 'reverse' : 'normal' }}>
              {[...col, ...col].map((t, i) => (
                <MiniToken key={`${t.id}-${i}`} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <TileFooter label="Keşfet" href="#/explore" />
    </Card>
  )
}

function MiniToken({ t }: { t: Token }) {
  const name = displayName(t.platform, t.handle)
  return (
    <div className="rounded-2xl bg-white/[0.04] p-2">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <TokenArt seed={t.mint} imageUrl={t.imageUrl} label={t.ticker} />
        <span className="absolute bottom-2 left-2 flex max-w-[90%] items-center gap-1 rounded-full bg-black/80 py-0.5 pl-0.5 pr-2 text-[11px] font-medium">
          <Avatar seed={`${t.platform}:${t.handle}`} name={name} className="h-4 w-4 text-[8px]" />
          <span className="truncate">{name}</span>
          {t.creatorStatus === 'verified' && <Verified className="h-3 w-3 shrink-0" />}
        </span>
      </div>
      <p className="truncate px-1 pt-2 text-[13px] font-medium">{t.name}</p>
      <p className="px-1 pb-1 text-[13px] font-semibold">
        {usd(creatorEarnings(t))} <span className="text-[11px] font-normal text-zinc-500">gönderildi</span>
      </p>
    </div>
  )
}

function LaunchTile({ tokens }: { tokens: Token[] }) {
  const [q, setQ] = useState('@kedi')
  const needle = q.replace(/^@/, '').toLowerCase()
  const matches = useMemo(() => {
    const seen = new Set<string>()
    return tokens
      .filter(t => needle && t.handle.includes(needle))
      .filter(t => !seen.has(t.handle) && seen.add(t.handle))
      .slice(0, 2)
  }, [tokens, needle])
  return (
    <Card className="relative h-[300px] overflow-hidden p-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full rounded-full border-2 border-white/80 bg-black py-2.5 pl-10 pr-4 font-mono text-base outline-none"
          aria-label="Creator ara"
        />
      </div>
      <div className="mt-3 space-y-2">
        {matches.map(t => (
          <a key={t.id} href="#/launch" className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-3 py-2.5 transition hover:bg-white/[0.08]">
            <CreatorAvatar platform={t.platform} handle={t.handle} name={displayName(t.platform, t.handle)} className="h-9 w-9" />
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-semibold">
                {displayName(t.platform, t.handle)} <Verified className="h-4 w-4" />
              </span>
              <span className="block truncate text-sm text-zinc-500">@{t.handle}</span>
            </span>
          </a>
        ))}
      </div>
      <TileFooter label="Başlat" href="#/launch" />
    </Card>
  )
}

export function Sparkline({ seed, className = '' }: { seed: number; className?: string }) {
  const pts = Array.from({ length: 40 }, (_, i) => 50 + Math.sin(i / 4 + seed) * 14 + Math.sin(i / 1.7 + seed * 2) * 5 - i * 0.4)
  const d = pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * 100},${y}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".12" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" x2="100" y1="30" y2="30" stroke="#fff" strokeOpacity=".05" vectorEffect="non-scaling-stroke" />
      <line x1="0" x2="100" y1="70" y2="70" stroke="#fff" strokeOpacity=".05" vectorEffect="non-scaling-stroke" />
      <path d={`${d} L100,100 L0,100 Z`} fill="url(#spark)" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

const PER_PAGE = 8

export function TopTokens({ tokens, title = 'Top tokenler' }: { tokens: Token[]; title?: string }) {
  const [filter, setFilter] = useState<Platform | 'all'>('all')
  const [page, setPage] = useState(0)
  const list = [...tokens].filter(t => filter === 'all' || t.platform === filter).sort((a, b) => b.volumeSol - a.volumeSol)
  const pages = Math.ceil(list.length / PER_PAGE)
  const p = Math.min(page, Math.max(0, pages - 1))

  function pick(f: Platform | 'all') {
    setFilter(f)
    setPage(0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SectionTitle>{title}</SectionTitle>
          <Chip active={filter === 'tiktok'} onClick={() => pick('tiktok')}>
            <TikTokIcon className="h-4 w-4 text-tiktok" /> TikTok
          </Chip>
          <Chip active={filter === 'instagram'} onClick={() => pick('instagram')}>
            <InstagramIcon className="h-4 w-4 text-insta" /> Instagram
          </Chip>
          <Chip active={filter === 'all'} onClick={() => pick('all')}>
            Tümü
          </Chip>
        </div>
        <Pager page={p} pages={pages} onChange={setPage} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {list.slice(p * PER_PAGE, (p + 1) * PER_PAGE).map(t => (
          <TokenCard key={t.id} t={t} />
        ))}
      </div>
      {list.length === 0 && <p className="py-16 text-center text-zinc-500">Sonuç yok.</p>}
    </div>
  )
}
