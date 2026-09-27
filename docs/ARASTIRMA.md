# Araştırma notları (Eylül 2026)

> Kaynaklar aşağıda listelendi. `pump.fun`, `docs.privy.io` ve `usepaid.app` bu çalışma ortamının ağ politikası nedeniyle doğrudan açılamadı; bilgiler arama sonuçlarından, SDK dokümanlarından ve haberlerden derlendi. **Canlıya çıkmadan önce her maddeyi resmi dokümandan tekrar doğrulayın.**

## 1. Referans ürün: UsePaid (usepaid.app)

Kullanıcının örnek aldığı ürün. X (Twitter) için aynı şeyi yapıyor:

- Deployer tokeni pump.fun (veya Pons) üzerinde çıkarır, **creator ücretlerinin %100'ünü UsePaid hazine (treasury) cüzdanına** yönlendirir ve açıklamaya ücretlerin gideceği **X kullanıcı adını** yazar.
- Token ancak ücretin **tamamı** UsePaid'e yönlendirilmişse ve bu yönlendirme **kalıcıysa (kilitli)** kabul edilir.
- UsePaid ücretleri zincir üstünde toplar (claim), **%80'ini dolara çevirip X Money** üzerinden o X hesabına öder, **%20'si ile kendi tokeni PAID'i alıp yakar**.
- Alıcının onay vermesi, önceden haberi olması veya cüzdanı olması gerekmez. "Talep edilecek bir şey yok"; bakiye **ödeme eşiğini** geçince ve X Money hesabı ödeme alabilir olunca gönderilir.

**Bizim için çıkarım:** Asıl mekanizma "kullanıcı adına önceden cüzdan açmak" değil, **hazine + defter (ledger)** modeli: ücretler tek bir platform cüzdanında toplanır, veritabanında kullanıcı adına göre bakiye tutulur, hesap sahibi kimliğini kanıtlayınca ödeme yapılır. TikTok/Instagram'da X Money benzeri bir ödeme kanalı olmadığından ödeme adımını biz sağlamalıyız (bkz. §4).

## 2. pump.fun creator ücretleri

### Oranlar (pump.fun ücret tablosu, son güncelleme 20 Mayıs 2026)
- **Bonding curve:** toplam %1,25; bunun **%0,30'u creator'a**, %0,95'i protokole.
- **Mezun olmuş (graduated) PumpSwap havuzu:** piyasa değerine göre kademeli. Creator payı ~420 SOL piyasa değerinden sonra **%0,95'e** çıkıp piyasa değeri büyüdükçe **%0,05'e** kadar iner.
- Kanonik olmayan PumpSwap havuzlarında creator'a pay yok.
- ⇒ Koddaki sabit `CREATOR_FEE_RATE = 0.0005` yanlış/eski. Bonding curve için 0,003 kullanıldı; gerçek sürümde oran indexer'dan (zincir üstü fee config) okunmalı.

### Ücret alıcısı nasıl belirleniyor
- Varsayılan alıcı **tokeni oluşturan (deployer) cüzdan**.
- **Creator Fee Sharing (Ocak 2026):** Token çıktıktan sonra creator (veya CTO yöneticisi) ücreti **en fazla 10 cüzdana** yüzde (bps, 10.000 = %100) olarak bölebilir, token sahipliğini devredebilir, update authority'yi bırakabilir.
- **Tek değişiklik kuralı:** Deployer, lansman sonrası ücret ayarını **yalnızca bir kez** değiştirebilir; sonra ayar **kalıcı olarak kilitlenir**. → UsePaid'in "kalıcı yönlendirme" şartı buradan geliyor. Bizim için de aynısı: %100 → hazine, sonra kilit.
- **Sosyal hesaba ücret (social fee PDA):** pump.fun, ücreti bir sosyal hesaba bağlı PDA'ya yönlendirmeyi destekliyor ama **şu an yalnızca GitHub** (numerik GitHub user id). Farklı bir platform değeri girmek tokenin banlanmasına veya ücretlerin kaybolmasına yol açabilir. **TikTok/Instagram yok** → yerel çözümü kullanamayız, hazine modeli şart.

### Token oluşturma / ücret toplama araçları
- **Resmi SDK:** `@pump-fun/pump-sdk` (npm). Token oluşturma, alım-satım, fee sharing talimatları (`PumpFees` programı), mezun tokenler için `transferCreatorFeesToPump` + dağıtım.
- **PumpPortal:** `POST https://pumpportal.fun/api/trade-local` ile imzasız işlem üretir (tarayıcıda kullanıcının cüzdanı imzalar). Token oluşturmada ek ücret yok (ilk dev alımına normal işlem ücreti). Creator ücreti claim etmek için de endpoint'i var. Lightning API API anahtarı ister ve işlem başına %0,5 alır — **hazine anahtarıyla kullanılmamalı**.
- Öneri: Lansmanı **deployer'ın kendi cüzdanı (Phantom) imzalasın** (biz anahtar tutmayız); fee sharing'i aynı akışta %100 hazineye + kilit olarak ayarlayalım. Claim işlemini backend resmi SDK ile yapsın.

