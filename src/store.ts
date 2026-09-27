import { useEffect, useState } from 'react'
import { fakeMint, services } from './services'
import type { CreatorStatus, LaunchInput, Platform, Token } from './types'

// pump.fun bonding curve creator payı (%0,30, Mayıs 2026 tablosu). Mezun tokenlerde piyasa değerine göre
// %0,95 → %0,05 arası değişir; gerçek sürümde oran indexer'dan okunmalı (docs/ARASTIRMA.md).
export const CREATOR_FEE_RATE = 0.003
// Hazineye gelen ücretin creator'a ödenen kısmı; kalanı platform payı. Karar verilmedi (README → Açık sorular).
export const CREATOR_SHARE = 0.8
// Bu tutarın altındaki bakiyeler birikir, üstü otomatik ödenir
export const PAYOUT_THRESHOLD_SOL = 0.1

const STORAGE_KEY = 'paid-social:tokens:v2'
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

// Creator'a düşen kısım
export function creatorEarnings(t: Token): number {
  return feesGenerated(t) * CREATOR_SHARE
}

// Hazinede bekleyen, henüz ödenmemiş creator bakiyesi
export function pending(t: Token): number {
  return Math.max(0, creatorEarnings(t) - t.paidOutSol)
}

const SEED: Token[] = ([
  { name: 'Kedi Coin', ticker: 'KEDI', platform: 'tiktok', handle: 'kedicikanal', volumeSol: 18420, description: 'TikTok’un en ünlü kedisi için.', creatorStatus: 'verified' },
  { name: 'Mangal Token', ticker: 'MANGAL', platform: 'instagram', handle: 'mangalustasi', volumeSol: 6310, description: 'Pazar mangalının resmi token’ı.', creatorStatus: 'unverified' },
  { name: 'Dans Et', ticker: 'DANS', platform: 'tiktok', handle: 'dansci.elif', volumeSol: 2275, description: 'Her trend dansına bir token.', creatorStatus: 'unverified' },
  { name: 'Sokak Lezzeti', ticker: 'DONER', platform: 'instagram', handle: 'sokaklezzeti', volumeSol: 940, description: 'Gece 3 dürümcüleri adına.', creatorStatus: 'verified' },
] satisfies Partial<Token>[]).map((s, i) => ({
  ...s,
  id: `seed-${i}`,
  imageUrl: '',
  mint: fakeMint(),
  createdAt: Date.now() - (i + 1) * 36e5 * 7,
  paidOutSol: 0,
}))

function load(): Token[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Token[]
  } catch {
    // depolama erişilemiyorsa seed verisiyle devam
  }
  return SEED
}

function save(tokens: Token[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  } catch {
    // yoksay
  }
}

const isOwnedBy = (t: Token, platform: Platform, handle: string) => t.platform === platform && t.handle === handle

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>(load)

  useEffect(() => save(tokens), [tokens])

  // Demo: işlem hacmini simüle eder. Gerçekte indexer'dan (Helius / RPC) gelecek.
  useEffect(() => {
    const id = setInterval(() => {
      setTokens(ts => ts.map(t => (t.creatorStatus === 'rejected' ? t : { ...t, volumeSol: t.volumeSol + Math.random() * 12 })))
    }, 2500)
    return () => clearInterval(id)
  }, [])

  async function launch(input: LaunchInput): Promise<Token> {
    const { mint } = await services.launch.launch(input)
    const token: Token = {
      ...input,
      id: crypto.randomUUID(),
      mint,
      createdAt: Date.now(),
      volumeSol: 0,
      paidOutSol: 0,
      creatorStatus: 'unverified',
    }
    setTokens(ts => [token, ...ts])
    return token
  }

  // Hazinede bekleyen bakiyeyi creator'ın cüzdanına öder (gerçekte backend otomatik yapar)
  function markPaidOut(platform: Platform, handle: string) {
    setTokens(ts => ts.map(t => (isOwnedBy(t, platform, handle) ? { ...t, paidOutSol: creatorEarnings(t) } : t)))
  }

  function setCreatorStatus(id: string, creatorStatus: CreatorStatus) {
    setTokens(ts => ts.map(t => (t.id === id ? { ...t, creatorStatus } : t)))
  }

  function reset() {
    setTokens(SEED)
  }

  return { tokens, launch, markPaidOut, setCreatorStatus, reset }
}

export type TokenStore = ReturnType<typeof useTokens>
