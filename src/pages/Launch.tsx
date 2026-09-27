import { useState } from 'react'
import { ArrowDown, CheckCircle2, Loader2, Lock, Rocket } from 'lucide-react'
import { CREATOR_SHARE, isValidHandle, normalizeHandle, type TokenStore } from '../store'
import type { Platform, Token } from '../types'
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
import { PLATFORM_LABEL } from '../format'

export default function Launch({ store }: { store: TokenStore }) {
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [rawHandle, setRawHandle] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [launched, setLaunched] = useState<Token | null>(null)

  const handle = normalizeHandle(rawHandle)
  const handleOk = isValidHandle(platform, handle)
  const handleError = rawHandle && !handleOk ? 'Geçersiz kullanıcı adı' : undefined
  const canSubmit = name.trim() !== '' && /^[A-Z0-9]{2,10}$/.test(ticker) && handleOk && consent && !busy

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    try {
      setLaunched(
        await store.launch({
          name: name.trim(),
          ticker,
          imageUrl: imageUrl.trim(),
          description: description.trim(),
          platform,
          handle,
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token çıkarılamadı')
    } finally {
      setBusy(false)
    }
  }

  function resetForm() {
    setLaunched(null)
    setName('')
    setTicker('')
    setImageUrl('')
    setDescription('')
    setRawHandle('')
    setConsent(false)
  }

  if (launched) {
    return (
      <Card className="animate-rise mx-auto max-w-md space-y-5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
        <div>
          <h2 className="text-2xl font-semibold">${launched.ticker} yayında</h2>
          <p className="mt-2 text-sm text-zinc-400">Creator ücretleri kalıcı olarak şu hesaba yönlendirildi:</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Handle platform={launched.platform} handle={launched.handle} className="text-base" />
          <StatusBadge status={launched.creatorStatus} />
        </div>
        <p className="break-all rounded-xl bg-black/40 p-3 font-mono text-[11px] text-zinc-500">{launched.mint}</p>
        <div className="flex justify-center gap-2">
          <a href="#/explore" className={ghostButtonCls}>
            Keşfet’te gör
          </a>
          <button className={buttonCls} onClick={resetForm}>
            Yeni token
          </button>
        </div>
      </Card>
    )
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Token çıkar</h1>
          <p className="mt-1 text-zinc-500">pump.fun’da token oluştur ve ücretlerini bir creator’a bağla.</p>
        </div>

        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <Field label="Token adı">
              <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Kedi Coin" maxLength={32} />
            </Field>
            <Field label="Sembol">
              <input
                className={`${inputCls} font-mono`}
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="KEDI"
                maxLength={10}
              />
            </Field>
          </div>
          <Field label="Görsel URL" hint="İsteğe bağlı">
            <input className={inputCls} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Açıklama">
            <textarea
              className={`${inputCls} min-h-24 resize-none`}
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={280}
              placeholder="Bu token ne için?"
            />
          </Field>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="font-medium">Ücretler kime gitsin?</p>
            <p className="mt-1 text-sm text-zinc-500">Kullanıcı adını yazman yeterli. Creator’ın cüzdanı ya da onayı gerekmez.</p>
          </div>
          <PlatformToggle value={platform} onChange={setPlatform} />
          <Field label={`${PLATFORM_LABEL[platform]} kullanıcı adı`} error={handleError}>
            <div className="relative">
              <PlatformIcon platform={platform} className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input className={`${inputCls} pl-10`} value={rawHandle} onChange={e => setRawHandle(e.target.value)} placeholder="@kullaniciadi" />
            </div>
          </Field>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-zinc-600">Önizleme</p>
          <div className="flex items-center gap-3">
            <TokenAvatar ticker={ticker} imageUrl={imageUrl} size="h-14 w-14" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{name || 'Token adı'}</p>
              <p className="font-mono text-sm text-zinc-500">${ticker || 'SEMBOL'}</p>
            </div>
          </div>
          {description && <p className="text-sm text-zinc-400">{description}</p>}

          <div className="space-y-1 rounded-xl bg-black/30 p-3 text-sm">
            <Row label="Creator ücreti" value="%100" />
            <div className="flex justify-center py-0.5 text-zinc-700">
              <ArrowDown className="h-3.5 w-3.5" />
            </div>
            <Row label="paid.social hazinesi" value={<span className="inline-flex items-center gap-1 text-zinc-400"><Lock className="h-3 w-3" /> kilitli</span>} />
            <div className="flex justify-center py-0.5 text-zinc-700">
              <ArrowDown className="h-3.5 w-3.5" />
            </div>
            <Row
              label={handleOk ? <Handle platform={platform} handle={handle} /> : <span className="text-zinc-600">@kullanıcı</span>}
              value={<span className="text-accent">%{CREATOR_SHARE * 100}</span>}
            />
          </div>
        </Card>

        <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-relaxed text-zinc-400">
          <input type="checkbox" className="mt-0.5 accent-[#3ef0a8]" checked={consent} onChange={e => setConsent(e.target.checked)} />
          <span>
            Ücret yönlendirmesinin kalıcı olduğunu ve geri alınamayacağını anlıyorum. Token, creator onaylayana kadar{' '}
            <b className="text-amber-300">“Creator onaylamadı”</b> etiketiyle gösterilir; creator reddederse sitede gizlenir.
          </span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={!canSubmit} className={`${buttonCls} w-full py-3`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          {busy ? 'Cüzdanda onay bekleniyor…' : 'Token çıkar'}
        </button>
      </div>
    </form>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
      <span className="text-zinc-300">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  )
}
