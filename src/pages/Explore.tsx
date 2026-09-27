import { normalizeHandle, profilesOf, type Store } from '../store'
import { ProfileCard } from '../components'
import { TopTokens } from './Home'

export default function Explore({ store, query, setQuery }: { store: Store; query: string; setQuery: (q: string) => void }) {
  const q = normalizeHandle(query)
  const tokens = store.tokens.filter(
    t => t.creatorStatus !== 'rejected' && (!q || t.handle.includes(q) || t.ticker.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)),
  )
  const profiles = profilesOf(store.tokens).filter(p => !q || p.handle.includes(q) || p.name.toLowerCase().includes(q))

  return (
    <div className="space-y-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-medium tracking-[-0.05em]">Keşfet</h1>
          <p className="mt-2 text-lg text-zinc-400">Ücretleri TikTok ve Instagram creator’larına giden tüm tokenler.</p>
        </div>
        {q && (
          <button onClick={() => setQuery('')} className="rounded-full border border-white/[0.1] px-4 py-2 text-sm text-zinc-300 hover:text-white">
            “{query}” aramasını temizle
          </button>
        )}
      </div>

      <TopTokens key={q} tokens={tokens} title="Tokenler" />

      <div className="space-y-6">
        <h2 className="text-[34px] font-medium tracking-[-0.04em]">Creator’lar</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map(p => (
            <ProfileCard key={`${p.platform}:${p.handle}`} p={p} />
          ))}
        </div>
        {profiles.length === 0 && <p className="py-10 text-center text-zinc-500">Creator bulunamadı.</p>}
      </div>

      <p className="text-sm text-zinc-600">
        “Creator onaylamadı”: hesap sahibi henüz giriş yapıp tokeni onaylamadı. Token onun tarafından çıkarılmamıştır ve onu desteklediği
        anlamına gelmez.
      </p>
    </div>
  )
}
