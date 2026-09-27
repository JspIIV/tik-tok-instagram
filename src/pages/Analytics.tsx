import { CREATOR_SHARE, creatorEarnings, feesGenerated, pending, profilesOf, type Store } from '../store'
import { PLATFORM_LABEL, PLATFORMS, usd } from '../format'
import { Card, PlatformIcon } from '../ui'
import { Sparkline } from './Home'

export default function Analytics({ store }: { store: Store }) {
  const visible = store.tokens.filter(t => t.creatorStatus !== 'rejected')
  const fees = visible.reduce((s, t) => s + feesGenerated(t), 0)
  const volume = visible.reduce((s, t) => s + t.volumeSol, 0)
  const toCreators = visible.reduce((s, t) => s + creatorEarnings(t), 0)
  const waiting = visible.reduce((s, t) => s + pending(t), 0)
  const creators = profilesOf(store.tokens)
  const claimed = creators.filter(p => p.verified).length

  const stats = [
    { label: 'Hacim', value: usd(volume) },
    { label: `Creator’lara (%${CREATOR_SHARE * 100})`, value: usd(toCreators) },
    { label: 'Hazinede bekleyen', value: usd(waiting) },
    { label: 'Giriş yapan creator', value: `${claimed} / ${creators.length}` },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-5xl font-medium tracking-[-0.05em]">Analitik</h1>
        <p className="mt-2 text-lg text-zinc-400">Demo veriler · gerçek sürümde zincir üstü indexer’dan gelir.</p>
      </div>

      <Card className="relative h-[360px] overflow-hidden p-6">
        <div className="flex justify-between text-sm text-zinc-400">
          <span>Toplam creator ücreti</span>
          <span className="flex gap-1">
            {['1G', '7G', '30G', 'Tümü'].map((r, i) => (
              <span key={r} className={`rounded-full px-2.5 py-0.5 ${i === 0 ? 'bg-white/10 text-white' : ''}`}>
                {r}
              </span>
            ))}
          </span>
        </div>
        <p className="mt-1 text-5xl font-semibold tracking-tight">{usd(fees)}</p>
        <Sparkline seed={visible.length + 3} className="absolute inset-x-0 bottom-0 h-56 w-full" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="p-6">
            <p className="text-sm text-zinc-400">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-5 p-6">
        <p className="text-lg font-medium">Platforma göre ücret</p>
        {PLATFORMS.map(pl => {
          const v = visible.filter(t => t.platform === pl).reduce((s, t) => s + feesGenerated(t), 0)
          return (
            <div key={pl} className="space-y-2">
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <PlatformIcon platform={pl} className={`h-4 w-4 ${pl === 'tiktok' ? 'text-tiktok' : 'text-insta'}`} />
                  {PLATFORM_LABEL[pl]}
                </span>
                <span className="font-mono text-zinc-300">{usd(v)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div className={`h-full rounded-full ${pl === 'tiktok' ? 'bg-tiktok' : 'bg-insta'}`} style={{ width: `${fees ? (v / fees) * 100 : 0}%` }} />
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
