import { useEffect, useState } from 'react'
import { Rocket } from 'lucide-react'
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

function tabFromHash(): Tab {
  const h = window.location.hash.replace('#/', '')
  return TABS.some(t => t.id === h) ? (h as Tab) : 'explore'
}

export default function App() {
  const store = useTokens()
  const [tab, setTab] = useState<Tab>(tabFromHash)

  useEffect(() => {
    const onHash = () => {
      setTab(tabFromHash())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/[0.05] bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="#/explore" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-black text-zinc-950">
              p
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              paid<span className="text-zinc-500">.social</span>
            </span>
          </a>
          <nav className="hidden gap-1 sm:flex">
            {TABS.map(t => (
              <a
                key={t.id}
                href={`#/${t.id}`}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  tab === t.id ? 'bg-white/[0.07] text-white' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {t.label}
              </a>
            ))}
          </nav>
          <a
            href="#/launch"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <Rocket className="h-3.5 w-3.5" /> Başlat
          </a>
        </div>
        <nav className="flex gap-1 px-4 pb-2 sm:hidden">
          {TABS.map(t => (
            <a
              key={t.id}
              href={`#/${t.id}`}
              className={`flex-1 rounded-lg px-2 py-1.5 text-center text-xs transition ${
                tab === t.id ? 'bg-white/[0.07] text-white' : 'text-zinc-500'
              }`}
            >
              {t.label}
            </a>
          ))}
        </nav>
      </header>

      <main key={tab} className="animate-rise mx-auto max-w-6xl px-4 pb-20 pt-8">
        {tab === 'explore' && <Explore store={store} />}
        {tab === 'launch' && <Launch store={store} />}
        {tab === 'creator' && <Creator store={store} />}
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] px-4 py-6 text-xs text-zinc-600">
        <span>Demo · veriler sahte, gerçek işlem yapılmaz. TikTok ve Instagram ile bağlantılı değildir.</span>
        <button className="hover:text-zinc-400" onClick={store.reset}>
          Demo verisini sıfırla
        </button>
      </footer>
    </div>
  )
}
