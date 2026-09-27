import { useState } from 'react'
import { useTokens } from './store'
import Explore from './pages/Explore'
import Launch from './pages/Launch'
import Creator from './pages/Creator'

type Tab = 'explore' | 'launch' | 'creator'

const TABS: { id: Tab; label: string }[] = [
  { id: 'explore', label: 'Keşfet' },
  { id: 'launch', label: 'Token çıkar' },
  { id: 'creator', label: 'Creator paneli' },
]

export default function App() {
  const store = useTokens()
  const [tab, setTab] = useState<Tab>('explore')

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            paid<span className="text-emerald-400">.social</span>
          </h1>
          <p className="text-xs text-zinc-500">pump.fun tokenleri · ücretler TikTok & Instagram creator'larına</p>
        </div>
        <nav className="flex gap-1 rounded-xl border border-zinc-800 p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3.5 py-1.5 text-sm transition ${
                tab === t.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'explore' && <Explore store={store} />}
        {tab === 'launch' && <Launch store={store} />}
        {tab === 'creator' && <Creator store={store} />}
      </main>

      <footer className="mt-16 flex items-center justify-between border-t border-zinc-900 pt-4 text-xs text-zinc-600">
        <span>Demo: veriler sahte, işlem yapılmaz.</span>
        <button className="hover:text-zinc-400" onClick={store.reset}>
          Demo verisini sıfırla
        </button>
      </footer>
    </div>
  )
}
