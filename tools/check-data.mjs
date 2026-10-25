// İçerik doğrulama: kanji okunuşlarını KANJIDIC2'ye, örnek kelimeleri ve kelime havuzunu JMdict'e karşı kontrol eder.
// Kullanım:  node tools/check-data.mjs        (npm run check)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadSimplified } from './build-dict.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(['data.js', 'kanji.js', 'words.js', 'sentences.js'].map(f => fs.readFileSync(path.join(root, 'www', f), 'utf8')).join('\n')
  + ';this.D={KANJI,KANA_WORDS,SENTENCES,VOCAB};', ctx);
const { KANJI, KANA_WORDS, SENTENCES, VOCAB } = ctx.D;

const kd = await loadSimplified('kanjidic2-en');
const jm = await loadSimplified('jmdict-eng');
const kanjiInfo = new Map(kd.characters.map(c => [c.literal, c]));
// yazılış → okunuşlar (JMdict)
const readings = new Map();
for (const w of jm.words) {
  const kana = w.kana.map(k => k.text);
  for (const f of [...w.kanji.map(k => k.text), ...kana]) {
    if (!readings.has(f)) readings.set(f, new Set());
    kana.forEach(r => readings.get(f).add(r));
  }
}
const kataToHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const problems = [];
const dup = KANJI.map(k => k.c).filter((c, i, a) => a.indexOf(c) !== i);
if (dup.length) problems.push('Tekrarlanan kanji: ' + dup.join(''));

for (const k of KANJI) {
  const info = kanjiInfo.get(k.c);
  if (!info) { problems.push(`${k.c}: KANJIDIC2'de yok`); continue; }
  const rd = info.readingMeaning?.groups.flatMap(g => g.readings) ?? [];
  const on = new Set(rd.filter(r => r.type === 'ja_on').map(r => r.value));
  const kun = new Set(rd.filter(r => r.type === 'ja_kun').map(r => r.value.replace(/^-|-$/g, '')));
  for (const r of k.on) if (!on.has(r)) problems.push(`${k.c}: on okunuşu ${r} KANJIDIC2'de yok (${[...on].join('、')})`);
  for (const r of k.kun) {
    const want = r.replace('(', '.').replace(')', '');
    if (![...kun].some(x => x === want || x.split('.')[0] === want.split('.')[0] && x.replace('.', '') === want.replace('.', ''))) {
      problems.push(`${k.c}: kun okunuşu ${r} KANJIDIC2'de yok (${[...kun].join('、')})`);
    }
  }
  for (const [w, r] of k.ex) {
    const set = readings.get(w);
    if (!set) problems.push(`${k.c}: örnek ${w} JMdict'te yok`);
    else if (!set.has(r) && !set.has(kataToHira(r))) problems.push(`${k.c}: ${w} okunuşu ${r} değil (${[...set].join('、')})`);
  }
}
for (const [jp, , , k] of KANA_WORDS) {
  const form = k || jp;
  const set = readings.get(form) || readings.get(jp);
  if (!set) problems.push(`kelime ${form} JMdict'te yok`);
  else if (!set.has(jp)) problems.push(`kelime ${form}: okunuş ${jp} değil (${[...set].join('、')})`);
}
console.log(`${KANJI.length} kanji, ${KANA_WORDS.length} kelime, ${SENTENCES.length} cümle kontrol edildi.`);
console.log(problems.length ? problems.join('\n') : 'Sorun bulunmadı.');
process.exit(problems.length ? 1 : 0);
