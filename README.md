# paid.social — TikTok & Instagram creator ücretleri

pump.fun tokenlerinin **creator ücretlerini** bir TikTok veya Instagram kullanıcı adına yönlendiren platform. X için yapılan [UsePaid](https://usepaid.app) modelinin TikTok/Instagram versiyonu.

## Nasıl çalışır

1. **Token çıkar:** Deployer token bilgilerini girer ve ücret alıcısı olarak `TikTok @kullanici` veya `Instagram @kullanici` seçer.
2. **Ücretler kilitlenir:** pump.fun fee sharing ile creator ücretinin **%100'ü** kalıcı olarak paid.social hazinesine yönlendirilir. Sonradan kimse değiştiremez.
3. **Creator sadece giriş yapar:** Hesap sahibi TikTok/Instagram ile giriş yapınca adına biriken pay (şu an %80) otomatik olarak cüzdanına gönderilir. Talep formu yok, adres girmek zorunda değil; isterse Phantom'a aktarır.
4. **Onay rozeti:** Creator onaylayana kadar token **“Creator onaylamadı”** etiketiyle gösterilir. Creator onaylar veya reddeder (reddedilen token sitede gizlenir).

Neden hazine modeli? pump.fun'ın yerleşik "sosyal hesaba ücret" özelliği şu an sadece GitHub'ı destekliyor ve TikTok/IG kullanıcı id'leri girişten önce bilinemiyor. Ayrıntılar: [docs/ARASTIRMA.md](docs/ARASTIRMA.md), mimari: [docs/PLAN.md](docs/PLAN.md).

## Durum

Bu sürüm **prototip**: veriler sahte, tarayıcıda (localStorage) saklanıyor, gerçek işlem yapılmaz.

| Kısım | Dosya |
|---|---|
| Düzen (sol menü, üst arama, footer) | `src/App.tsx` |
| Ana sayfa (hero, kutular, top tokenler/profiller, ödemeler) | `src/pages/Home.tsx` |
| Keşfet / Ödemeler / Analitik / Dokümanlar | `src/pages/Explore.tsx`, `Payments.tsx`, `Analytics.tsx`, `Docs.tsx` |
| Başlat (iki sütunlu form + önizleme) | `src/pages/Launch.tsx` |
| Creator paneli (giriş, otomatik ödeme, onay/red, opt-out) | `src/pages/Creator.tsx` |
| Kartlar (token, profil, ödeme) | `src/components.tsx` |
| Entegrasyon arayüzleri + mock | `src/services/` |
| Oranlar, eşik, state | `src/store.ts` |

Gerçek entegrasyon için `src/services/types.ts`'deki arayüzler uygulanıp `src/services/index.ts`'de mock yerine takılır.

## Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda http://localhost:5173 açılır. Sayfalar: `#/home`, `#/explore`, `#/payments`, `#/analytics`, `#/launch`, `#/creator`, `#/docs`.

## Açık sorular (senin kararın)

1. **Platform payı:** Hazineye gelen ücretin ne kadarı creator'a gitsin? Kodda `CREATOR_SHARE = 0.8` (UsePaid: %80 creator, %20 kendi tokenini alıp yakma). Kendi tokenimiz olacak mı, yoksa %20 doğrudan gelir mi?
2. **Ödeme kanalı:** MVP'de creator'a Solana cüzdanı (Privy) öneriliyor. İleride TL/USD ödeme (Stripe/PayPal/Wise) istiyor muyuz? Bu KYC ve lisans gerektirir.
3. **Hukuk:** Hazine başkalarının parasını tuttuğu için para transferi/kripto varlık hizmet sağlayıcı düzenlemeleri devreye girebilir. Hangi ülkede şirket kurulacak? Hukuk danışmanı ile görüşülmeli.
4. **Talep edilmeyen bakiyeler:** Creator hiç giriş yapmazsa bakiyeye ne olacak (süresiz bekler / X ay sonra bağış / iade yok)?
5. **Ödeme eşiği:** `PAYOUT_THRESHOLD_SOL = 0.1` uygun mu?
6. **Instagram kişisel hesapları:** Meta'nın API'si sadece Business/Creator hesaplarına izin veriyor. Kişisel hesaplar için ne yapacağız?
7. **İsim:** "paid.social", UsePaid ("Paid") ile karıştırılabilir; marka riski olmaması için farklı bir isim düşünülebilir.
8. **Tasarım referansı:** usepaid.app bu bulut ortamından açılamadı (ağ politikası engelliyor). Birebir benzerlik istenen yerler varsa ekran görüntüsü gönderilmeli; logo/marka kopyalanmamalı.

## Gerçek sürüm için yapılacaklar

- [ ] Backend + Postgres (şema `docs/PLAN.md`'de)
- [ ] Privy: TikTok + Instagram girişi, Solana embedded wallet → `AuthService`
- [ ] pump-sdk / PumpPortal ile devnet lansmanı + fee sharing %100 hazine + kilit → `LaunchService`
- [ ] Indexer (Helius) + claim worker + ledger
- [ ] Otomatik ödeme worker'ı → `PayoutService`
- [ ] TikTok Login Kit (`user.info.profile` onayı) ve Meta App Review başvuruları
- [ ] Şikâyet formu, blocklist, hukuki inceleme

## Teknoloji

React 19 · Vite · TypeScript · Tailwind CSS v4 · lucide-react · Geist font
