import type { Services } from './types'

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function randomBase58(len: number): string {
  let s = ''
  for (let i = 0; i < len; i++) s += BASE58[Math.floor(Math.random() * BASE58.length)]
  return s
}

// Deterministik sahte adres: aynı hesap her girişte aynı cüzdanı görsün
function fakeWallet(seed: string): string {
  let h = 2166136261
  let s = ''
  for (let i = 0; i < 44; i++) {
    for (const c of `${seed}:${i}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
    s += BASE58[(h >>> 0) % BASE58.length]
  }
  return s
}

// Ağ gecikmesini taklit eder ki arayüzdeki yükleniyor durumları test edilebilsin
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

export function fakeMint(): string {
  return randomBase58(40) + 'pump'
}

export const mockServices: Services = {
  launch: {
    async launch() {
      await delay(700)
      return { mint: fakeMint(), feeBpsToTreasury: 10_000, feeLocked: true }
    },
  },
  auth: {
    async signIn(platform, handle) {
      await delay()
      return { platform, handle, wallet: fakeWallet(`${platform}:${handle}`) }
    },
    async signOut() {},
  },
  payout: {
    async payout() {
      await delay()
      return randomBase58(88)
    },
    async withdraw() {
      await delay()
      return randomBase58(88)
    },
  },
}
