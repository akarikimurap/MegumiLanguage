// Okuma kütüphanesi: Aozora Bunko'daki telifi dolmuş (public domain) hikâyeleri indirir, işaretlerden temizler,
// bölümlere ayırır, kuromoji ile kelimelere böler ve www/stories.js dosyasını üretir.
// Kullanım:  node tools/build-reader.mjs        (npm run reader)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const kuromoji = require('kuromoji');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dl = path.join(root, 'tools', '.cache', 'aozora');
fs.mkdirSync(dl, { recursive: true });

// Türkçe/İngilizce tanıtımlar bu projeye aittir; metinler Aozora Bunko'dan (public domain).
const WORKS = [
  { id: 'tebukuro', url: 'https://www.aozora.gr.jp/cards/000121/files/637_ruby_4095.zip', title: '手袋を買いに', titleR: 'てぶくろをかいに',
    author: '新美南吉', authorR: 'Niimi Nankichi (1913–1943)', level: 1, perChapter: 14,
    tr: ['Eldiven Almaya', 'Bir yavru tilki, annesinin avucuna koyduğu bozuk paralarla insanların kasabasına eldiven almaya gider. Japon çocuk edebiyatının en sevilen hikâyelerinden; dili sade ve sıcak.'],
    en: ['Buying Mittens', 'A fox cub goes to a human town to buy mittens with the coins his mother gave him.'] },
  { id: 'kumo', url: 'https://www.aozora.gr.jp/cards/000879/files/92_ruby_164.zip', title: '蜘蛛の糸', titleR: 'くものいと',
    author: '芥川竜之介', authorR: 'Akutagawa Ryūnosuke (1892–1927)', level: 2, perChapter: 0,
    tr: ['Örümcek İpi', 'Buda, cehennemdeki hırsız Kandata\'ya, hayatında bir kez bir örümceği ezmeden bıraktığı için cennetten bir örümcek ipi sarkıtır. Kısa ve unutulmaz bir ahlak hikâyesi.'],
    en: ['The Spider\'s Thread', 'The Buddha lowers a spider\'s thread to a robber in hell who once spared a spider.'] },
  { id: 'chumon', url: 'https://www.aozora.gr.jp/cards/000081/files/43754_ruby_17594.zip', title: '注文の多い料理店', titleR: 'ちゅうもんのおおいりょうりてん',
    author: '宮沢賢治', authorR: 'Miyazawa Kenji (1896–1933)', level: 2, perChapter: 18,
    tr: ['Siparişi Çok Restoran', 'Dağda avlanırken yolunu kaybeden iki şehirli beyefendi, ıssız bir yerde lüks bir restorana rastlar. Kapılardaki talimatlar giderek tuhaflaşır… Mizahi ve ürkütücü bir masal.'],
    en: ['The Restaurant of Many Orders', 'Two hunters lost in the mountains find a strange restaurant whose doors keep giving them orders.'] },
  { id: 'toshishun', url: 'https://www.aozora.gr.jp/cards/000879/files/43015_ruby_17393.zip', title: '杜子春', titleR: 'とししゅん',
    author: '芥川竜之介', authorR: 'Akutagawa Ryūnosuke (1892–1927)', level: 3, perChapter: 0,
    tr: ['Toshishun', 'Servetini harcayıp yoksul düşen genç Toshishun, gizemli bir ermişle tanışır. Zenginlik, insanlar ve gerçekten değerli olan şey üzerine bir Çin masalı uyarlaması.'],
    en: ['Tu Zichun', 'A young man who squandered his fortune meets a mysterious hermit and learns what truly matters.'] },
  { id: 'yume', url: 'https://www.aozora.gr.jp/cards/000148/files/799_ruby_6024.zip', title: '夢十夜', titleR: 'ゆめじゅうや',
    author: '夏目漱石', authorR: 'Natsume Sōseki (1867–1916)', level: 3, perChapter: 0,
    tr: ['On Gece Rüyası', 'Her biri "Şöyle bir rüya gördüm" diye başlayan on kısa, şiirsel ve gizemli rüya. Modern Japon edebiyatının ustasından.'],
    en: ['Ten Nights of Dreams', 'Ten short, poetic and mysterious dreams, each beginning "I had this dream".'] },
];

const POS = { 名詞: 'n', 動詞: 'v', 形容詞: 'a', 副詞: 'adv', 助詞: 'p', 助動詞: 'aux', 記号: 's', 接続詞: 'conj', 連体詞: 'adn', 感動詞: 'int', 接頭詞: 'pre', フィラー: 'f' };
const kataToHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const hasKanji = s => /[一-龯々〆ヶ]/.test(s);

function fetchText(w) {
  const zip = path.join(dl, path.basename(w.url));
  if (!fs.existsSync(zip)) execFileSync('curl', ['-sL', '-o', zip, w.url]);
  const out = path.join(dl, w.id);
  fs.mkdirSync(out, { recursive: true });
  execFileSync('unzip', ['-o', '-q', zip, '-d', out]);
  const txt = fs.readdirSync(out).find(f => f.endsWith('.txt'));
  return new TextDecoder('shift_jis').decode(fs.readFileSync(path.join(out, txt)));
}

