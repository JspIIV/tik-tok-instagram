import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Loader2, LogOut, Send, ShieldCheck, X } from 'lucide-react'
import { services } from '../services'
import {
  PAYOUT_THRESHOLD_SOL,
  creatorEarnings,
  displayName,
  isValidHandle,
  isValidSolanaAddress,
  normalizeHandle,
  pending,
  type Store,
} from '../store'
import type { CreatorSession, Platform } from '../types'
import { PLATFORM_LABEL, shortAddr, sol, usd } from '../format'
import { Card, CreatorAvatar, Field, PlatformIcon, PlatformToggle, StatusBadge, TokenArt, buttonCls, ghostButtonCls, inputCls } from '../ui'

export default function Creator({ store }: { store: Store }) {
  const [session, setSession] = useState<CreatorSession | null>(null)
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [rawHandle, setRawHandle] = useState('')
  const [busy, setBusy] = useState(false)

  const handle = normalizeHandle(rawHandle)
  const ok = isValidHandle(platform, handle)

  async function signIn() {
    if (!ok) return
    setBusy(true)
    try {
      setSession(await services.auth.signIn(platform, handle))
    } finally {
      setBusy(false)
    }
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-xl space-y-8 pt-10">
        <div className="text-center">
          <h1 className="text-5xl font-medium tracking-[-0.05em] sm:text-6xl">Paran seni bekliyor</h1>
          <p className="mt-4 text-lg text-zinc-400">
            Adına çıkarılan tokenlerin ücretleri hesabına birikir. Giriş yap, otomatik olarak cüzdanına gelsin. Talep edecek bir şey yok.
          </p>
        </div>
        <Card className="space-y-6 p-8">
          <PlatformToggle value={platform} onChange={setPlatform} />
          <Field label={`${PLATFORM_LABEL[platform]} kullanıcı adı`} hint="Demo: gerçek sürümde bu alan yok, kullanıcı adı OAuth girişinden gelir.">
            <input
              className={inputCls}
              value={rawHandle}
              onChange={e => setRawHandle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && signIn()}
              placeholder="@kedicikanal"
            />
          </Field>
          <button className={`${buttonCls} w-full py-4`} disabled={!ok || busy} onClick={signIn}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlatformIcon platform={platform} className="h-4 w-4" />}
            {PLATFORM_LABEL[platform]} ile devam et
          </button>
          <p className="flex items-start gap-2 text-sm text-zinc-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Sadece hesabın sana ait olduğunu doğrularız. Paylaşım yapmayız, şifreni görmeyiz.
          </p>
        </Card>
      </div>
    )
  }

  return <Dashboard store={store} session={session} onSignOut={() => void services.auth.signOut().then(() => setSession(null))} />
}

