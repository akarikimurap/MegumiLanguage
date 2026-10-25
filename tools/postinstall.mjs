// npm install sonrasında çalışır: tarayıcıda/uygulamada gereken kütüphaneleri www/ altına kopyalar.
//  - Capacitor çekirdeği → www/capacitor.js (depoda da var)
//  - kuromoji + IPADIC sözlükleri → www/vendor/kuromoji/ ("Kendi metnin" okuyucusu için; depoya girmez)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nm = path.join(root, 'node_modules');
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };

copy(path.join(nm, '@capacitor/core/dist/capacitor.js'), path.join(root, 'www/capacitor.js'));

const kdir = path.join(root, 'www/vendor/kuromoji');
copy(path.join(nm, 'kuromoji/build/kuromoji.js'), path.join(kdir, 'kuromoji.js'));
// Android derleyicisi (aapt) ".gz" uzantılı dosyaları APK'ya açarak ve uzantısız koyar; bu yüzden ".bin" ekliyoruz.
// Uygulama, kuromoji'nin istediği "*.dat.gz" adreslerini "*.dat.gz.bin"e yönlendirir (www/app.js → loadTokenizer).
fs.rmSync(path.join(kdir, 'dict'), { recursive: true, force: true });
for (const f of fs.readdirSync(path.join(nm, 'kuromoji/dict'))) copy(path.join(nm, 'kuromoji/dict', f), path.join(kdir, 'dict', f + '.bin'));
// Lisans ve mecab-ipadic bildirimi uygulamayla birlikte dağıtılmalı
copy(path.join(nm, 'kuromoji/NOTICE.md'), path.join(kdir, 'NOTICE.md'));
copy(path.join(nm, 'kuromoji/LICENSE-2.0.txt'), path.join(kdir, 'LICENSE-2.0.txt'));
// EPUB okuma (fflate) ve PDF okuma (pdf.js + Japonca için CMap tabloları)
copy(path.join(nm, 'fflate/umd/index.js'), path.join(root, 'www/vendor/fflate.js'));
const pdir = path.join(root, 'www/vendor/pdfjs');
for (const f of ['pdf.min.mjs', 'pdf.worker.min.mjs']) copy(path.join(nm, 'pdfjs-dist/build', f), path.join(pdir, f));
for (const f of fs.readdirSync(path.join(nm, 'pdfjs-dist/cmaps'))) copy(path.join(nm, 'pdfjs-dist/cmaps', f), path.join(pdir, 'cmaps', f));
copy(path.join(nm, 'pdfjs-dist/LICENSE'), path.join(pdir, 'LICENSE'));
// Lisans dosyaları uygulamanın içinde de bulunsun
copy(path.join(root, 'LICENSE'), path.join(root, 'www/LICENSE.txt'));
copy(path.join(root, 'THIRD_PARTY_NOTICES.md'), path.join(root, 'www/THIRD_PARTY_NOTICES.md'));
console.log('postinstall: capacitor.js, kuromoji, fflate ve pdf.js www/ altına kopyalandı');
