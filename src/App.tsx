import { useEffect, useState } from 'react'
import { BarChart3, BookText, ChevronsLeft, CircleDollarSign, House, Menu, RefreshCcw, Rocket, Search, UserRound, X } from 'lucide-react'
import { useStore } from './store'
import { Logo } from './ui'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Payments from './pages/Payments'
import Analytics from './pages/Analytics'
import Launch from './pages/Launch'
import Creator from './pages/Creator'
import Docs from './pages/Docs'

type Route = 'home' | 'explore' | 'payments' | 'analytics' | 'launch' | 'creator' | 'docs'

const NAV: { id: Route; label: string; Icon: typeof House }[] = [
  { id: 'home', label: 'Ana sayfa', Icon: House },
  { id: 'explore', label: 'Keşfet', Icon: Search },
  { id: 'payments', label: 'Ödemeler', Icon: CircleDollarSign },
  { id: 'analytics', label: 'Analitik', Icon: BarChart3 },
  { id: 'launch', label: 'Başlat', Icon: Rocket },
  { id: 'creator', label: 'Creator paneli', Icon: UserRound },
  { id: 'docs', label: 'Dokümanlar', Icon: BookText },
]

function routeFromHash(): Route {
  const h = window.location.hash.replace('#/', '').split('?')[0]
  return NAV.some(n => n.id === h) ? (h as Route) : 'home'
}

export default function App() {
  const store = useStore()
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [collapsed, setCollapsed] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash())
      setDrawer(false)
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function search(q: string) {
    setQuery(q)
    if (route !== 'explore') window.location.hash = '#/explore'
  }

  const sidebar = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center justify-between px-3 pb-6 pt-1">
          <a href="#/home" className="flex items-center gap-2.5">
            <Logo />
            {!collapsed && <span className="text-lg font-semibold tracking-tight">paid.social</span>}
          </a>
          <button onClick={() => setDrawer(false)} className="p-2 text-zinc-400 lg:hidden" aria-label="Menüyü kapat">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {NAV.map(({ id, label, Icon }) => (
            <a
              key={id}
              href={`#/${id}`}
              title={label}
              className={`flex items-center gap-4 rounded-2xl px-3 py-3 text-[20px] tracking-tight transition ${
                route === id ? 'font-semibold text-white' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="h-6 w-6 shrink-0" strokeWidth={route === id ? 2.5 : 1.8} />
              {!collapsed && label}
            </a>
          ))}
        </nav>
      </div>
      <div className={`flex items-center gap-3 rounded-2xl p-2 ${collapsed ? 'justify-center' : ''}`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
          <Logo className="h-6 w-6" />
        </span>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">paid.social</p>
              <p className="text-sm text-zinc-500">Demo sürüm</p>
            </div>
            <button onClick={store.reset} className="p-2 text-zinc-500 hover:text-white" title="Demo verisini sıfırla" aria-label="Demo verisini sıfırla">
              <RefreshCcw className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* masaüstü kenar çubuğu */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-white/[0.06] p-4 transition-[width] lg:block ${collapsed ? 'w-24' : 'w-72 xl:w-80'}`}
      >
        {sidebar}
      </aside>
      {/* mobil çekmece */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} />
          <aside className="animate-rise absolute inset-y-0 left-0 w-72 border-r border-white/[0.06] bg-ink p-4">{sidebar}</aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink/85 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button onClick={() => setDrawer(true)} className="rounded-full border border-white/[0.08] p-2.5 lg:hidden" aria-label="Menü">
              <Menu className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="hidden rounded-full border border-white/[0.08] p-2.5 text-zinc-400 transition hover:text-white lg:block"
              aria-label="Kenar çubuğunu daralt"
            >
              <ChevronsLeft className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} />
            </button>
            <div className="relative mx-auto w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={e => search(e.target.value)}
                placeholder="Ara"
                className="w-full rounded-full border border-white/[0.08] bg-transparent py-2.5 pl-11 pr-4 text-[15px] outline-none transition placeholder:text-zinc-500 focus:border-white/25"
              />
            </div>
            <a href="#/launch" className="shrink-0 rounded-full bg-white px-5 py-2.5 text-[15px] font-medium text-black transition hover:bg-zinc-200">
              Başlat
            </a>
            <a
              href="#/creator"
              className="hidden shrink-0 rounded-full border border-white/[0.1] px-5 py-2.5 text-[15px] font-medium transition hover:border-white/25 sm:block"
            >
              Creator girişi
            </a>
          </div>
        </header>

        <main key={route} className="animate-rise mx-auto max-w-[1600px] px-4 pb-24 pt-6 sm:px-8">
          {route === 'home' && <Home store={store} />}
          {route === 'explore' && <Explore store={store} query={query} setQuery={setQuery} />}
          {route === 'payments' && <Payments store={store} />}
          {route === 'analytics' && <Analytics store={store} />}
          {route === 'launch' && <Launch store={store} />}
          {route === 'creator' && <Creator store={store} />}
          {route === 'docs' && <Docs />}
        </main>

        <Footer />
      </div>
    </div>
  )
}

const FOOTER = [
  { title: 'Ürün', links: [['Keşfet', 'explore'], ['Ödemeler', 'payments'], ['Analitik', 'analytics'], ['Başlat', 'launch']] },
  { title: 'Protokol', links: [['Nasıl çalışır', 'docs'], ['Creator paneli', 'creator']] },
  { title: 'Yasal', links: [['Kullanım şartları', 'docs'], ['Açıklamalar', 'docs'], ['Adımı kaldır (opt-out)', 'creator']] },
]

function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="text-2xl font-medium tracking-[-0.04em]">paid.social</p>
          <p className="text-zinc-500">© 2026 paid.social</p>
          <p className="pt-6 text-sm text-zinc-600">TikTok, ByteDance, Instagram veya Meta ile bağlantılı değildir.</p>
        </div>
        {FOOTER.map(col => (
          <div key={col.title} className="space-y-4">
            <p className="font-medium">{col.title}</p>
            <ul className="space-y-3 text-sm text-zinc-500">
              {col.links.map(([label, id]) => (
                <li key={label}>
                  <a href={`#/${id}`} className="transition hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
