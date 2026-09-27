import { useEffect, useState } from 'react'
import type { Platform, Token } from './types'

// pump.fun creator fee oranı. Gerçek oran pump.fun tarafından belirlenir; entegrasyonda API'den okunmalı.
export const CREATOR_FEE_RATE = 0.0005

const STORAGE_KEY = 'paid-social:tokens'
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

export function feesEarned(t: Token): number {
  return t.volumeSol * CREATOR_FEE_RATE
}

// Creator cüzdanında duran (henüz dışarı gönderilmemiş) ücret
export function balance(t: Token): number {
  return Math.max(0, feesEarned(t) - t.claimedSol)
}

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function fakeMint(): string {
  let s = ''
  for (let i = 0; i < 40; i++) s += BASE58[Math.floor(Math.random() * BASE58.length)]
  return s + 'pump'
}

// Demo: kullanıcı adına bağlı cüzdan adresi. Gerçekte embedded wallet sağlayıcısı (Privy, Dynamic vb.)
// bu hesap için önceden cüzdan oluşturur; creator TikTok/IG ile giriş yapınca cüzdan onun olur.
export function walletFor(platform: Platform, handle: string): string {
  let h = 2166136261
  let s = ''
  for (let i = 0; i < 44; i++) {
    for (const c of `${platform}:${handle}:${i}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
    s += BASE58[(h >>> 0) % BASE58.length]
  }
  return s
}

const SEED: Token[] = ([
  { name: 'Kedi Coin', ticker: 'KEDI', platform: 'tiktok', handle: 'kedicikanal', volumeSol: 18420, description: 'TikTok’un en ünlü kedisi için.' },
  { name: 'Mangal Token', ticker: 'MANGAL', platform: 'instagram', handle: 'mangalustasi', volumeSol: 6310, description: 'Pazar mangalının resmi token’ı.' },
  { name: 'Dans Et', ticker: 'DANS', platform: 'tiktok', handle: 'dansci.elif', volumeSol: 2275, description: 'Her trend dansına bir token.' },
] as const).map((s, i) => ({
  ...s,
  id: `seed-${i}`,
  imageUrl: '',
  mint: fakeMint(),
  createdAt: Date.now() - (i + 1) * 36e5 * 7,
  claimedSol: 0,
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

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>(load)

  useEffect(() => save(tokens), [tokens])

  // Demo: işlem hacmini simüle eder. Gerçekte pump.fun / Solana verisinden gelecek.
  useEffect(() => {
    const id = setInterval(() => {
      setTokens(ts => ts.map(t => ({ ...t, volumeSol: t.volumeSol + Math.random() * 12 })))
    }, 2500)
    return () => clearInterval(id)
  }, [])

  function launch(input: Omit<Token, 'id' | 'mint' | 'createdAt' | 'volumeSol' | 'claimedSol'>): Token {
    const token: Token = {
      ...input,
      id: crypto.randomUUID(),
      mint: fakeMint(),
      createdAt: Date.now(),
      volumeSol: 0,
      claimedSol: 0,
    }
    setTokens(ts => [token, ...ts])
    return token
  }

  // Creator bakiyesini kendi dış cüzdanına gönderir (isteğe bağlı)
  function withdrawAll(platform: Platform, handle: string) {
    setTokens(ts =>
      ts.map(t => (t.platform === platform && t.handle === handle ? { ...t, claimedSol: feesEarned(t) } : t)),
    )
  }

  function reset() {
    setTokens(SEED)
  }

  return { tokens, launch, withdrawAll, reset }
}

export type TokenStore = ReturnType<typeof useTokens>
