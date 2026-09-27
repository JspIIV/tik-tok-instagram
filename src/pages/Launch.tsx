import { useMemo, useState } from 'react'
import { Bell, CheckCircle2, ChevronDown, ImagePlus, Loader2, Search } from 'lucide-react'
import { CREATOR_SHARE, KNOWN_CREATORS, MAX_DEPLOYER_BPS, displayName, isValidHandle, normalizeHandle, type Store } from '../store'
import type { Platform, Token } from '../types'
import { PLATFORM_LABEL } from '../format'
import { Chip, CreatorAvatar, Field, Logo, PlatformToggle, PumpIcon, SolanaIcon, StatusBadge, TokenArt, Verified, buttonCls, inputCls } from '../ui'

type Mode = 'launch' | 'register' | 'walletless'
const MODES: { id: Mode; label: string }[] = [
  { id: 'launch', label: 'Başlat' },
  { id: 'register', label: 'Kaydet' },
  { id: 'walletless', label: 'Cüzdansız' },
]
const DESC_LIMIT = 256

export default function Launch({ store }: { store: Store }) {
  const [mode, setMode] = useState<Mode>('launch')
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [rawHandle, setRawHandle] = useState('')
  const [deployerPct, setDeployerPct] = useState('')
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [showSocial, setShowSocial] = useState(false)
  const [initialBuy, setInitialBuy] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [launched, setLaunched] = useState<Token | null>(null)

  const handle = normalizeHandle(rawHandle)
  const handleOk = isValidHandle(platform, handle)
  const deployerBps = Math.round(Math.min(10, Math.max(0, Number(deployerPct) || 0)) * 100)
  const buy = Math.max(0, Number(initialBuy) || 0)
  // UsePaid gibi: açıklamanın sonuna ücret satırı eklenir, zincir üstünde kimin alıcı olduğu okunabilir
  const feeLine = handleOk ? `\n\nCreator fees → ${PLATFORM_LABEL[platform]} @${handle} via paid.social` : ''
  const descLen = description.length + feeLine.length
  const canSubmit = name.trim() !== '' && /^[A-Z0-9]{2,10}$/.test(ticker) && handleOk && consent && descLen <= DESC_LIMIT && !busy

  const suggestions = useMemo(() => {
    if (!handle || handleOk && KNOWN_CREATORS[`${platform}:${handle}`]) return []
    return Object.keys(KNOWN_CREATORS)
      .filter(k => k.startsWith(`${platform}:`) && k.includes(handle))
      .slice(0, 3)
      .map(k => k.split(':')[1])
  }, [platform, handle, handleOk])

  function pickImage(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

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
          imageUrl,
          description: description.trim() + feeLine,
          platform,
          handle,
          deployerBps,
          initialBuySol: buy,
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token çıkarılamadı')
    } finally {
      setBusy(false)
    }
  }

  if (launched) {
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-[36px] border border-white/[0.06] bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14" />
        <h1 className="text-4xl font-medium tracking-[-0.04em]">{launched.ticker} yayında</h1>
        <p className="text-zinc-400">Creator ücretleri kalıcı olarak şu hesaba yönlendirildi:</p>
        <div className="flex flex-col items-center gap-2">
          <CreatorAvatar platform={launched.platform} handle={launched.handle} name={displayName(launched.platform, launched.handle)} />
          <p className="text-lg font-semibold">@{launched.handle}</p>
          <StatusBadge status={launched.creatorStatus} />
        </div>
        <p className="break-all rounded-2xl bg-black/40 p-3 font-mono text-xs text-zinc-500">{launched.mint}</p>
        <div className="flex justify-center gap-3">
          <a href="#/explore" className="rounded-full border border-white/10 px-6 py-3">
            Keşfet’te gör
          </a>
          <button
            className={buttonCls}
            onClick={() => {
              setLaunched(null)
              setName('')
              setTicker('')
              setImageUrl('')
              setDescription('')
              setRawHandle('')
              setConsent(false)
            }}
          >
            Yeni token
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[36px] border border-white/[0.06] bg-card p-8 sm:p-10">
        <h1 className="text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Ücretleri bir creator’a yönlendir</h1>
        <p className="mt-3 max-w-3xl text-lg text-zinc-400">
          Yeni bir token başlat ve creator ücretlerini paid.social hazinesine yönlendir, ya da daha önce çıkardığın bir tokenin ücretlerini
          yeniden yönlendir.
        </p>
      </div>

      <form onSubmit={submit} className="grid overflow-hidden rounded-[36px] border border-white/[0.06] bg-[#1b1b1b] lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-8 p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-4xl font-medium tracking-[-0.04em]">Token başlat</h2>
            <div className="flex gap-1">
              {MODES.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`rounded-full px-5 py-2.5 text-[17px] transition ${mode === m.id ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode !== 'launch' ? (
            <div className="rounded-3xl border border-white/[0.08] p-8 text-center text-zinc-400">
              {mode === 'register'
                ? 'Kaydet: daha önce çıkardığın bir pump.fun tokeninin ücret ayarını (tek değişiklik hakkınla) %100 hazineye yönlendir. Yakında.'
                : 'Cüzdansız: kartla öde, tokeni biz senin adına çıkaralım. Yakında.'}
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Chip active>
                  <PumpIcon className="h-5 w-5" /> Pump
                </Chip>
              </div>

              <div className="space-y-4">
                <p className="text-[15px] font-medium">Ücretler kime gitsin?</p>
                <PlatformToggle value={platform} onChange={setPlatform} />
                <div className="relative">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    className={`${inputCls} pl-12`}
                    value={rawHandle}
                    onChange={e => setRawHandle(e.target.value)}
                    placeholder={`${PLATFORM_LABEL[platform]}’ta hesap ara`}
                  />
                </div>
                {rawHandle && !handleOk && <p className="text-sm text-red-400">Geçersiz kullanıcı adı</p>}
                {suggestions.length > 0 && (
                  <div className="space-y-1.5">
                    {suggestions.map(h => (
                      <button
                        type="button"
                        key={h}
                        onClick={() => setRawHandle(h)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-2.5 text-left transition hover:bg-white/[0.08]"
                      >
                        <CreatorAvatar platform={platform} handle={h} name={displayName(platform, h)} className="h-9 w-9" />
                        <span>
                          <span className="flex items-center gap-1 font-semibold">
                            {displayName(platform, h)} <Verified className="h-4 w-4" />
                          </span>
                          <span className="text-sm text-zinc-500">@{h}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/[0.08] p-6">
                <Field label="Deployer payı (isteğe bağlı)" hint={`Toplanan creator ücretinin %0–${MAX_DEPLOYER_BPS / 100}’u.`}>
                  <div className="relative">
                    <input
                      className={inputCls}
                      inputMode="decimal"
                      value={deployerPct}
                      onChange={e => setDeployerPct(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400">%</span>
                  </div>
                </Field>
              </div>

              <hr className="border-white/[0.06]" />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="İsim">
                  <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Kedi Coin" maxLength={32} />
                </Field>
                <Field label="Sembol">
                  <input
                    className={inputCls}
                    value={ticker}
                    onChange={e => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="KEDI"
                    maxLength={10}
                  />
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-4 rounded-3xl border border-dashed border-white/[0.12] p-4 transition hover:border-white/25">
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.06]">
                  {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-zinc-400" />}
                </span>
                <span className="text-[17px]">{imageUrl ? 'Görseli değiştir' : 'Görsel seç'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => pickImage(e.target.files?.[0])} />
              </label>

              <Field
                label="Açıklama"
                hint={
                  <span className={descLen > DESC_LIMIT ? 'text-red-400' : ''}>
                    {descLen}/{DESC_LIMIT} karakter (ücret satırı dahil)
                  </span>
                }
              >
                <textarea
                  className={`${inputCls} min-h-32`}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Token ne hakkında."
                />
              </Field>

              <div>
                <button
                  type="button"
                  onClick={() => setShowSocial(s => !s)}
                  className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-zinc-400 hover:text-white"
                >
                  Sosyal linkler (isteğe bağlı) <ChevronDown className={`h-4 w-4 transition ${showSocial ? 'rotate-180' : ''}`} />
                </button>
                {showSocial && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input className={inputCls} placeholder="Web sitesi" />
                    <input className={inputCls} placeholder="Telegram" />
                  </div>
                )}
              </div>

              <hr className="border-white/[0.06]" />

              <Field label="İlk alım (isteğe bağlı)" hint="Token çıktığında kendi tokeninden al.">
                <div className="relative">
                  <input
                    className={inputCls}
                    inputMode="decimal"
                    value={initialBuy}
                    onChange={e => setInitialBuy(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="0.00"
                  />
                  <SolanaIcon className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2" />
                </div>
              </Field>

              <hr className="border-white/[0.06]" />

              <label className="flex cursor-pointer items-start gap-3 text-[17px] text-zinc-300">
                <input type="checkbox" className="mt-1 h-5 w-5 accent-white" checked={consent} onChange={e => setConsent(e.target.checked)} />
                <span>
                  Ücret yönlendirmesinin kalıcı olduğunu, tokenin creator onaylayana kadar{' '}
                  <b className="font-medium text-white underline underline-offset-4">“Creator onaylamadı”</b> etiketiyle gösterileceğini
                  kabul ediyorum.
                </span>
              </label>

              {error && <p className="text-red-400">{error}</p>}
              <button type="submit" disabled={!canSubmit} className={`${buttonCls} w-full py-4 text-[17px]`}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? 'Cüzdanda onay bekleniyor…' : 'Cüzdanı bağla ve başlat'}
              </button>
              <p className="text-sm text-zinc-500">Demo: gerçek işlem yapılmaz.</p>
            </>
          )}
        </div>

        <aside className="bg-[#232323] p-6 sm:p-10">
          <div className="space-y-6 lg:sticky lg:top-24">
          <div className="flex items-start gap-3 rounded-3xl border border-white/[0.08] bg-[#1e1e1e] p-5 shadow-2xl">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 font-bold text-emerald-300">$</span>
                <Logo className="h-9 w-9" />
              </div>
              <p className="text-[17px]">
                <b>paid.social</b> sana 1,50 $ gönderdi · “{handleOk ? `@${handle}` : '@creator'} için creator ücreti”
              </p>
              <p className="text-zinc-500">şimdi</p>
            </div>
            <Bell className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#1e1e1e] p-5">
            <div className="aspect-square overflow-hidden rounded-2xl bg-white/[0.04]">
              {name || imageUrl ? (
                <TokenArt seed={name + ticker} imageUrl={imageUrl} label={ticker || name} />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-zinc-600">–</div>
              )}
            </div>
            <p className="mt-4 flex items-baseline gap-2 text-lg">
              {name || 'Token adı'} <span className="font-mono text-sm text-zinc-500">{ticker || 'SEMBOL'}</span>
            </p>
            <p className="mt-1 flex gap-4 text-xl font-semibold">
              <span>
                $0 <span className="text-sm font-normal text-zinc-500">MC</span>
              </span>
              <span>
                $0 <span className="text-sm font-normal text-zinc-500">gönderildi</span>
              </span>
            </p>
            <dl className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06] text-[15px]">
              <div className="flex justify-between py-3">
                <dt className="text-zinc-300">{PLATFORM_LABEL[platform]} alıcısı</dt>
                <dd>{handleOk ? `@${handle}` : '—'}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-zinc-300">Alıcı payı</dt>
                <dd>%{Math.round(CREATOR_SHARE * 100 - deployerBps / 100)}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-zinc-300">Deployer payı</dt>
                <dd>%{deployerBps / 100}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-zinc-300">Ücret ayarı</dt>
                <dd>%100 hazine · kilitli</dd>
              </div>
            </dl>
          </div>
          </div>
        </aside>
      </form>
    </div>
  )
}
