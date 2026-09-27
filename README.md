# paid.social — TikTok & Instagram creator ücretleri

pump.fun üzerinde çıkarılan tokenlerin **creator ücretlerini** bir TikTok veya Instagram kullanıcı adına yönlendiren platform.

## Nasıl çalışır

1. **Token çıkar:** Kullanıcı token bilgilerini girer ve ücret alıcısı olarak `TikTok @kullanici` veya `Instagram @kullanici` seçer.
2. **Otomatik cüzdan:** O kullanıcı adı için arka planda bir Solana cüzdanı oluşturulur. Creator ücretleri her işlemde doğrudan bu cüzdana akar.
3. **Creator girişi:** Hesap sahibi TikTok/Instagram ile giriş yapar; cüzdan ve içindeki bakiye ona geçer. Adres girmesi gerekmez, isterse başka cüzdana gönderebilir.

> TikTok ve Instagram'ın hesaba para/kripto yatırmaya izin veren bir API'si yok. Bu yüzden "kullanıcı adına bağlı cüzdan" modeli kullanılıyor.

## Durum

Bu sürüm **prototip**: veriler sahte (`src/store.ts`), tarayıcıda (localStorage) saklanıyor. Gerçek işlem yapılmaz.

| Ekran | Dosya |
|---|---|
| Keşfet (tokenler, hacim, ücretler) | `src/pages/Explore.tsx` |
| Token çıkar | `src/pages/Launch.tsx` |
| Creator paneli (giriş, bakiye, gönder) | `src/pages/Creator.tsx` |

## Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda http://localhost:5173 açılır.

## Gerçek sürüm için yapılacaklar

- [ ] **pump.fun entegrasyonu:** Token oluşturma ve creator ücreti alıcısının nasıl belirlendiğini güncel dokümandan doğrula (token creator cüzdanıyla mı çıkarılacak, yoksa ücret alıcısı sonradan değiştirilebiliyor mu). Ücret oranı `CREATOR_FEE_RATE` şu an tahmini değerdir.
- [ ] **Embedded wallet:** Privy / Dynamic vb. bir sağlayıcının TikTok ve Instagram kullanıcı adına **önceden cüzdan oluşturmayı** destekleyip desteklemediğini doğrula; `walletFor()` şu an sahte adres üretir.
- [ ] **TikTok Login Kit** ve **Instagram girişi** için geliştirici başvurusu (OAuth ile hesap sahipliği doğrulama).
- [ ] **Backend + veritabanı:** tokenler, kullanıcı adı ↔ cüzdan eşleşmesi, zincir üstü hacim/ücret takibi (Solana RPC / indexer).
- [ ] **İzin ve kötüye kullanım:** Birisi haberi olmayan bir creator adına token çıkarabilir. En azından "creator onaylamadı" etiketi, şikâyet/kaldırma akışı ve hukuki değerlendirme gerekli.

## Teknoloji

React 19 · Vite · TypeScript · Tailwind CSS v4 · lucide-react
