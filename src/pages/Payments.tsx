import { useState } from 'react'
import { profilesOf, type Store } from '../store'
import { MostPaidRow, PaymentRow } from '../components'
import { usd } from '../format'
import { Card, Pager, SectionTitle } from '../ui'

const PER_PAGE = 6

export default function Payments({ store }: { store: Store }) {
  const [page, setPage] = useState(0)
  const pages = Math.ceil(store.payments.length / PER_PAGE)
  const total = store.payments.reduce((s, p) => s + p.amountSol, 0)
  const profiles = profilesOf(store.tokens)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-5xl font-medium tracking-[-0.05em]">Ödemeler</h1>
        <p className="mt-2 text-lg text-zinc-400">Hazineden creator cüzdanlarına yapılan her transfer.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-zinc-400">Toplam ödenen</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">{usd(total)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-zinc-400">Ödeme sayısı</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">{store.payments.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-zinc-400">Creator başına 24 saat limiti</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">$750</p>
        </Card>
      </div>

      <div className="grid gap-10 2xl:grid-cols-[1fr_minmax(0,480px)]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle>Son ödemeler</SectionTitle>
            <Pager page={page} pages={pages} onChange={setPage} />
          </div>
          <div className="space-y-3">
            {store.payments.slice(page * PER_PAGE, (page + 1) * PER_PAGE).map(p => (
              <PaymentRow key={p.id} p={p} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <SectionTitle>En çok kazananlar</SectionTitle>
          <div className="space-y-3">
            {profiles.slice(0, 6).map(p => (
              <MostPaidRow key={`${p.platform}:${p.handle}`} p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
