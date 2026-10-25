# Güncelleme notları

Megumi Language, [Megumi Projesi](https://discord.gg/4gzM6eZgQ8)'nin dil öğrenme uygulamasıdır. En yeni sürüm en üsttedir.

<!-- Yeni sürüm eklerken başlığı aynı biçimde yaz: "## Beta x.y (vx.y-beta) — tarih". GitHub Actions bu bölümü sürüm notu olarak kullanır. -->

## Beta 0.2.1 (v0.2.1-beta) — 25 Ekim 2026

**Düzeltme**

- Telefonda yapıştırılan metinler ve EPUB / PDF kitaplar işlenemiyordu. Android, metin işleyicinin (kuromoji) sözlük dosyalarını APK'ya koyarken adlarını değiştiriyordu, dosyalar artık bozulmadan paketleniyor.
- APK 2 MB küçüldü (25,8 MB).

Beta 0.2'deki tüm yenilikler bu sürümde de var. **Beta 0.2 yerine bu sürümü kur.**

## Beta 0.2 (v0.2-beta) — 25 Ekim 2026

> ⚠️ Bu sürümde yapıştırılan metinler ve EPUB / PDF kitaplar telefonda açılmıyor. **Beta 0.2.1'i kur.**

**Önemli düzeltme**

- Beta 0.1'de ilerleme kaydedilmiyordu, uygulama her açıldığında sıfırdan başlıyordu. Düzeltildi, XP, öğrenilen kartlar, okuma konumu ve kitaplar artık korunuyor.

**Yeni: Okuma**

- Aozora Bunko'dan telifi dolmuş 5 hikâye, bölüm bölüm: 手袋を買いに, 蜘蛛の糸, 注文の多い料理店, 杜子春, 夢十夜.
- Kanjilerin üstünde okunuş: hepsi, yalnızca bilmediğin kanjiler ya da kapalı.
- Bir kelimeye dokununca okunuşu, sözlük biçimi, anlamı (Türkçe, yoksa İngilizce) ve kanjileri. Tek dokunuşla tekrar destesine ekleme.
- ▶ ile metni cümle cümle sesli dinleme, okunan paragraf vurgulanır.

**Yeni: Kendi metinlerin ve kitapların**

- İnternet romanlarından (ör. Narō'daki Re:Zero) bölüm yapıştırma.
- EPUB ve PDF kitap ekleme. Kitaplar uygulamanın kalıcı hafızasında saklanır, uzun kitaplar için bölüm seçici var.
- Metinler yalnızca telefonda işlenir, hiçbir yere gönderilmez.
- DRM korumalı kitaplar ve taranmış (resim) PDF'ler desteklenmez.

**Yeni: Sözlük**

- Japonca, romaji (ör. *neko*), İngilizce veya Türkçe arama.
- Sonuçlar: Megumi listesi (Türkçe), çevrimdışı JMdict sözlüğü (219 bin kelime) ve internet varsa Jisho.org.

**Yeni: Dinleme**

- Kelime dinleme, dikte, cümle dinleme ve "Ne duydun?" etkinlikleri, yavaş dinleme seçeneğiyle.

**Daha fazla içerik**

- Kanji 192'den 313'e çıktı (N5–N4 ve bazı N3).
- Kelime havuzu yaklaşık 260 kelimeye çıktı.
- Tüm okunuşlar ve örnek kelimeler KANJIDIC2 ve JMdict sözlükleriyle otomatik olarak doğrulandı.

**Diğer**

- Yeni sekme düzeni: Ana Sayfa · Dersler · Harfler (Kana / Kanji) · Oku (Okuma / Sözlük) · Pratik (Yazma / Dinleme) · Tekrar.
- Lisans eklendi: kod MIT, eğitim içeriği CC BY-SA 4.0, üçüncü taraf bildirimleri `THIRD_PARTY_NOTICES.md` dosyasında.

## Beta 0.1 (v0.1-beta) — 25 Ekim 2026

> ⚠️ Bu sürümde ilerleme kaydedilmiyor. **Beta 0.2.1'i kur.**

İlk deneme sürümü.

- **Kana:** Hiragana ve katakana tabloları, romaji, Türk alfabesiyle okunuş (shi → şi, chi → çi) ve telaffuz ipuçları.
- **Dersler:** 4 ünite, 21 ders. Gramer Türkçeyle karşılaştırılarak anlatılır (を ≈ -(y)ı, で ≈ -de, の ≈ -(n)ın, か ≈ mı).
- **Yazma alıştırmaları:** Parmakla yazma, çizgi sırası ve yön kontrolü, İzle / Takip et / Ezbere modları.
- **Günlük kanji:** 192 kanji, anlam, okunuşlar, örnekler, çizgi sırası ve yazma.
- **Kelime ezberi:** Her egzersizden sonra o harflerle yazılabilen kelimeler.
- **Kelime ve günlük cümle yazma.**
- **Aralıklı tekrar,** seri, XP, günlük hedef ve ilerleme yedeği.
- Türkçe ana dil, İngilizce yardımcı dil.
