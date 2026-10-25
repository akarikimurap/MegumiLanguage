# Megumi (恵み) — Türkçe ile Japonca

Türkçe ana dil, İngilizce yardımcı dil olarak tasarlanmış, telefona göre yapılmış bir Japonca öğrenme uygulaması. Tarayıcıda çalışır; Android için APK olarak da indirilebilir.

## 📱 Telefona kurulum (APK)

1. Bu deponun **Releases** sayfasını aç ve en son sürümdeki `Megumi-x.y.z.apk` dosyasını telefonuna indir.
2. İndirilen dosyayı aç. Android ilk kez "bilinmeyen uygulamaları yükleme" izni ister; tarayıcına veya Dosyalar uygulamasına bu izni ver.
3. **Güncelleme:** Yeni sürümün APK'sını eskisinin üzerine kur — ilerlemen korunur. (Uygulamayı *silersen* ilerleme de silinir; önce Profil ▸ Yedek ▸ "Yedeği kopyala".)
4. **Sesli okuma** için telefonda Japonca ses gerekir: Ayarlar ▸ Erişilebilirlik / Sistem ▸ *Metin okuma çıkışı* ▸ Google konuşma hizmetleri ▸ *Ses verilerini yükle* ▸ Japonca.

## Özellikler

- **Kana**: Hiragana ve katakana tabloları; her harfin romajisi, **Türk alfabesiyle okunuşu** (shi → şi, chi → çi, ji → ci) ve telaffuz ipuçları.
- **Dersler**: 4 ünite, 21 ders (alfabe, kelime, gramer). Gramer konuları **Türkçeyle karşılaştırılarak** anlatılır (を ≈ -(y)ı, で ≈ -de, の ≈ -(n)ın, か ≈ mı).
- **Yazma alıştırmaları**: Parmakla yazma alanı; çizgi **sırası ve yönü** kontrol edilir. Üç mod: *İzle*, *Takip et*, *Ezbere* (iki hatadan sonra ipucu). Hata sayısı tekrar takvimini etkiler.
- **Günlük kanji**: 192 kanji (N5–N4). Her gün seçilen sayıda yeni kanji (Profil'den 1–5): anlam, on/kun okunuşları, örnek kelimeler, akılda tutma ipucu → çizgi sırasını izle → üzerinden geç → ezbere yaz → kısa test.
- **Egzersiz sonrası kelime ezberi**: Her kana dersi, yazma pratiği, kana testi ve günlük kanjiden sonra, *yalnızca bildiğin ve o egzersizde çalıştığın harflerle yazılabilen* kelimeler gelir. Kelime kartları → anlam sorusu → harf karolarıyla yazma.
- **Yaz sekmesi**: Kelimeleri ve günlük cümleleri harf harf, ezbere yazarsın. Yalnızca öğrendiğin kana ve kanjilerle yazılabilen kelime/cümleler gelir; öğrenmediğin kanjiler kana ile yazılır, öğrendikçe kanjili hâle gelir.
- **Aralıklı tekrar**: Leitner kutuları (1 → 6); bildiğin kartlar daha seyrek gelir.
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
| `www/strokes.js` | Çizgi sırası verisi — **elle düzenleme**, `npm run strokes` üretir |
| `www/app.js`, `www/styles.css` | Uygulama mantığı ve tasarım |
| `www/capacitor.js` | Capacitor çekirdeği (`npm install` sırasında otomatik kopyalanır) |
| `tools/build-strokes.mjs` | KanjiVG'den çizgi verisini indirir ve `www/strokes.js`'i üretir |
| `tools/make-logo.mjs` | Uygulama simgesini (`assets/logo.png`) üretir |
| `.github/workflows/android.yml` | APK'yı derleyip imzalayan ve Releases'e yükleyen GitHub Actions iş akışı |

## Geliştirme

```bash
npm install
```

```bash
npm run serve
```

Tarayıcıda `http://localhost:5173` adresini aç. Telefonda denemek için aynı Wi-Fi'de `http://<bilgisayarın-IP-adresi>:5173`.

**Yeni kanji eklerken:** `www/kanji.js`'e ekle, sonra çizgi verisini yeniden üret:

```bash
npm run strokes
```

## Yeni sürüm yayınlama (APK)

APK, GitHub Actions üzerinde derlenir; bilgisayarında Android SDK gerekmez. Bir sürüm etiketi gönder:

```bash
git tag v1.0.1
```

```bash
git push origin v1.0.1
```

Birkaç dakika sonra APK, Releases sayfasında `Megumi-1.0.1.apk` olarak çıkar. Her sürümde etiket numarasını artır.

### İmzalama anahtarı (bir kez)

Android, güncellemeyi yalnızca **aynı anahtarla** imzalanmışsa eski kurulumun üzerine yükler. Anahtar depoda **değil**, GitHub secret'larında durur:

- Depo ▸ Settings ▸ Secrets and variables ▸ Actions ▸ *New repository secret*
  - `ANDROID_KEYSTORE_PASSWORD` — anahtar parolası
  - `ANDROID_KEYSTORE_BASE64` — `keys/megumi.jks` dosyasının base64 hâli

İkisinin değerleri yerel `keys/GITHUB-SECRETS.txt` dosyasında. `keys/` klasörü git'e girmez — **güvenli bir yere yedekle**; kaybolursa yeni anahtarla imzalanan sürüm eski kurulumun üzerine yüklenemez.

## Lisans notu

Çizgi sırası verisi [KanjiVG](https://kanjivg.tagaini.net) projesinden alınmıştır (© Ulrich Apel ve katkıda bulunanlar, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)). `www/strokes.js` ve uygulama simgesi bu verinin türevidir ve aynı lisansla paylaşılmalıdır; uygulama içinde Profil sayfasında atıf yer alır.
