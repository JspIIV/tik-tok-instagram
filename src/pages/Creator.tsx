import { useState } from 'react'
import { LogIn, LogOut, Send, Wallet } from 'lucide-react'
import { balance, feesEarned, isValidHandle, isValidSolanaAddress, normalizeHandle, walletFor, type TokenStore } from '../store'
import type { Platform } from '../types'
import {
  Card,
  Field,
  PlatformBadge,
  PlatformToggle,
  PLATFORM_LABEL,
  TokenAvatar,
  buttonCls,
  ghostButtonCls,
  inputCls,
  shortAddr,
  sol,
} from '../ui'

interface Session {
  platform: Platform
  handle: string
}

export default function Creator({ store }: { store: TokenStore }) {
  const [session, setSession] = useState<Session | null>(null)
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [rawHandle, setRawHandle] = useState('')
  const [dest, setDest] = useState('')
  const [sent, setSent] = useState<number | null>(null)

  const handle = normalizeHandle(rawHandle)

  if (!session) {
    return (
      <Card className="mx-auto max-w-md space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Creator girişi</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Hesabınla giriş yap; adına biriken ücretler cüzdanında hazır. Adres girmene gerek yok.
          </p>
        </div>
        <PlatformToggle value={platform} onChange={setPlatform} />
        <Field label={`${PLATFORM_LABEL[platform]} kullanıcı adı`} hint="Demo: gerçekte bu adım TikTok/Instagram OAuth ile yapılır.">
          <input className={inputCls} value={rawHandle} onChange={e => setRawHandle(e.target.value)} placeholder="@kedicikanal" />
        </Field>
        <button
          className={`${buttonCls} w-full`}
          disabled={!isValidHandle(platform, handle)}
          onClick={() => setSession({ platform, handle })}
        >
          <LogIn className="h-4 w-4" /> {PLATFORM_LABEL[platform]} ile giriş yap
        </button>
      </Card>
    )
  }

  const mine = store.tokens.filter(t => t.platform === session.platform && t.handle === session.handle)
  const total = mine.reduce((s, t) => s + feesEarned(t), 0)
  const bal = mine.reduce((s, t) => s + balance(t), 0)
  const wallet = walletFor(session.platform, session.handle)
  const destOk = isValidSolanaAddress(dest)

  function send() {
    if (!session || !destOk || bal <= 0) return
    store.withdrawAll(session.platform, session.handle)
    setSent(bal)
    setDest('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PlatformBadge platform={session.platform} handle={session.handle} />
        <button className={ghostButtonCls} onClick={() => { setSession(null); setSent(null) }}>
          <LogOut className="h-4 w-4" /> Çıkış
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2">
          <p className="flex items-center gap-2 text-xs text-zinc-500">
            <Wallet className="h-3.5 w-3.5" /> Cüzdanın · {shortAddr(wallet)}
          </p>
          <p className="text-3xl font-semibold text-emerald-400">{sol(bal)}</p>
          <p className="text-xs text-zinc-500">Toplam kazanç: {sol(total)} · {mine.length} token</p>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-medium">Başka cüzdana gönder (isteğe bağlı)</p>
          <input
            className={inputCls}
            value={dest}
            onChange={e => setDest(e.target.value)}
            placeholder="Phantom / Solflare adresi"
          />
          <button className={`${buttonCls} w-full`} disabled={!destOk || bal <= 0} onClick={send}>
            <Send className="h-4 w-4" /> Tümünü gönder
          </button>
          {sent !== null && <p className="text-xs text-emerald-400">{sol(sent)} gönderildi (demo).</p>}
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-400">Adına çıkarılan tokenler</h3>
        {mine.map(t => (
          <Card key={t.id} className="flex items-center gap-4">
            <TokenAvatar ticker={t.ticker} imageUrl={t.imageUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {t.name} <span className="text-zinc-500">${t.ticker}</span>
              </p>
              <p className="text-xs text-zinc-500">Hacim {sol(t.volumeSol, 0)}</p>
            </div>
            <p className="font-mono text-sm text-emerald-400">{sol(feesEarned(t))}</p>
          </Card>
        ))}
        {mine.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">Henüz adına çıkarılmış token yok.</p>
        )}
      </div>
    </div>
  )
}
