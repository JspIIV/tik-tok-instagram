import { useEffect, useState } from 'react'
import { fakeMint, services } from './services'
import type { CreatorStatus, LaunchInput, Payment, Platform, Token } from './types'

// pump.fun bonding curve creator payı (%0,30, Mayıs 2026 tablosu). Mezun tokenlerde piyasa değerine göre
// %0,95 → %0,05 arası değişir; gerçek sürümde oran indexer'dan okunmalı (docs/ARASTIRMA.md).
export const CREATOR_FEE_RATE = 0.003
// Hazineye gelen ücretin creator'a ödenen kısmı; kalanı platform payı. Karar verilmedi (README → Açık sorular).
export const CREATOR_SHARE = 0.8
// Bu tutarın altındaki bakiyeler birikir, üstü otomatik ödenir
export const PAYOUT_THRESHOLD_SOL = 0.1
// Deployer en fazla toplanan ücretin %10'unu alabilir
export const MAX_DEPLOYER_BPS = 1000
// Demo: dolar gösterimi için sabit kur. Gerçekte fiyat servisinden (Pyth / Jupiter) gelecek.
export const SOL_USD = 150

const STORAGE_KEY = 'paid-social:v3'
const HANDLE_RULES: Record<Platform, RegExp> = {
  tiktok: /^[a-z0-9._]{2,24}$/,
  instagram: /^[a-z0-9._]{1,30}$/,
}

export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, '').toLowerCase()
}

export function isValidHandle(platform: Platform, handle: string): boolean {
  return HANDLE_RULES[platform].test(handle)
}

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address.trim())
}

// Tokenin ürettiği toplam creator ücreti (hepsi hazineye gider)
export function feesGenerated(t: Token): number {
  return t.volumeSol * CREATOR_FEE_RATE
}

// Creator'a düşen kısım: platform payı ve (varsa) deployer payı düşülür
export function creatorEarnings(t: Token): number {
  return feesGenerated(t) * (CREATOR_SHARE - t.deployerBps / 10_000)
}

// Hazinede bekleyen, henüz ödenmemiş creator bakiyesi
export function pending(t: Token): number {
  return Math.max(0, creatorEarnings(t) - t.paidOutSol)
}

// Demo piyasa değeri: hacimle kabaca orantılı
export function marketCapSol(t: Token): number {
  return 28 + t.volumeSol * 0.55
}

export const creatorKey = (platform: Platform, handle: string) => `${platform}:${handle}`

// Demo creator'lar (hepsi uydurma). Gerçekte isim/avatar OAuth profilinden gelir.
export const KNOWN_CREATORS: Record<string, { name: string }> = {
  'tiktok:kedicikanal': { name: 'Kedi Kanalı' },
  'instagram:mangalustasi': { name: 'Mangal Ustası' },
  'tiktok:dansci.elif': { name: 'Elif Dans' },
  'instagram:sokaklezzeti': { name: 'Sokak Lezzeti' },
  'tiktok:gezginmert': { name: 'Gezgin Mert' },
  'instagram:minikressam': { name: 'Minik Ressam' },
  'tiktok:teknoderya': { name: 'Tekno Derya' },
  'instagram:kahvekoku': { name: 'Kahve Kokusu' },
}

export function displayName(platform: Platform, handle: string) {
  return KNOWN_CREATORS[creatorKey(platform, handle)]?.name ?? handle
}

const H = 36e5
const SEED_TOKENS: Token[] = (
  [
    ['Kedi Coin', 'KEDI', 'tiktok', 'kedicikanal', 38420, 'verified', 9 * 24],
    ['Mangal', 'MANGAL', 'instagram', 'mangalustasi', 26310, 'unverified', 24],
    ['Dans Et', 'DANS', 'tiktok', 'dansci.elif', 19275, 'unverified', 24 * 24],
    ['Dürüm Gecesi', 'DURUM', 'instagram', 'sokaklezzeti', 14940, 'verified', 3 * 24],
    ['Pasaport', 'PSPT', 'tiktok', 'gezginmert', 9120, 'verified', 11 * 24],
    ['Fırça', 'FIRCA', 'instagram', 'minikressam', 7800, 'unverified', 8],
    ['Robot Kedi', 'RKEDI', 'tiktok', 'kedicikanal', 6410, 'verified', 11 * 24],
    ['Çip', 'CIP', 'tiktok', 'teknoderya', 5230, 'unverified', 24],
    ['Filtre', 'FLTR', 'instagram', 'kahvekoku', 4105, 'verified', 9 * 24],
    ['Mangal 2', 'MNGL2', 'instagram', 'mangalustasi', 2980, 'unverified', 8 * 24],
    ['Pati', 'PATI', 'tiktok', 'kedicikanal', 1760, 'verified', 13],
    ['Espresso', 'ESPR', 'instagram', 'kahvekoku', 940, 'unverified', 0.4],
  ] as const
).map(([name, ticker, platform, handle, volumeSol, creatorStatus, ageH], i) => ({
  id: `seed-${i}`,
  name,
  ticker,
  platform,
  handle,
  volumeSol,
  creatorStatus,
  description: '',
  imageUrl: '',
  mint: fakeMint(),
  createdAt: Date.now() - ageH * H,
  paidOutSol: 0,
  deployerBps: 0,
}))

