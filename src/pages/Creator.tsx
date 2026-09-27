import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Loader2, LogOut, Send, ShieldCheck, Wallet, X } from 'lucide-react'
import { services } from '../services'
import {
  PAYOUT_THRESHOLD_SOL,
  creatorEarnings,
  isValidHandle,
  isValidSolanaAddress,
  normalizeHandle,
  pending,
  type TokenStore,
} from '../store'
import type { CreatorSession, Platform } from '../types'
import {
  Card,
  Field,
  Handle,
  PlatformIcon,
  PlatformToggle,
  StatusBadge,
  TokenAvatar,
  buttonCls,
  ghostButtonCls,
  inputCls,
} from '../ui'
import { PLATFORM_LABEL, shortAddr, sol } from '../format'

export default function Creator({ store }: { store: TokenStore }) {
  const [session, setSession] = useState<CreatorSession | null>(null)
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [rawHandle, setRawHandle] = useState('')
  const [busy, setBusy] = useState(false)

  const handle = normalizeHandle(rawHandle)

  async function signIn() {
    setBusy(true)
    try {
      setSession(await services.auth.signIn(platform, handle))
    } finally {
      setBusy(false)
    }
  }

  if (!session) {
    const brand = platform === 'tiktok' ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-gradient-to-r from-amber-400 via-insta to-violet-500 text-white hover:brightness-110'
    return (
      <div className="mx-auto max-w-md space-y-6 pt-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Paran seni bekliyor</h1>
          <p className="mt-2 text-zinc-400">
            Adına çıkarılan tokenlerin ücretleri hesabına birikir. Giriş yap, otomatik olarak cüzdanına gelsin.
          </p>
        </div>
        <Card className="space-y-4 p-6">
          <PlatformToggle value={platform} onChange={setPlatform} />
          <Field label={`${PLATFORM_LABEL[platform]} kullanıcı adı`} hint="Demo: gerçek sürümde bu alan yok, kullanıcı adı OAuth girişinden gelir.">
            <input
              className={inputCls}
              value={rawHandle}
              onChange={e => setRawHandle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && isValidHandle(platform, handle) && signIn()}
              placeholder="@kedicikanal"
            />
          </Field>
          <button
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 ${brand}`}
            disabled={!isValidHandle(platform, handle) || busy}
            onClick={signIn}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlatformIcon platform={platform} className="h-4 w-4" />}
            {PLATFORM_LABEL[platform]} ile devam et
          </button>
          <p className="flex items-start gap-2 text-xs text-zinc-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Sadece hesabının sana ait olduğunu doğrularız. Paylaşım yapmayız, şifreni görmeyiz.
          </p>
        </Card>
      </div>
    )
  }

  return <Dashboard store={store} session={session} onSignOut={() => void services.auth.signOut().then(() => setSession(null))} />
}

function Dashboard({ store, session, onSignOut }: { store: TokenStore; session: CreatorSession; onSignOut: () => void }) {
  const [dest, setDest] = useState('')
  const [withdrawn, setWithdrawn] = useState(0)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const paying = useRef(false)

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
      .then(() => markPaidOut(session.platform, session.handle))
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Hoş geldin</p>
          <Handle platform={session.platform} handle={session.handle} className="text-xl font-semibold text-white" />
        </div>
        <button className={ghostButtonCls} onClick={onSignOut}>
          <LogOut className="h-4 w-4" /> Çıkış
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
          <p className="flex items-center gap-2 text-xs text-zinc-500">
            <Wallet className="h-3.5 w-3.5" /> Cüzdanın
            <button onClick={copy} className="inline-flex items-center gap-1 font-mono text-zinc-400 hover:text-white">
              {shortAddr(session.wallet)} {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
            </button>
          </p>
          <p className="mt-3 font-mono text-4xl font-medium tracking-tight text-accent sm:text-5xl">{sol(walletBalance)}</p>
          <p className="mt-1 text-sm text-zinc-500">
            Toplam kazanç {sol(total)} · {mine.length} token
          </p>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Sıradaki ödeme</span>
              <span className="font-mono text-zinc-500">
                {sol(waiting)} / {sol(PAYOUT_THRESHOLD_SOL, 2)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="text-xs text-zinc-600">Talep etmene gerek yok — eşik dolunca otomatik olarak cüzdanına gönderilir.</p>
          </div>
        </Card>

        <Card className="space-y-3 p-6">
          <p className="font-medium">Başka cüzdana gönder</p>
          <p className="text-xs text-zinc-500">İsteğe bağlı. Phantom, Solflare veya borsa adresin.</p>
          <input className={`${inputCls} font-mono text-xs`} value={dest} onChange={e => setDest(e.target.value)} placeholder="Solana adresi" />
          <button className={`${buttonCls} w-full`} disabled={!destOk || walletBalance <= 0 || sending} onClick={send}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Tümünü gönder
          </button>
          {sent !== null && <p className="text-xs text-accent">{sol(sent)} gönderildi (demo).</p>}
        </Card>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="font-semibold">Adına çıkarılan tokenler</h2>
          <p className="text-sm text-zinc-500">Onaylarsan “Creator onayladı” rozeti alır. Reddedersen sitede gizlenir; birikmiş ücretler yine senin.</p>
        </div>
        {mine.map(t => (
          <Card key={t.id} className="flex flex-wrap items-center gap-4">
            <TokenAvatar ticker={t.ticker} imageUrl={t.imageUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {t.name} <span className="font-mono text-xs text-zinc-500">${t.ticker}</span>
              </p>
              <div className="mt-1">
                <StatusBadge status={t.creatorStatus} />
              </div>
            </div>
            <p className="font-mono text-sm text-accent">{sol(creatorEarnings(t))}</p>
            <div className="flex gap-2">
              <button
                className={`${ghostButtonCls} px-3`}
                disabled={t.creatorStatus === 'verified'}
                onClick={() => store.setCreatorStatus(t.id, 'verified')}
              >
                <Check className="h-4 w-4" /> Onayla
              </button>
              <button
                className={`${ghostButtonCls} px-3`}
                disabled={t.creatorStatus === 'rejected'}
                onClick={() => store.setCreatorStatus(t.id, 'rejected')}
              >
                <X className="h-4 w-4" /> Reddet
              </button>
            </div>
          </Card>
        ))}
        {mine.length === 0 && (
          <Card className="py-10 text-center text-sm text-zinc-500">
            Henüz adına çıkarılmış token yok.{' '}
            <a href="#/launch" className="text-accent hover:underline">
              Bir tane çıkar
            </a>
          </Card>
        )}
      </div>
    </div>
  )
}
