# Lisanslar ve üçüncü taraf bildirimleri / Licenses and third-party notices

Megumi Language, Megumi Projesi'nin bir parçasıdır.

## Megumi Language'in kendisi

| Ne | Lisans |
|---|---|
| Kaynak kod (`www/app.js`, `www/styles.css`, `www/index.html`, `tools/`, `.github/`) | [MIT](LICENSE) |
| Projeye özgü eğitim içeriği: ders metinleri, Türkçe/İngilizce anlamlar, akılda tutma ipuçları, örnek cümleler ve hikâye tanıtımları (`www/data.js`, `www/kanji.js`, `www/words.js`, `www/sentences.js`) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

## Üçüncü taraf veriler ve yazılımlar

| Bileşen | Nerede | Telif / Lisans |
|---|---|---|
| **KanjiVG** — çizgi sırası verisi | `www/strokes.js`, uygulama simgesi (`assets/`) | © Ulrich Apel ve katkıda bulunanlar — [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) — https://kanjivg.tagaini.net |
| **JMdict** — Japonca-İngilizce sözlük | `www/vendor/jmdict.js` (derlemede üretilir) | © Electronic Dictionary Research and Development Group — [CC BY-SA 4.0](https://www.edrdg.org/edrdg/licence.html) — jmdict-simplified (MIT) üzerinden |
| **KANJIDIC2** — kanji okunuşlarının doğrulanması | yalnızca `tools/check-data.mjs` (uygulamaya girmez) | © EDRDG — [CC BY-SA 4.0](https://www.edrdg.org/edrdg/licence.html) |
| **Aozora Bunko (青空文庫)** — okuma kütüphanesindeki hikâyeler | `www/stories.js` | Telifi dolmuş (kamu malı) eserler: 新美南吉「手袋を買いに」, 芥川竜之介「蜘蛛の糸」「杜子春」, 宮沢賢治「注文の多い料理店」, 夏目漱石「夢十夜」 — https://www.aozora.gr.jp |
| **kuromoji.js** — metin işleme | `www/vendor/kuromoji/` (kurulumda kopyalanır) | © Takuya Asano ve katkıda bulunanlar — [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) |
| **mecab-ipadic** — kuromoji sözlüğü | `www/vendor/kuromoji/dict/` | © Nara Institute of Science and Technology (NAIST) — aşağıdaki bildirime bakın |
| **pdf.js** (pdfjs-dist) — PDF'lerden metin çıkarma, Japonca CMap tabloları | `www/vendor/pdfjs/` (kurulumda kopyalanır) | © Mozilla Foundation — [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) |
| **fflate** — EPUB (ZIP) açma | `www/vendor/fflate.js` (kurulumda kopyalanır) | © Arjun Barrett — MIT |
| **Jisho.org** — çevrimiçi sözlük araması | uygulamaya veri dahil edilmez; arama anında jisho.org'a istek gönderilir | Jisho.org hizmeti (verileri JMdict, KANJIDIC2 vb. kaynaklardan) — https://jisho.org/about |
| **Capacitor**, **@capacitor/app** | `www/capacitor.js`, Android uygulaması | © Ionic — MIT |
| **@capacitor-community/text-to-speech** | Android uygulaması | © Capacitor Community — MIT |
| **Noto Sans JP** (internet varsa Google Fonts'tan) | yazı tipi | © Google — SIL Open Font License 1.1 |

"Kendi metinlerin" bölümüne yapıştırılan metinler ve eklenen EPUB/PDF kitaplar yalnızca kullanıcının cihazında işlenir ve saklanır, bu depoya veya uygulamaya dahil değildir.

---

Aşağıdaki bildirim kuromoji paketinin `NOTICE.md` dosyasından olduğu gibi aktarılmıştır (mecab-ipadic lisansının gerektirdiği şekilde):

Library dependencies
====================

This software includes a binary and/or source version of data from

* mecab-ipadic-2.7.0-20070801

which can be obtained from

http://atilika.com/releases/mecab-ipadic/mecab-ipadic-2.7.0-20070801.tar.gz

or

http://jaist.dl.sourceforge.net/project/mecab/mecab-ipadic/2.7.0-20070801/mecab-ipadic-2.7.0-20070801.tar.gz



Copyright and license
=====================


mecab-ipadic-2.7.0-20070801
---------------------------

Copyright 2000, 2001, 2002, 2003 Nara Institute of Science
and Technology.  All Rights Reserved.

Use, reproduction, and distribution of this software is permitted.
Any copy of this software, whether in its original form or modified,
must include both the above copyright notice and the following
paragraphs.

Nara Institute of Science and Technology (NAIST),
the copyright holders, disclaims all warranties with regard to this
software, including all implied warranties of merchantability and
fitness, in no event shall NAIST be liable for
any special, indirect or consequential damages or any damages
whatsoever resulting from loss of use, data or profits, whether in an
action of contract, negligence or other tortuous action, arising out
of or in connection with the use or performance of this software.

A large portion of the dictionary entries
originate from ICOT Free Software.  The following conditions for ICOT
Free Software applies to the current dictionary as well.

Each User may also freely distribute the Program, whether in its
original form or modified, to any third party or parties, PROVIDED
that the provisions of Section 3 ("NO WARRANTY") will ALWAYS appear
on, or be attached to, the Program, which is distributed substantially
in the same form as set out herein and that such intended
distribution, if actually made, will neither violate or otherwise
contravene any of the laws and regulations of the countries having
jurisdiction over the User or the intended distribution itself.

NO WARRANTY

The program was produced on an experimental basis in the course of the
research and development conducted during the project and is provided
to users as so produced on an experimental basis.  Accordingly, the
program is provided without any warranty whatsoever, whether express,
implied, statutory or otherwise.  The term "warranty" used herein
includes, but is not limited to, any warranty of the quality,
performance, merchantability and fitness for a particular purpose of
the program and the nonexistence of any infringement or violation of
any right of any third party.

Each user of the program will agree and understand, and be deemed to
have agreed and understood, that there is no warranty whatsoever for
the program and, accordingly, the entire risk arising from or
otherwise connected with the program is assumed by the user.

Therefore, neither ICOT, the copyright holder, or any other
organization that participated in or was otherwise related to the
development of the program and their respective officials, directors,
officers and other employees shall be held liable for any and all
damages, including, without limitation, general, special, incidental
and consequential damages, arising out of or otherwise in connection
with the use or inability to use the program or any product, material
or result produced or otherwise obtained by using the program,
regardless of whether they have been advised of, or otherwise had
knowledge of, the possibility of such damages at any time during the
project or thereafter.  Each user will be deemed to have agreed to the
foregoing by his or her commencement of use of the program.  The term
"use" as used herein includes, but is not limited to, the use,
modification, copying and distribution of the program and the
production of secondary products from the program.

In the case where the program, whether in its original form or
modified, was distributed or delivered to or received by a user from
any person, organization or entity other than ICOT, unless it makes or
grants independently of ICOT any specific warranty to the user in
writing, such person, organization or entity, will also be exempted
from and not be held liable to the user for any such damages as noted
above as far as the program is concerned.

