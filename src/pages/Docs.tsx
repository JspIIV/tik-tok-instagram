import { CREATOR_SHARE, MAX_DEPLOYER_BPS, PAYOUT_THRESHOLD_SOL } from '../store'
import { Card } from '../ui'

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Nasıl çalışır',
    body: [
      'Deployer pump.fun’da token çıkarır ve ücretlerin gideceği TikTok veya Instagram kullanıcı adını seçer.',
      'Tokenin creator ücretinin %100’ü kalıcı olarak paid.social hazinesine yönlendirilir ve pump.fun ayarı kilitlenir. Kimse sonradan değiştiremez.',
      `Hazine ücretleri zincir üstünde toplar; %${CREATOR_SHARE * 100}’i kullanıcı adına deftere yazılır (deployer payı seçildiyse ondan önce düşülür).`,
      `Hesap sahibi TikTok/Instagram ile giriş yapınca bakiyesi ${PAYOUT_THRESHOLD_SOL} SOL eşiğini geçtiğinde otomatik olarak cüzdanına gönderilir. Talep edilecek bir şey yoktur.`,
    ],
  },
  {
    title: 'Uygunluk',
    body: [
      'Ücretin tamamı (%100) hazineye yönlendirilmeli; kısmi paylar kabul edilmez.',
      'pump.fun ücret ayarı kilitli olmalı (tek değişiklik hakkı kullanılmış).',
      `Deployer isteğe bağlı olarak toplanan ücretin %0–${MAX_DEPLOYER_BPS / 100}’unu alabilir.`,
    ],
  },
  {
    title: 'Creator koruması',
    body: [
      'Creator giriş yapıp onaylayana kadar her token “Creator onaylamadı” etiketiyle gösterilir.',
      'Creator bir tokeni reddedebilir; reddedilen token sitede gizlenir, birikmiş ücret yine creator’ındır.',
      'Creator adına yeni token çıkarılmasını tamamen kapatabilir (opt-out).',
    ],
  },
]

export default function Docs() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-5xl font-medium tracking-[-0.05em]">Dokümanlar</h1>
        <p className="mt-2 text-lg text-zinc-400">Teknik ayrıntılar depodaki docs/ARASTIRMA.md ve docs/PLAN.md dosyalarında.</p>
      </div>
      {SECTIONS.map(s => (
        <Card key={s.title} className="space-y-4 p-7">
          <h2 className="text-2xl font-medium tracking-tight">{s.title}</h2>
          <ol className="space-y-3 text-zinc-300">
            {s.body.map((b, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-sm text-zinc-600">{String(i + 1).padStart(2, '0')}</span>
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ol>
        </Card>
      ))}
    </div>
  )
}
