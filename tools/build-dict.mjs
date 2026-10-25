// JMdict (EDRDG, CC BY-SA 4.0) sözlüğünü okuyucu için sıkıştırılmış biçimde www/vendor/jmdict.js olarak üretir.
// Kullanım:  node tools/build-dict.mjs        (npm run dict)
// Kaynak: https://github.com/scriptin/jmdict-simplified — indirilen dosya tools/.cache/dl içinde saklanır.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const JMDICT_VERSION = '3.6.2+20261019180022';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dl = path.join(root, 'tools', '.cache', 'dl');

// İndir ve aç (önbellekte varsa atla). name: 'jmdict-eng' | 'kanjidic2-en'
export async function loadSimplified(name) {
  fs.mkdirSync(dl, { recursive: true });
  const short = path.join(dl, `${name}-${JMDICT_VERSION.split('+')[0]}.json`);
  if (!fs.existsSync(short)) {
    const tgz = `${name}-${JMDICT_VERSION}.json.tgz`;
    const url = `https://github.com/scriptin/jmdict-simplified/releases/download/${encodeURIComponent(JMDICT_VERSION)}/${encodeURIComponent(tgz)}`;
    console.log('indiriliyor:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    fs.writeFileSync(path.join(dl, tgz), Buffer.from(await res.arrayBuffer()));
    execFileSync('tar', ['-xzf', tgz], { cwd: dl });
  }
  return JSON.parse(fs.readFileSync(short, 'utf8'));
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('build-dict.mjs')) {
  const j = await loadSimplified('jmdict-eng');
  // Satır: [kanji yazılışları "|", kana okunuşları "|", ilk 2 anlam (her biri en fazla 2 karşılık), yaygın mı (1/0)]
  const rows = j.words.map(w => {
    const common = w.kanji.some(k => k.common) || w.kana.some(k => k.common);
    const gloss = w.sense.slice(0, 2).map(s => s.gloss.slice(0, 2).map(g => g.text).join(', ')).join('; ');
    return [w.kanji.map(k => k.text).join('|'), w.kana.map(k => k.text).join('|'), gloss, common ? 1 : 0];
  });
  rows.sort((a, b) => b[3] - a[3]); // yaygın kelimeler önce
  const out = path.join(root, 'www', 'vendor');
  fs.mkdirSync(out, { recursive: true });
  const header = `// JMdict — © Electronic Dictionary Research and Development Group (EDRDG), CC BY-SA 4.0\n// https://www.edrdg.org/edrdg/licence.html — jmdict-simplified ${JMDICT_VERSION} üzerinden, tools/build-dict.mjs ile üretildi.\n`;
  fs.writeFileSync(path.join(out, 'jmdict.js'), header + 'window.JMDICT=' + JSON.stringify(rows) + ';\n');
  console.log('www/vendor/jmdict.js:', rows.length, 'kelime,', (fs.statSync(path.join(out, 'jmdict.js')).size / 1048576).toFixed(1), 'MB');
}
