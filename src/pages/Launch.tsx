import { useState } from 'react'
import { CheckCircle2, Rocket } from 'lucide-react'
import { isValidHandle, normalizeHandle, walletFor, type TokenStore } from '../store'
import type { Platform, Token } from '../types'
import { Card, Field, PlatformBadge, PlatformToggle, PLATFORM_LABEL, buttonCls, inputCls, shortAddr } from '../ui'

export default function Launch({ store }: { store: TokenStore }) {
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [rawHandle, setRawHandle] = useState('')
  const [launched, setLaunched] = useState<Token | null>(null)

  const handle = normalizeHandle(rawHandle)
  const handleOk = isValidHandle(platform, handle)
  const handleError = rawHandle && !handleOk ? 'Geçersiz kullanıcı adı' : undefined
  const canSubmit = name.trim() !== '' && /^[A-Z0-9]{2,10}$/.test(ticker) && handleOk

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLaunched(
      store.launch({
        name: name.trim(),
        ticker,
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        platform,
        handle,
      }),
    )
  }

  function resetForm() {
    setLaunched(null)
    setName('')
    setTicker('')
    setImageUrl('')
    setDescription('')
    setRawHandle('')
  }

  if (launched) {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <h2 className="text-xl font-semibold">${launched.ticker} yayında!</h2>
        <p className="text-sm text-zinc-400">Creator ücretleri her işlemde doğrudan bu hesabın cüzdanına gidiyor:</p>
        <PlatformBadge platform={launched.platform} handle={launched.handle} />
        <p className="font-mono text-xs text-zinc-500">
          Cüzdan: {shortAddr(walletFor(launched.platform, launched.handle))}
        </p>
        <p className="break-all rounded-lg bg-zinc-950 p-2 font-mono text-xs text-zinc-500">Mint: {launched.mint}</p>
        <button className={buttonCls} onClick={resetForm}>
          Yeni token çıkar
        </button>
      </Card>
    )
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-3xl gap-6 md:grid-cols-[1fr_300px]">
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">pump.fun'da token çıkar</h2>
        <Field label="Token adı">
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Kedi Coin" maxLength={32} />
        </Field>
        <Field label="Sembol" hint="2–10 karakter, büyük harf">
          <input
            className={inputCls}
            value={ticker}
            onChange={e => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="KEDI"
            maxLength={10}
          />
        </Field>
        <Field label="Görsel URL" hint="İsteğe bağlı">
          <input className={inputCls} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Açıklama">
          <textarea className={`${inputCls} min-h-20`} value={description} onChange={e => setDescription(e.target.value)} maxLength={280} />
        </Field>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4">
          <div>
            <h3 className="font-semibold">Ücretler kime gitsin?</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Bu hesap için otomatik cüzdan açılır, creator ücretleri direkt oraya akar. Hesap sahibi sadece giriş yapar.
            </p>
          </div>
          <PlatformToggle value={platform} onChange={setPlatform} />
          <Field label={`${PLATFORM_LABEL[platform]} kullanıcı adı`} error={handleError}>
            <input className={inputCls} value={rawHandle} onChange={e => setRawHandle(e.target.value)} placeholder="@kullaniciadi" />
          </Field>
          {handleOk && (
            <p className="rounded-lg bg-zinc-950 p-2.5 font-mono text-xs text-zinc-500">
              @{handle} cüzdanı: {shortAddr(walletFor(platform, handle))}
            </p>
          )}
        </Card>
        <button type="submit" disabled={!canSubmit} className={`${buttonCls} w-full`}>
          <Rocket className="h-4 w-4" /> Token çıkar
        </button>
      </div>
    </form>
  )
}
