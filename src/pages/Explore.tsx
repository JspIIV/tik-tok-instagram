import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { feesEarned, normalizeHandle, type TokenStore } from '../store'
import { Card, PlatformBadge, TokenAvatar, inputCls, sol } from '../ui'

export default function Explore({ store }: { store: TokenStore }) {
  const [q, setQ] = useState('')
  const query = normalizeHandle(q)

  const tokens = useMemo(
    () =>
      store.tokens
        .filter(
          t =>
            !query ||
            t.handle.includes(query) ||
            t.ticker.toLowerCase().includes(query) ||
            t.name.toLowerCase().includes(query),
        )
        .sort((a, b) => b.volumeSol - a.volumeSol),
    [store.tokens, query],
  )

  const totalFees = store.tokens.reduce((s, t) => s + feesEarned(t), 0)
  const creators = new Set(store.tokens.map(t => `${t.platform}:${t.handle}`)).size

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-zinc-500">Token sayısı</p>
          <p className="mt-1 text-2xl font-semibold">{store.tokens.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500">Creator'lara giden ücret</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{sol(totalFees, 2)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500">Creator sayısı</p>
          <p className="mt-1 text-2xl font-semibold">{creators}</p>
        </Card>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
        <input className={`${inputCls} pl-10`} value={q} onChange={e => setQ(e.target.value)} placeholder="@kullanıcı adı veya token ara" />
      </div>

      <div className="space-y-3">
        {tokens.map(t => (
          <Card key={t.id} className="flex flex-wrap items-center gap-4">
            <TokenAvatar ticker={t.ticker} imageUrl={t.imageUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {t.name} <span className="text-zinc-500">${t.ticker}</span>
              </p>
              <div className="mt-1">
                <PlatformBadge platform={t.platform} handle={t.handle} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Hacim</p>
              <p className="font-mono text-sm">{sol(t.volumeSol, 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Creator ücreti</p>
              <p className="font-mono text-sm text-emerald-400">{sol(feesEarned(t))}</p>
            </div>
          </Card>
        ))}
        {tokens.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Sonuç yok.</p>}
      </div>
    </div>
  )
}