function Dashboard({ store, session, onSignOut }: { store: Store; session: CreatorSession; onSignOut: () => void }) {
  const [dest, setDest] = useState('')
  const [withdrawn, setWithdrawn] = useState(0)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [optedOut, setOptedOut] = useState(false)
  const paying = useRef(false)

  const name = displayName(session.platform, session.handle)
  const mine = store.tokens.filter(t => t.platform === session.platform && t.handle === session.handle)
  const total = mine.reduce((s, t) => s + creatorEarnings(t), 0)
  const waiting = mine.reduce((s, t) => s + pending(t), 0)
  const paidOut = mine.reduce((s, t) => s + t.paidOutSol, 0)
  const walletBalance = Math.max(0, paidOut - withdrawn)
  const destOk = isValidSolanaAddress(dest)
  const progress = Math.min(1, waiting / PAYOUT_THRESHOLD_SOL)
  const { markPaidOut } = store

  // Eşik aşılınca otomatik ödeme — talep edilecek bir şey yok. Gerçekte backend worker yapar.
  useEffect(() => {
    if (waiting < PAYOUT_THRESHOLD_SOL || paying.current) return
    paying.current = true
    services.payout
      .payout(session, waiting)
      .then(() => markPaidOut(session.platform, session.handle, waiting))
      .finally(() => {
        paying.current = false
      })
  }, [waiting, session, markPaidOut])

  async function send() {
    if (!destOk || walletBalance <= 0) return
    setSending(true)
    try {
      await services.payout.withdraw(session, dest, walletBalance)
      setWithdrawn(w => w + walletBalance)
      setSent(walletBalance)
      setDest('')
    } finally {
      setSending(false)
    }
  }

  function copy() {
    void navigator.clipboard?.writeText(session.wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CreatorAvatar platform={session.platform} handle={session.handle} name={name} className="h-16 w-16 text-2xl" />
          <div>
            <p className="text-3xl font-semibold tracking-tight">{name}</p>
            <p className="text-lg text-zinc-500">@{session.handle}</p>
          </div>
        </div>
        <button className={ghostButtonCls} onClick={onSignOut}>
          <LogOut className="h-4 w-4" /> Çıkış
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-8">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Cüzdanın</span>
            <button onClick={copy} className="inline-flex items-center gap-1.5 font-mono hover:text-white">
              {shortAddr(session.wallet)} {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="mt-2 text-5xl font-semibold tracking-tight sm:text-6xl">{usd(walletBalance)}</p>
          <p className="mt-1 text-zinc-500">
            {sol(walletBalance, 4)} · toplam kazanç {usd(total)} · {mine.length} token
          </p>

          <div className="mt-8 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">Sıradaki ödeme</span>
              <span className="font-mono text-zinc-500">
                {usd(waiting)} / {usd(PAYOUT_THRESHOLD_SOL)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="text-sm text-zinc-500">Talep etmene gerek yok — eşik dolunca otomatik olarak cüzdanına gönderilir.</p>
          </div>
        </Card>

        <Card className="space-y-4 p-8">
          <p className="text-xl font-medium">Başka cüzdana gönder</p>
          <p className="text-sm text-zinc-500">İsteğe bağlı. Phantom, Solflare veya borsa adresin.</p>
          <input className={`${inputCls} font-mono text-sm`} value={dest} onChange={e => setDest(e.target.value)} placeholder="Solana adresi" />
          <button className={`${buttonCls} w-full`} disabled={!destOk || walletBalance <= 0 || sending} onClick={send}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Tümünü gönder
          </button>
          {sent !== null && <p className="text-sm text-emerald-300">{usd(sent)} gönderildi (demo).</p>}
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[34px] font-medium tracking-[-0.04em]">Adına çıkarılan tokenler</h2>
            <p className="text-zinc-500">Onaylarsan “Creator onayladı” rozeti alır. Reddedersen sitede gizlenir; birikmiş ücret yine senin.</p>
          </div>
          <button
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-white disabled:no-underline"
            disabled={optedOut}
            onClick={() => setOptedOut(true)}
          >
            {optedOut ? 'Adına yeni token çıkarılması kapatıldı (demo)' : 'Adıma yeni token çıkarılmasın (opt-out)'}
          </button>
        </div>
        {mine.map(t => (
          <Card key={t.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl">
              <TokenArt seed={t.mint} imageUrl={t.imageUrl} label={t.ticker} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-medium">
                {t.name} <span className="font-mono text-sm text-zinc-500">{t.ticker}</span>
              </p>
              <div className="mt-1">
                <StatusBadge status={t.creatorStatus} />
              </div>
            </div>
            <p className="text-xl font-semibold">{usd(creatorEarnings(t))}</p>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm transition hover:border-white/30 disabled:opacity-30"
                disabled={t.creatorStatus === 'verified'}
                onClick={() => store.setCreatorStatus(t.id, 'verified')}
              >
                <Check className="h-4 w-4" /> Onayla
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm transition hover:border-white/30 disabled:opacity-30"
                disabled={t.creatorStatus === 'rejected'}
                onClick={() => store.setCreatorStatus(t.id, 'rejected')}
              >
                <X className="h-4 w-4" /> Reddet
              </button>
            </div>
          </Card>
        ))}
        {mine.length === 0 && (
          <Card className="py-12 text-center text-zinc-500">
            Henüz adına çıkarılmış token yok.{' '}
            <a href="#/launch" className="text-white underline underline-offset-4">
              Bir tane başlat
            </a>
          </Card>
        )}
      </div>
    </div>
  )
}