const SEED_PAYMENTS: Payment[] = (
  [
    ['tiktok', 'kedicikanal', 5, 0.2, 'limit'],
    ['instagram', 'mangalustasi', 5, 0.5, 'limit'],
    ['tiktok', 'gezginmert', 1.2, 1, 'sent'],
    ['instagram', 'sokaklezzeti', 0.84, 2, 'sent'],
    ['tiktok', 'dansci.elif', 0.35, 3, 'sent'],
    ['instagram', 'kahvekoku', 0.21, 5, 'sent'],
    ['tiktok', 'teknoderya', 0.12, 7, 'sent'],
    ['instagram', 'minikressam', 0.1, 9, 'sent'],
  ] as const
).map(([platform, handle, amountSol, ageH, status], i) => ({
  id: `pay-${i}`,
  platform,
  handle,
  amountSol,
  status,
  createdAt: Date.now() - ageH * H,
}))

interface State {
  tokens: Token[]
  payments: Payment[]
}

const SEED: State = { tokens: SEED_TOKENS, payments: SEED_PAYMENTS }

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    // depolama erişilemiyorsa seed verisiyle devam
  }
  return SEED
}

function save(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // yoksay
  }
}

const isOwnedBy = (t: Token, platform: Platform, handle: string) => t.platform === platform && t.handle === handle

export interface Profile {
  platform: Platform
  handle: string
  name: string
  tokens: number
  receivedSol: number
  verified: boolean
}

export function profilesOf(tokens: Token[]): Profile[] {
  const map = new Map<string, Profile>()
  for (const t of tokens) {
    if (t.creatorStatus === 'rejected') continue
    const key = creatorKey(t.platform, t.handle)
    const p = map.get(key) ?? {
      platform: t.platform,
      handle: t.handle,
      name: displayName(t.platform, t.handle),
      tokens: 0,
      receivedSol: 0,
      verified: false,
    }
    p.tokens++
    p.receivedSol += creatorEarnings(t)
    p.verified ||= t.creatorStatus === 'verified'
    map.set(key, p)
  }
  return [...map.values()].sort((a, b) => b.receivedSol - a.receivedSol)
}

export function useStore() {
  const [state, setState] = useState<State>(load)
  const { tokens, payments } = state

  useEffect(() => save(state), [state])

  // Demo: işlem hacmini simüle eder. Gerçekte indexer'dan (Helius / RPC) gelecek.
  useEffect(() => {
    const id = setInterval(() => {
      setState(s => ({
        ...s,
        tokens: s.tokens.map(t => (t.creatorStatus === 'rejected' ? t : { ...t, volumeSol: t.volumeSol + Math.random() * 12 })),
      }))
    }, 2500)
    return () => clearInterval(id)
  }, [])

  async function launch(input: LaunchInput): Promise<Token> {
    const { mint } = await services.launch.launch(input)
    const token: Token = {
      name: input.name,
      ticker: input.ticker,
      imageUrl: input.imageUrl,
      description: input.description,
      platform: input.platform,
      handle: input.handle,
      deployerBps: input.deployerBps,
      id: crypto.randomUUID(),
      mint,
      createdAt: Date.now(),
      volumeSol: input.initialBuySol,
      paidOutSol: 0,
      creatorStatus: 'unverified',
    }
    setState(s => ({ ...s, tokens: [token, ...s.tokens] }))
    return token
  }

  // Hazinede bekleyen bakiyeyi creator'ın cüzdanına öder (gerçekte backend otomatik yapar)
  function markPaidOut(platform: Platform, handle: string, amountSol: number) {
    setState(s => ({
      tokens: s.tokens.map(t => (isOwnedBy(t, platform, handle) ? { ...t, paidOutSol: creatorEarnings(t) } : t)),
      payments: [
        { id: crypto.randomUUID(), platform, handle, amountSol, createdAt: Date.now(), status: 'sent' },
        ...s.payments,
      ],
    }))
  }

  function setCreatorStatus(id: string, creatorStatus: CreatorStatus) {
    setState(s => ({ ...s, tokens: s.tokens.map(t => (t.id === id ? { ...t, creatorStatus } : t)) }))
  }

  function reset() {
    setState(SEED)
  }

  return { tokens, payments, launch, markPaidOut, setCreatorStatus, reset }
}

export type Store = ReturnType<typeof useStore>
