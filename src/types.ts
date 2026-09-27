export type Platform = 'tiktok' | 'instagram'

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
  claimedSol: number
}