## 3. Embedded wallet sağlayıcıları

| | TikTok girişi | Instagram girişi | Solana | Kullanıcı girişinden önce cüzdan (pregenerate) |
|---|---|---|---|---|
| **Privy** | ✅ | ✅ | ✅ | ✅ `pregenerate wallets` API — ama bağlı hesap **platform user id** (subject) ile tanımlanır |
| **Dynamic** | ✅ (sosyal sağlayıcı listesinde) | ✅ | ✅ | Kısmen; "pregenerated wallet" e-posta/sosyal için var, TikTok/IG için doğrulanmadı |
| **Web3Auth** | Custom verifier / Auth0 üzerinden | Custom verifier üzerinden | ✅ | Kullanıcı adıyla değil, verifier id ile |

**Kritik sorun:** TikTok `open_id` ve Instagram kullanıcı id'si **uygulamaya özel** ve kullanıcı adından **önceden türetilemez**; sadece kullanıcı OAuth ile giriş yapınca öğrenilir. Yani "@kullanıcı adına şimdiden gerçek cüzdan aç" (mevcut prototipteki `walletFor`) güvenilir biçimde **yapılamaz**. Kullanıcı adı değişebilir de (biri eski adı alabilir).

**Sonuç:** Hazine + ledger modeli (UsePaid gibi). Creator ilk girişte OAuth ile kullanıcı adını kanıtlar → Privy o an Solana cüzdanını oluşturur → birikmiş bakiye gönderilir. Kullanıcı açısından sonuç aynı: "cüzdan adresi girmeden paran hesabında".

**Önerilen sağlayıcı: Privy** — TikTok + Instagram OAuth yerleşik, Solana embedded wallet, sunucu tarafı (server wallets) API'si ile hazineden ödeme kolay.

## 4. TikTok ve Instagram kimlik doğrulama

- **TikTok Login Kit (Web):** OAuth 2.0. `user.info.basic` (avatar, görünen ad, open_id) varsayılan; **kullanıcı adı (`username`) `user.info.profile` scope'u ile gelir ve uygulama incelemesi (review) gerektirir.**
- **Instagram API with Instagram Login:** Sadece **profesyonel hesaplar (Business/Creator)** için. Basic Display API Aralık 2024'te kapatıldı; **kişisel IG hesapları giriş yapamaz**. `instagram_business_basic` izni kullanıcı adını verir. Meta App Review gerekir.
- Her iki platformda da hesaba para gönderen bir API **yok** → ödeme kanalı: (a) embedded Solana cüzdanı (MVP), (b) ileride fiat (Stripe Connect / PayPal Payouts / Wise) — KYC ve lisans gerektirir.

## Kaynaklar

- UsePaid: [@UsePaid (X)](https://x.com/usepaid), [lansman gönderisi](https://x.com/UsePaid/status/2099941646024708213), [IQ.wiki](https://iq.wiki/wiki/usepaid), [Bitrue: What is UsePaid](https://www.bitrue.com/blog/what-is-usepaid), [Phemex: What is PAID](https://phemex.com/academy/what-is-paid-memecoin)
- pump.fun ücretleri: [pump.fun/docs/fees](https://pump.fun/docs/fees), [Fees explained 2026 – Frog Labs](https://froglabs.io/blog/pump-fun-fees-explained), [Smithii – creator fees](https://smithii.io/en/pump-fun-creator-fees/), [DEXTools – creator rewards 2026](https://www.dextools.io/tutorials/what-are-pump-fun-creator-rewards-how-they-work-2026)
- Fee sharing: [CoinMarketCap – overhaul](https://coinmarketcap.com/academy/article/pumpfun-overhauls-creator-fees-amid-launch-spike), [CoinMarketCap – tek değişiklik kuralı](https://coinmarketcap.com/academy/article/pumpdotfun-caps-creator-fee-changes-to-one-per-token), [Brave New Coin](https://bravenewcoin.com/insights/pump-fun-introduces-creator-fee-sharing-system-to-rebalance-platform-incentives), [pump-fun-sdk fee-sharing.md](https://github.com/nirholas/pump-fun-sdk/blob/main/docs/fee-sharing.md), [PANews – GitHub fee sharing](https://www.panewslab.com/en/articles/019c5c05-b21d-74f8-bf1e-4e7bc150800c)
- SDK/API: [@pump-fun/pump-sdk](https://www.npmjs.com/package/@pump-fun/pump-sdk), [PumpPortal token creation](https://pumpportal.fun/creation/), [PumpPortal local transaction API](https://pumpportal.fun/local-trading-api/trading-api/), [PumpPortal creator fee](https://pumpportal.fun/creator-fee/)
- Privy: [Pregenerate wallets](https://docs.privy.io/api-reference/users/pregenerate-wallets), [Privy for Solana](https://privy.io/blog/solana-support), [Authentication](https://docs.privy.io/guide/authentication)
- TikTok: [Login Kit Web](https://developers.tiktok.com/docs/en/login-kit-web), [Scopes overview](https://developers.tiktok.com/docs/en/scopes-overview)
