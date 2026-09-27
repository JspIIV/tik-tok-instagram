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
}

export interface LaunchInput {
  name: string
  ticker: string
  imageUrl: string
  description: string
  platform: Platform
  handle: string
}

export interface CreatorSession {
  platform: Platform
  handle: string
  wallet: string
}
