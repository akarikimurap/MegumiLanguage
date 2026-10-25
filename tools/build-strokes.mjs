// KanjiVG'den Megumi'nin kullandığı tüm kana/kanjilerin çizgi verisini indirir ve www/strokes.js dosyasını üretir.
// Kullanım:  node tools/build-strokes.mjs
// kanji.js'e yeni kanji ekledikten sonra çalıştır. İndirilen SVG'ler tools/.kvg-cache içinde saklanır.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wwwDir = path.join(root, 'www');
const cacheDir = path.join(root, 'tools', '.kvg-cache');
const TAG = 'r20260714';
fs.mkdirSync(cacheDir, { recursive: true });

const ctx = {};
vm.createContext(ctx);
const src = ['data.js', 'kanji.js'].map(f => fs.readFileSync(path.join(wwwDir, f), 'utf8')).join('\n');
vm.runInContext(src + '\nthis.__chars = [...KANA_ROWS.flatMap(r => [...r[1], ...r[2]]), ..."っゃゅょッャュョー", ...KANJI.map(k => k.c)];', ctx);
const chars = [...new Set(ctx.__chars)].filter(c => c !== '・');
console.log('karakter:', chars.length);

const hex = c => c.codePointAt(0).toString(16).padStart(5, '0');
const sources = h => [
  `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@${TAG}/kanji/${h}.svg`,
  `https://raw.githubusercontent.com/KanjiVG/kanjivg/${TAG}/kanji/${h}.svg`,
];
async function get(c) {
  const file = path.join(cacheDir, hex(c) + '.svg');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  for (const url of sources(hex(c))) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const text = await res.text();
    fs.writeFileSync(file, text);
    return text;
  }
  throw new Error(`${c} (${hex(c)}) indirilemedi`);
}

const out = {};
const missing = [];
const queue = chars.slice();
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const c = queue.shift();
    try {
      const svg = await get(c);
      const strokes = [];
      for (const m of svg.matchAll(/<path\b([^>]*)\/?>/g)) {
        const id = /id="kvg:[0-9a-f]+-s(\d+)"/.exec(m[1]);
        const d = /\sd="([^"]+)"/.exec(m[1]);
        if (id && d) strokes[+id[1] - 1] = d[1].replace(/\s+/g, ' ').trim();
      }
      const nums = [...svg.matchAll(/<text transform="matrix\(1 0 0 1 ([\d.-]+) ([\d.-]+)\)">(\d+)<\/text>/g)]
        .sort((a, b) => a[3] - b[3]).map(m => [+(+m[1]).toFixed(1), +(+m[2]).toFixed(1)]);
      if (!strokes.length || strokes.some(s => !s)) throw new Error(`${c}: çizgi verisi bozuk`);
      out[c] = { s: strokes, n: nums };
    } catch (e) { missing.push(String(e.message)); }
  }
}));

const ordered = Object.fromEntries(chars.filter(c => out[c]).map(c => [c, out[c]]));
const header = `// Çizgi sırası verisi: KanjiVG (${TAG}) — © Ulrich Apel ve katkıda bulunanlar, CC BY-SA 3.0\n// https://kanjivg.tagaini.net — 109×109 koordinat sistemi. tools/build-strokes.mjs ile üretildi; elle düzenleme.\n`;
fs.writeFileSync(path.join(wwwDir, 'strokes.js'), header + 'const STROKES = ' + JSON.stringify(ordered) + ';\n');
console.log('yazıldı:', Object.keys(ordered).length, 'eksik:', missing);
if (missing.length) process.exit(1);