// Aozora biçimi: başlık, "-----" açıklama bloğu, gövde, "底本：" ile başlayan künye
function parse(raw, w) {
  const lines = raw.replace(/\r/g, '').split('\n');
  const dash = lines.reduce((a, l, i) => (/^-{10,}/.test(l) ? [...a, i] : a), []);
  let body = lines.slice(dash.length >= 2 ? dash[1] + 1 : 2);
  const end = body.findIndex(l => l.startsWith('底本：'));
  if (end >= 0) body = body.slice(0, end);
  const ruby = new Map();
  const chapters = [];
  let cur = null;
  for (let line of body) {
    line = line.replace(/※［＃[^］]*］/g, '').replace(/^\s+|\s+$/g, '');
    const heading = /［＃[^］]*見出し］/.test(line);
    // ルビ: ｜漢字《よみ》 veya 漢字《よみ》 — okunuşları toplayıp metinden çıkar
    line = line.replace(/｜([^《]+)《([^》]+)》/g, (_, b, r) => (ruby.set(b, r), b))
      .replace(/([一-龯々〆ヶ]+)《([^》]+)》/g, (_, b, r) => (ruby.set(b, r), b))
      .replace(/《[^》]*》/g, '').replace(/［＃[^］]*］/g, '').replace(/^[　\s]+/, '');
    if (!line) continue;
    if (heading) { cur = { title: line, paras: [] }; chapters.push(cur); continue; }
    if (!cur) { cur = { title: '', paras: [] }; chapters.push(cur); }
    cur.paras.push(line);
  }
  // Başlıksız hikâyeleri yaklaşık eşit paragraflık bölümlere ayır
  let out = chapters.filter(c => c.paras.length);
  if (w.perChapter && out.length === 1) {
    const ps = out[0].paras, n = Math.ceil(ps.length / w.perChapter), size = Math.ceil(ps.length / n);
    out = Array.from({ length: n }, (_, i) => ({ title: `${i + 1}`, paras: ps.slice(i * size, (i + 1) * size) }));
  }
  return { chapters: out, ruby };
}

const tokenizer = await new Promise((res, rej) => kuromoji.builder({ dicPath: path.join(root, 'node_modules', 'kuromoji', 'dict') }).build((e, t) => e ? rej(e) : res(t)));

// Özel okunuşlu (jukujikun) kelimeler: kuromoji bunları parçalara bölebilir
const SPECIAL = { 二人: 'ふたり', 一人: 'ひとり', 今日: 'きょう', 明日: 'あした', 昨日: 'きのう', 大人: 'おとな', 今朝: 'けさ', 今年: 'ことし', 一日: 'ついたち', 上手: 'じょうず', 下手: 'へた', 眼鏡: 'めがね' };

// Belirteç: [yüzey, okunuş (hiragana; yalnızca kanjili ise) | 0, sözlük biçimi (farklıysa) | 0, tür]
function tokenize(para, ruby) {
  const toks = tokenizer.tokenize(para).map(t => {
    const s = t.surface_form;
    let r = 0;
    if (hasKanji(s)) r = ruby.get(s) || SPECIAL[s] || (t.reading && t.reading !== '*' ? kataToHira(t.reading) : 0);
    const base = t.basic_form && t.basic_form !== '*' && t.basic_form !== s ? t.basic_form : 0;
    return [s, r, base, POS[t.pos] || 'x'];
  });
  // Metnin ruby işaretleri veya özel okunuşlar birden fazla belirtece yayılıyorsa birleştir (二+人 → 二人 ふたり)
  const out = [];
  for (let i = 0; i < toks.length; i++) {
    let merged = false;
    for (let j = Math.min(toks.length, i + 4); j > i + 1; j--) {
      const s = toks.slice(i, j).map(t => t[0]).join('');
      const r = ruby.get(s) || SPECIAL[s];
      if (r && hasKanji(s)) { out.push([s, r, 0, 'n']); i = j - 1; merged = true; break; }
    }
    if (!merged) out.push(toks[i]);
  }
  return out;
}

const stories = [];
for (const w of WORKS) {
  const { chapters, ruby } = parse(fetchText(w), w);
  const chs = chapters.map(c => ({ title: c.title, paras: c.paras.map(p => tokenize(p, ruby)) }));
  const chars = chapters.reduce((n, c) => n + c.paras.join('').length, 0);
  stories.push({ id: w.id, title: w.title, titleR: w.titleR, author: w.author, authorR: w.authorR, level: w.level, tr: w.tr, en: w.en, source: w.url, chars, chapters: chs });
  console.log(`${w.title}: ${chs.length} bölüm, ${chars} karakter`);
}
const header = '// Okuma kütüphanesi — metinler Aozora Bunko (青空文庫, https://www.aozora.gr.jp) kaynaklı, telifi dolmuş (public domain) eserlerdir.\n// tools/build-reader.mjs ile üretildi; elle düzenleme. Belirteç: [yüzey, okunuş|0, sözlük biçimi|0, tür]\n';
fs.writeFileSync(path.join(root, 'www', 'stories.js'), header + 'const STORIES = ' + JSON.stringify(stories) + ';\n');
console.log('www/stories.js:', (fs.statSync(path.join(root, 'www', 'stories.js')).size / 1024).toFixed(0), 'KB');
