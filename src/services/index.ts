import { mockServices } from './mock'
import type { Services } from './types'

export type * from './types'
export { fakeMint } from './mock'

// Gerçek implementasyonlar hazır olunca burada seçilecek (ör. import.meta.env.VITE_BACKEND_URL varsa).
export const services: Services = mockServices
