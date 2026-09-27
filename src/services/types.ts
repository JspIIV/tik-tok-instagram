import type { CreatorSession, LaunchInput, Platform } from '../types'

// Gerçek entegrasyonlar bu arayüzleri uygular (bkz. docs/PLAN.md). Şu an sadece mock var.

export interface LaunchResult {
  mint: string
  // pump.fun fee sharing: bps cinsinden hazineye giden pay ve ayarın kilitli olup olmadığı
  feeBpsToTreasury: number
  feeLocked: boolean
}

export interface LaunchService {
  // Gerçekte: pump-sdk / PumpPortal ile create + fee sharing (%100 hazine) + kilit işlemini
  // hazırlar, deployer'ın cüzdanına imzalatır ve gönderir.
  launch(input: LaunchInput): Promise<LaunchResult>
}

export interface AuthService {
  // Gerçekte: Privy ile TikTok / Instagram OAuth. Kullanıcı adı OAuth yanıtından gelir,
  // kullanıcıdan alınmaz. Mock sürüm doğrulama yapmadan verilen adı kabul eder.
  signIn(platform: Platform, handle: string): Promise<CreatorSession>
  signOut(): Promise<void>
}

export interface PayoutService {
  // Gerçekte: backend hazineden creator'ın Privy cüzdanına transfer yapar, tx imzasını döner.
  payout(session: CreatorSession, amountSol: number): Promise<string>
  // Creator'ın kendi cüzdanından dış adrese gönderim (Privy embedded wallet imzalar).
  withdraw(session: CreatorSession, destination: string, amountSol: number): Promise<string>
}

export interface Services {
  launch: LaunchService
  auth: AuthService
  payout: PayoutService
}
