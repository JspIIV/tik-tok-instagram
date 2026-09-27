export type Platform = 'tiktok' | 'instagram'

// Creator tokeni gördü mü: giriş yapıp onaylayana kadar 'unverified'
export type CreatorStatus = 'unverified' | 'verified' | 'rejected'

export interface Token {
  id: string
  name: string
  ticker: string
  imageUrl: string
  description: string
  platform: Platform
  handle: string
  mint: string
  createdAt: number
  volumeSol: number
  // Hazineden creator'ın cüzdanına ödenmiş tutar
  paidOutSol: number
  creatorStatus: CreatorStatus
  // Deployer'a giden pay (bps, 0–1000)
  deployerBps: number
}

export interface Payment {
  id: string
  platform: Platform
  handle: string
  amountSol: number
  createdAt: number
  status: 'sent' | 'pending' | 'limit'
}

export interface LaunchInput {
  name: string
  ticker: string
  imageUrl: string
  description: string
  platform: Platform
  handle: string
  deployerBps: number
  initialBuySol: number
}

export interface CreatorSession {
  platform: Platform
  handle: string
  wallet: string
}
