# Megumi Language (恵み) — Türkçe ile Japonca

**Megumi Language**, [**Megumi Projesi**](https://discord.gg/4gzM6eZgQ8)'nin dil öğrenme uygulamasıdır. Türkçe ana dil, İngilizce yardımcı dil olarak tasarlanmış, telefona göre yapılmış bir Japonca öğrenme uygulamasıdır. Tarayıcıda çalışır, Android için APK olarak da indirilebilir.

> 🧪 **Şu anki sürüm: Megumi Language Beta 0.2** — uygulama deneme aşamasında, hatalar olabilir.

## 📱 Telefona kurulum (APK)

1. Bu deponun [**Releases**](../../releases) sayfasını aç ve en son sürümdeki `MegumiLanguage-….apk` dosyasını (ör. `MegumiLanguage-0.2-beta.apk`) telefonuna indir.
2. İndirilen dosyayı aç. Android ilk kez "bilinmeyen uygulamaları yükleme" izni ister, tarayıcına veya Dosyalar uygulamasına bu izni ver.
3. **Güncelleme:** Yeni sürümün APK'sını eskisinin üzerine kur — ilerlemen korunur. (Uygulamayı *silersen* ilerleme de silinir, önce Profil ▸ Yedek ▸ "Yedeği kopyala".)
4. **Sesli okuma** için telefonda Japonca ses gerekir: Ayarlar ▸ Erişilebilirlik / Sistem ▸ *Metin okuma çıkışı* ▸ Google konuşma hizmetleri ▸ *Ses verilerini yükle* ▸ Japonca.

## Özellikler

- **Kana**: Hiragana ve katakana tabloları, her harfin romajisi, **Türk alfabesiyle okunuşu** (shi → şi, chi → çi, ji → ci) ve telaffuz ipuçları.
- **Dersler**: 4 ünite, 21 ders (alfabe, kelime, gramer). Gramer konuları **Türkçeyle karşılaştırılarak** anlatılır (を ≈ -(y)ı, で ≈ -de, の ≈ -(n)ın, か ≈ mı).
- **Yazma alıştırmaları**: Parmakla yazma alanı, çizgi **sırası ve yönü** kontrol edilir. Üç mod: *İzle*, *Takip et*, *Ezbere* (iki hatadan sonra ipucu). Hata sayısı tekrar takvimini etkiler.
- **Günlük kanji**: 313 kanji (N5–N4 ve bazı N3, okunuşlar ve örnekler KANJIDIC2/JMdict ile otomatik doğrulanır). Her gün seçilen sayıda yeni kanji (Profil'den 1–5): anlam, on/kun okunuşları, örnek kelimeler, akılda tutma ipucu → çizgi sırasını izle → üzerinden geç → ezbere yaz → kısa test.
- **Egzersiz sonrası kelime ezberi**: Her kana dersi, yazma pratiği, kana testi ve günlük kanjiden sonra, *yalnızca bildiğin ve o egzersizde çalıştığın harflerle yazılabilen* kelimeler gelir. Kelime kartları → anlam sorusu → harf karolarıyla yazma.
- **Okuma**: Aozora Bunko'dan telifi dolmuş 5 hikâye (手袋を買いに, 蜘蛛の糸, 注文の多い料理店, 杜子春, 夢十夜), bölüm bölüm. Kanjilerin üstünde okunuş (hepsi / yalnızca bilmediğin kanjiler / kapalı), kelimeye dokununca okunuş, sözlük biçimi, Türkçe anlam (yoksa JMdict'ten İngilizce) ve kanjileri, tek dokunuşla tekrar destesine ekleme, ▶ ile cümle cümle sesli okuma.
- **Kendi metnin ve kitapların**: Okuduğun bir internet romanından (ör. Narō'daki Re:Zero) kopyaladığın bölümü yapıştırırsın ya da **EPUB / PDF** kitap eklersin. Metin **yalnızca cihazda** kuromoji ile işlenir, uygulamanın kalıcı hafızasında (IndexedDB) saklanır ve aynı okuyucuda okunuşlu, sözlüklü açılır. Uzun kitaplarda bölüm seçici var. DRM korumalı kitaplar ve taranmış (resim) PDF'ler desteklenmez. Hiçbir metin depoya veya uygulamaya eklenmez.
- **Sözlük**: Japonca, romaji (ör. *neko*), İngilizce veya Türkçe arama. Önce Megumi listesi (Türkçe), sonra çevrimdışı JMdict, internet varsa **Jisho.org** sonuçları. Her sonuçta sesli okuma ve tek dokunuşla desteye ekleme. (Jisho sonuçları Android uygulamasında görünür, tarayıcı CORS nedeniyle engeller, orada "sitede aç" bağlantısı çıkar.)
- **Dinleme**: Kelime dinleme (anlamını seç), dikte (duyduğunu harflerle yaz), cümle dinleme (çevirisini seç), "Ne duydun?" (doğru yazılışı seç), yavaş dinleme seçeneği. Öğrendiğin kelime/cümleler önce gelir.
- **Pratik ▸ Yazma**: Kelimeleri ve günlük cümleleri harf harf, ezbere yazarsın. Yalnızca öğrendiğin kana ve kanjilerle yazılabilen kelime/cümleler gelir, öğrenmediğin kanjiler kana ile yazılır, öğrendikçe kanjili hâle gelir.
- **Kelime havuzu**: ~260 kelime + ders kelimeleri + kanji örnekleri, aynı okunuşlu kelimeler (箸/橋) ayrı tutulur.
- **Aralıklı tekrar**: Leitner kutuları (1 → 6), bildiğin kartlar daha seyrek gelir.
- **İki dilli arayüz**: Her açıklamada önce Türkçe, altında İngilizce. Profil'den İngilizce, romaji ve Türkçe okunuş ayrı ayrı kapatılabilir.
- Seri (🔥), XP, günlük hedef, ilerleme yedeği (kopyala / yapıştır).

## Proje yapısı

| Yol | İçerik |
|---|---|
| `www/` | Uygulamanın kendisi (statik web dosyaları) |
| `www/data.js` | Kana, ders kelimeleri, gramer, dersler |
| `www/kanji.js` | Kanji listesi (anlam, okunuşlar, örnekler, ipuçları). Öğrenme sırası = listedeki sıra |
| `www/words.js` | Kana kelime havuzu (`['ねこ', 'kedi', 'cat', '猫']`) |
| `www/sentences.js` | Günlük cümle havuzu (`日本[にほん] {へ} 行[い]きます。` — biçim dosyanın başında) |
| `www/stories.js` | Okuma kütüphanesi (önceden işlenmiş hikâyeler) — `npm run reader` üretir |
| `www/vendor/` | kuromoji ve JMdict sözlüğü — depoya girmez, `npm install` ve `npm run dict` üretir |
| `www/strokes.js` | Çizgi sırası verisi — **elle düzenleme**, `npm run strokes` üretir |
| `www/app.js`, `www/styles.css` | Uygulama mantığı ve tasarım |
| `www/capacitor.js` | Capacitor çekirdeği (`npm install` sırasında otomatik kopyalanır) |
| `tools/build-strokes.mjs` | KanjiVG'den çizgi verisini indirir ve `www/strokes.js`'i üretir |
| `tools/build-dict.mjs` | JMdict'ten okuyucu sözlüğünü (`www/vendor/jmdict.js`) üretir |
| `tools/build-reader.mjs` | Aozora Bunko hikâyelerini indirip kelimelere böler (`www/stories.js`) |
| `tools/check-data.mjs` | Kanji okunuşlarını ve örnek kelimeleri KANJIDIC2/JMdict ile doğrular |
| `tools/postinstall.mjs` | `npm install` sonrası kütüphaneleri `www/` altına kopyalar |
| `tools/make-logo.mjs` | Uygulama simgesini (`assets/logo.png`) üretir |
| `.github/workflows/android.yml` | APK'yı derleyip imzalayan ve Releases'e yükleyen GitHub Actions iş akışı |

## Geliştirme

```bash
npm install
```

```bash
npm run dict
```

```bash
npm run serve
```

`npm run dict` okuyucunun sözlüğünü bir kez üretir (~11 MB indirir). Tarayıcıda `http://localhost:5173` adresini aç. Telefonda denemek için aynı Wi-Fi'de `http://<bilgisayarın-IP-adresi>:5173`.

**Yeni kanji veya kelime eklerken:** `www/kanji.js` / `www/words.js`'e ekle, doğrula ve çizgi verisini yeniden üret:

```bash
npm run check
```

```bash
npm run strokes
```

## Yeni sürüm yayınlama (APK)

APK, GitHub Actions üzerinde derlenir, bilgisayarında Android SDK gerekmez. Bir sürüm etiketi gönder:

```bash
git tag v0.3-beta
```

```bash
git push origin v0.3-beta
```

Birkaç dakika sonra APK, Releases sayfasında **Megumi Language Beta 0.3** başlığıyla (ön sürüm olarak) `MegumiLanguage-0.3-beta.apk` adıyla çıkar. Sonu `-beta` olan etiketler "Beta x.y" ön sürümü olarak, `v1.0.0` gibi etiketler normal sürüm olarak yayınlanır. Her sürümde numarayı artır ve `www/app.js` içindeki `APP_VERSION`'ı da güncelle.

### İmzalama anahtarı (bir kez)

Android, güncellemeyi yalnızca **aynı anahtarla** imzalanmışsa eski kurulumun üzerine yükler. Anahtar depoda **değil**, GitHub secret'larında durur:

- Depo ▸ Settings ▸ Secrets and variables ▸ Actions ▸ *New repository secret*
  - `ANDROID_KEYSTORE_PASSWORD` — anahtar parolası
  - `ANDROID_KEYSTORE_BASE64` — `keys/megumi.jks` dosyasının base64 hâli

İkisinin değerleri yerel `keys/GITHUB-SECRETS.txt` dosyasında. `keys/` klasörü git'e girmez — **güvenli bir yere yedekle**, kaybolursa yeni anahtarla imzalanan sürüm eski kurulumun üzerine yüklenemez.

## Lisans

- **Kod:** [MIT](LICENSE)
- **Projeye özgü eğitim içeriği** (ders metinleri, anlamlar, ipuçları, cümleler): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- **Üçüncü taraf veriler ve yazılımlar** (KanjiVG, JMdict/KANJIDIC2, kuromoji + mecab-ipadic, pdf.js, fflate, Aozora Bunko, Capacitor, Jisho.org): her biri kendi lisansıyla — ayrıntılar [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
