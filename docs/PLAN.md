# Mimari ve entegrasyon planı

Model: **UsePaid'in TikTok/Instagram versiyonu.** Token creator ücretleri tek bir platform hazinesinde toplanır, kullanıcı adına göre deftere (ledger) yazılır, hesap sahibi TikTok/Instagram ile giriş yapınca ödenir. Gerekçe: [ARASTIRMA.md](./ARASTIRMA.md).

## Akış

```
Deployer (Phantom)                 paid.social backend                     Creator (TikTok/IG)
──────────────────                 ───────────────────                     ───────────────────
1. Form: ad, sembol, görsel,
   platform + @kullanıcı
2. pump.fun create tx  ─────────►  (tx'i PumpPortal/pump-sdk ile hazırlar)
   + fee sharing: %100 → hazine
   + ayar kilidi
   imzalar & gönderir
                                   3. Indexer: yeni mint'i görür,
                                      fee config = %100 hazine + kilitli mi?
                                      → evet: "uygun" listesine alır
                                   4. Claim worker: periyodik olarak ücretleri
                                      hazineye claim eder, mint → handle
                                      oranında ledger'a yazar
                                                                           5. "TikTok ile giriş" (OAuth)
                                   6. OAuth'tan username doğrulanır,  ◄──  
                                      Privy Solana cüzdanı oluşturulur
                                   7. Bakiye ≥ ödeme eşiği → otomatik  ──► cüzdanda SOL
                                      transfer (hazine → creator cüzdanı)    (isterse Phantom'a gönderir)
```

## Bileşenler

| Bileşen | Teknoloji önerisi | Görev |
|---|---|---|
| Frontend | Mevcut React + Vite (statik, CDN) | Keşfet, lansman, creator paneli |
| API | Node (Hono/Fastify) veya Next.js route handlers | Token kaydı, ledger okuma, OAuth callback, ödeme tetikleme |
| Veritabanı | Postgres (Supabase/Neon) | Aşağıdaki şema |
| Indexer | Helius webhooks (pump.fun program id'leri) + yedek olarak RPC poll | Yeni tokenler, fee config, hacim |
| Claim worker | Cron (5–15 dk), `@pump-fun/pump-sdk` | Ücretleri hazineye claim, ledger'a yazma |
| Hazine | Privy server wallet veya KMS/HSM'de anahtar, **multisig (Squads)** soğuk kasa | Ücretleri tutar, ödemeleri imzalar |
| Kimlik + cüzdan | Privy (TikTok + Instagram OAuth, Solana embedded wallet) | Creator girişi ve cüzdanı |

### Veritabanı şeması (özet)

```sql
creators(id, platform, platform_user_id, handle, privy_user_id, wallet, verified_at, opted_out_at)
tokens(mint, name, ticker, image_url, platform, handle, deployer, fee_bps_to_treasury, fee_locked,
       status /* pending|eligible|ineligible|removed */, creator_status /* unverified|verified|rejected */, created_at)
fee_events(id, mint, tx_sig UNIQUE, lamports, claimed_at)             -- claim edilen her ücret
ledger(id, platform, handle, mint, lamports, kind /* credit|payout|platform_fee */, ref, created_at)
payouts(id, creator_id, lamports, tx_sig, status, created_at)
reports(id, mint, reason, reporter, status, created_at)
```

Ledger **handle'a** yazılır (platform_user_id henüz bilinmediği için). İlk doğrulamada `handle → platform_user_id` bağlanır; bundan sonra kullanıcı adı değişse de bakiye id'ye bağlı kalır. Kullanıcı adı başka birine geçerse eski krediler eski id'de kalır.

## Uygunluk kuralları (UsePaid ile aynı)
- Ücretin **%100'ü** hazineye yönlendirilmiş olmalı (kısmi pay kabul edilmez).
- pump.fun fee ayarı **kilitli** olmalı (tek değişiklik hakkı kullanılmış).
- Handle metadata açıklamasında ve bizim DB kaydında aynı olmalı. Uymayan tokenler listelenmez, ledger'a yazılmaz.

## Ücret dağıtımı
- Varsayılan: **%X creator'a, %Y platform'a** (UsePaid: %80 / %20 burn). Oran açık soru — README'ye bakın.
- Ödeme eşiği: örn. 0,1 SOL (işlem ücreti ve spam'e karşı). Eşik altı bakiye birikir.

## İzin ve kötüye kullanım
1. **"Creator onaylamadı" rozeti:** Creator giriş yapıp tokeni kabul edene kadar her token bu rozetle gösterilir; arayüzde "bu kişi bu tokeni desteklemiyor olabilir" uyarısı.
2. **Onay:** Creator giriş yapınca adına çıkarılan tokenleri görür, her biri için "Onayla" veya "Reddet" seçer. Onaylanan → "Creator onayladı" rozeti.
3. **Reddetme / kaldırma:** Reddedilen token sitede gizlenir (zincirden silinemez). Ücretler yine creator'a ödenir (ya da creator isterse bağışa yönlendirilir) — deployer'ın geri alması mümkün değil, çünkü fee config kilitli.
4. **Tamamen çıkış (opt-out):** Creator "adıma token çıkarılmasın" diyebilir; yeni lansmanlar formda engellenir.
5. **Şikâyet formu** (her token sayfasında) + manuel inceleme kuyruğu; marka/ünlü adı listesi (blocklist).
6. **Sahtecilik uyarısı:** Arayüz asla "@kullanıcı bu tokeni çıkardı/destekliyor" demez; sadece "ücretleri @kullanıcı'ya gidiyor" der.
7. **Talep edilmemiş bakiyeler:** N ay (örn. 12) talep edilmezse ne olacağı açıkça yazılmalı (hukuki danışmanlık gerekli).

## Riskler
- **Custody / lisans:** Hazine başkalarının parasını tutuyor → birçok ülkede para transferi / VASP lisansı konusu. Canlıdan önce hukuk görüşü şart.
- **Hazine anahtarı:** Tek sıcak cüzdan olmamalı; claim → multisig, ödemeler günlük limitli sıcak cüzdandan.
- **OAuth onayı:** TikTok `user.info.profile` ve Meta App Review süreçleri haftalar sürebilir; kişisel Instagram hesapları desteklenmez.
- **pump.fun kural değişiklikleri:** Fee oranları ve fee sharing kuralları 2026'da birkaç kez değişti; indexer oranları zincirden okumalı.

## Uygulama sırası
1. ✅ Arayüzü servis katmanına ayır (`src/services/`) — mock implementasyon.
2. Backend iskeleti + Postgres şeması + `/api/tokens`, `/api/creators/:platform/:handle`.
3. Privy entegrasyonu (TikTok + Instagram login) → `AuthService` gerçek implementasyonu.
4. Devnet'te pump-sdk ile lansman + fee sharing → `LaunchService` gerçek implementasyonu.
5. Indexer + claim worker (devnet), ledger.
6. Payout (devnet) → `PayoutService`.
7. Onay/reddet/şikâyet akışları, hukuk incelemesi, mainnet.
