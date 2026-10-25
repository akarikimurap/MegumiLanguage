(() => {
'use strict';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const APP_VERSION = 'Beta 0.2.1';
const STORE = 'megumi.v1';
const DAY = 864e5;
const INTERVALS = [0, 1, 2, 4, 8, 16, 32]; // gün; kutu numarasına göre
const DEFAULTS = {
  settings: { en: true, romaji: true, trt: true, rate: 0.85, goal: 30, kanjiPerDay: 2, lessonWrite: true, afterWords: true, sentencesPerDay: 2, furi: 'unknown', readSize: 2 },
  srs: {}, xp: 0, daily: { date: '', xp: 0 }, streak: { count: 0, last: '' }, done: {}, kd: null, ds: null, sp: {},
  texts: [], readPos: {}, readDone: {}, custom: {}, lastRead: null,
};

let S = load();
const ui = { tab: 'home', kanaScript: 'h', sheet: null, flow: null, write: null, writeMode: 'trace' };

// ---------- Kayıt ----------
// Not: load() dosyanın başında çağrılır; buradaki yardımcılar "function" olarak tanımlanmalı (hoisting),
// "const" olursa ilk çağrıda erişilemez ve her açılışta ilerleme sıfırlanır.
function withDefaults(s) {
  return { ...JSON.parse(JSON.stringify(DEFAULTS)), ...s, settings: { ...DEFAULTS.settings, ...s.settings } };
}
function load() {
  let raw = null;
  try { raw = localStorage.getItem(STORE); } catch {}
  if (raw) {
    try { return withDefaults(JSON.parse(raw)); }
    catch (e) { console.error('Kayıt okunamadı', e); }
  }
  return JSON.parse(JSON.stringify(DEFAULTS));
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(S)); }
  catch { toast(bi('Depolama alanı doldu; bazı uzun metinleri silmen gerekebilir.', 'Storage is full; try deleting some long texts.')); }
}

// ---------- Yardımcılar ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bi = (tr, en) => `${tr}<span class="en">${en}</span>`;        // TR ana satır, EN altında
const biI = (tr, en) => `${tr}<span class="en-i"><span class="sep"> · </span>${en}</span>`;  // tek satırlık sürüm
const dateStr = d => d.toLocaleDateString('sv');
const today = () => dateStr(new Date());
const yesterday = () => dateStr(new Date(Date.now() - DAY));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const uniqBy = (a, f) => { const seen = new Set(); return a.filter(x => { const k = f(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
const top = () => window.scrollTo(0, 0);

// Romajiyi Türk alfabesiyle yaz: shi → şi, chi → çi, ji → ci, ō → oo
function trRead(r) {
  if (r === 'wo') return 'o';
  return r.replace(/sh/g, 'ş').replace(/ch/g, 'ç').replace(/j/g, 'c')
    .replace(/ā/g, 'aa').replace(/ī/g, 'ii').replace(/ū/g, 'uu').replace(/ē/g, 'ee').replace(/ō/g, 'oo');
}

const IC = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  kana: '<span class="kana-ic">あ</span>',
  kanji: '<span class="kana-ic">漢</span>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 19.5V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/></svg>',
  review: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  speaker: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg>',
  pen: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
  read: '<svg viewBox="0 0 24 24"><path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z"/></svg>',
};
const speakBtn = t => `<button class="icon-btn speak" data-a="speak" data-t="${esc(t)}" aria-label="Dinle / Listen">${IC.speaker}</button>`;

// ---------- Öğeler (kartlar) ----------
const ITEMS = {};
const KANA = { h: [], k: [] };
for (const [row, hira, kata, rom] of KANA_ROWS) {
  const roms = rom.split(' ');
  for (const [script, chars, other] of [['h', hira, kata], ['k', kata, hira]]) {
    const cells = [...chars].map((ch, i) => {
      if (ch === '・') return null;
      const it = { id: 'k:' + ch, kind: 'kana', script, row, jp: ch, r: roms[i], pair: [...other][i] };
      return (ITEMS[it.id] = it);
    });
    KANA[script].push({ row, cells });
  }
}
for (const set in VOCAB) for (const w of VOCAB[set]) ITEMS['w:' + w.jp] = { id: 'w:' + w.jp, kind: 'word', ...w };
for (const g in GRAMMAR) for (const ex of GRAMMAR[g].examples) ITEMS['s:' + ex.jp] = { id: 's:' + ex.jp, kind: 'sentence', ...ex };
const KJ = {};
for (const k of KANJI) { KJ[k.c] = k; ITEMS['j:' + k.c] = { id: 'j:' + k.c, kind: 'kanji', jp: k.c, tr: k.tr, en: k.en, say: k.ex[0][1], k }; }

// Kana → romaji (okunuşlar için): きゅう → kyuu, がっこう → gakkou
const KR = {};
for (const id in ITEMS) if (ITEMS[id].kind === 'kana') KR[ITEMS[id].jp] = ITEMS[id].r;
KR['を'] = KR['ヲ'] = 'o';
const SMALL_Y = { 'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo' };
function kanaToRomaji(s) {
  const ch = [...s];
  let out = '';
  ch.forEach((c, i) => {
    if (c === 'っ' || c === 'ッ') { const nx = KR[ch[i + 1]]; if (nx) out += nx.startsWith('ch') ? 't' : nx[0]; }
    else if (SMALL_Y[c]) out = /(sh|ch|j)i$/.test(out) ? out.slice(0, -1) + SMALL_Y[c].slice(1) : out.slice(0, -1) + SMALL_Y[c];
    else if (c === 'ー') out += out.slice(-1);
    else out += KR[c] ?? c;
  });
  return out;
}

// Kelime havuzu: kana kelimeleri ve kanji örnek kelimeleri (VOCAB'daki kayıtlar önceliklidir)
// Aynı okunuşlu farklı kelimeler (箸/橋 はし) ayrı kimlik alır: w:はし ve w:はし|橋
function addWord(jp, tr, en, k) {
  if (k === jp) k = undefined;
  const base = ITEMS['w:' + jp];
  if (base && (base.k === k || base.tr === tr)) return;
  const id = base ? 'w:' + jp + '|' + (k || tr) : 'w:' + jp;
  ITEMS[id] ??= { id, kind: 'word', jp, r: kanaToRomaji(jp), tr, en, ...(k ? { k } : {}) };
}
for (const [jp, tr, en, k] of KANA_WORDS) addWord(jp, tr, en, k);
for (const kj of KANJI) for (const [w, r, tr, en] of kj.ex) addWord(r, tr, en, w);

// Cümle havuzu: "私[わたし] {は} 学生[がくせい] です。" → bölümler (kanji+okunuş, kana, ek, noktalama)
const PUNCT = /[。、？！?!]/;
const SENT = SENTENCES.map(([src, tr, en]) => {
  const segs = [], roma = [];
  for (const word of src.trim().split(/\s+/)) {
    let wr = '';
    for (const m of word.matchAll(/([一-龯々]+)\[([^\]]+)\]|\{(.)\}|(.)/gu)) {
      if (m[1]) { segs.push({ k: m[1], r: m[2] }); wr += kanaToRomaji(m[2]); }
      else if (m[3]) { segs.push({ t: m[3] }); wr += m[3] === 'は' ? 'wa' : m[3] === 'へ' ? 'e' : kanaToRomaji(m[3]); }
      else { segs.push({ t: m[4] }); wr += m[4] === '。' ? '.' : m[4] === '、' ? ',' : kanaToRomaji(m[4]); }
    }
    roma.push(wr);
  }
  const jp = segs.map(s => s.k ?? s.t).join('');
  const kana = segs.map(s => s.r ?? s.t).join('');
  return { id: 'n:' + jp, segs, jp, kana, r: roma.join(' ').replace(/ ([.,?])/g, '$1'), tr, en };
});
// Cümleler dinleme ve anlam sorularında da kullanılır
for (const s of SENT) ITEMS[s.id] = { id: s.id, kind: 'sentence', jp: s.jp, kana: s.kana, r: s.r, tr: s.tr, en: s.en };

// Okurken desteye eklenen kelimeler (JMdict'ten; anlamı İngilizce)
function registerCustom(id) {
  const c = S.custom[id];
  ITEMS[id] = { id, kind: 'word', jp: c.jp, r: kanaToRomaji(c.jp), tr: c.tr, en: c.en || '', ...(c.k ? { k: c.k } : {}) };
  ownIndex = null;
}
let ownIndex = null;
for (const id in S.custom) registerCustom(id);

// Kanji örnek kelimesinin kimliği (aynı okunuşlu kelimeler ayrı kimlik alabilir)
const exWordId = ([w, r]) => ITEMS['w:' + r + '|' + w] ? 'w:' + r + '|' + w : 'w:' + r;

function lessonItems(l) {
  if (l.type === 'kana') return l.rows.flatMap(row => KANA[l.script].find(x => x.row === row).cells.filter(Boolean).map(c => c.id));
  if (l.type === 'vocab') return VOCAB[l.set].map(w => 'w:' + w.jp);
  return GRAMMAR[l.id].examples.map(ex => 's:' + ex.jp);
}
const tipFor = it => it.kind === 'kana' ? (KANA_TIPS[it.jp] || KANA_TIPS[it.r]) : it.kind === 'kanji' ? it.k.m : it.note;

// ---------- Ses ----------
// Android uygulamasında (Capacitor) telefonun kendi ses motoru, tarayıcıda Web Speech API kullanılır.
const isNative = !!window.Capacitor?.isNativePlatform?.();
const registerPlugin = window.capacitorExports?.registerPlugin || window.Capacitor?.registerPlugin;
const nativeTTS = isNative ? registerPlugin('TextToSpeech') : null;
let jaVoice = null, voiceWarned = false;
const hasSpeech = 'speechSynthesis' in window;
function pickVoice() { jaVoice = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang)) || null; }
if (hasSpeech && !isNative) { pickVoice(); speechSynthesis.addEventListener('voiceschanged', pickVoice); }
const noVoiceMsg = () => bi('Japonca ses bulunamadı. Telefon ayarlarından (Metin okuma / Google konuşma hizmetleri) Japonca ses paketini indirebilirsin.', 'No Japanese voice found — install Japanese in your device\'s text-to-speech settings.');
// Okuma bittiğinde çözülen bir Promise döner (sesli okuma sırayla cümle cümle ilerleyebilsin diye)
function speakAsync(text, rateMul = 1) {
  const clean = text.replace(/[＿・()]/g, '');
  const rate = S.settings.rate * rateMul;
  if (nativeTTS) {
    return nativeTTS.speak({ text: clean, lang: 'ja-JP', rate, pitch: 1, volume: 1, category: 'ambient' })
      .catch(() => { if (!voiceWarned) { voiceWarned = true; toast(noVoiceMsg()); } });
  }
  if (!hasSpeech) { toast(bi('Bu cihaz sesli okumayı desteklemiyor.', 'Speech is not supported on this device.')); return Promise.resolve(); }
  if (!jaVoice && !voiceWarned) { voiceWarned = true; toast(noVoiceMsg()); }
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'ja-JP';
    if (jaVoice) u.voice = jaVoice;
    u.rate = rate;
    u.onend = u.onerror = () => res();
    speechSynthesis.speak(u);
  });
}
function stopSpeech() {
  if (nativeTTS) return nativeTTS.stop().catch(() => {});
  if (hasSpeech) speechSynthesis.cancel();
  return Promise.resolve();
}
function speak(text, rateMul = 1) {
  stopReading();
  stopSpeech().then(() => speakAsync(text, rateMul));
}
let toastTimer;
function toast(html) {
  toastEl.innerHTML = html;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

// ---------- İlerleme ----------
function addXP(n) {
  if (n <= 0) return;
  const t = today();
  if (S.daily.date !== t) S.daily = { date: t, xp: 0 };
  S.daily.xp += n;
  S.xp += n;
  if (S.streak.last !== t) {
    S.streak.count = S.streak.last === yesterday() ? S.streak.count + 1 : 1;
    S.streak.last = t;
  }
  save();
}
const streakNow = () => [today(), yesterday()].includes(S.streak.last) ? S.streak.count : 0;
const dailyXP = () => S.daily.date === today() ? S.daily.xp : 0;
const learnedIds = () => Object.keys(S.srs).filter(id => ITEMS[id]);
const dueIds = () => { const now = Date.now(); return learnedIds().filter(id => S.srs[id].due <= now).sort((a, b) => S.srs[a].due - S.srs[b].due); };
const nextLesson = () => LESSONS.find(l => !S.done[l.id]);
const writable = id => id[0] === 'k' || id[0] === 'j';  // kana ve kanji yazılabilir
const unlearnedKanji = () => KANJI.filter(k => !S.srs['j:' + k.c]).map(k => k.c);

// Günün kanjileri: günün ilk açılışında seçilir ve gün boyu aynı kalır
function todaysKanji() {
  if (!S.kd || S.kd.date !== today()) {
    S.kd = { date: today(), chars: unlearnedKanji().slice(0, S.settings.kanjiPerDay), done: false };
    save();
  }
  return S.kd;
}

// Leitner kutuları: 0 = tekrar, 1 = zor, 2 = bildim
const hardDays = box => Math.max(INTERVALS[box] / 2, 0.5);
function schedule(id, grade) {
  const c = S.srs[id] || { box: 1, due: 0 };
  if (grade === 0) { c.box = 1; c.due = Date.now() + 10 * 60e3; }
  else if (grade === 1) c.due = Date.now() + hardDays(c.box) * DAY;
  else { c.box = Math.min(c.box + 1, 6); c.due = Date.now() + INTERVALS[c.box] * DAY; }
  S.srs[id] = c;
  save();
}
const learn = ids => { for (const id of ids) if (!S.srs[id]) S.srs[id] = { box: 1, due: Date.now() + DAY }; };
const fmtDays = d => d < 1 ? `${Math.round(d * 24)} sa` : `${d} gün`;
function fmtWhen(ts) {
  const h = Math.ceil((ts - Date.now()) / 36e5);
  return h < 24 ? `${h} saat sonra` : new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

// ---------- Yazma alanı (çizgi sırası kontrolü) ----------
// Çizgiler KanjiVG'nin 109×109 koordinatlarında. Kullanıcının çizdiği her çizgi, sıradaki
// beklenen çizgiyle N noktada karşılaştırılır: ortalama uzaklık, yön ve uzunluk.
const SVGNS = 'http://www.w3.org/2000/svg';
const N = 24;
const measurePath = (() => {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('width', '0'); s.setAttribute('height', '0');
  s.style.cssText = 'position:absolute;visibility:hidden';
  const p = document.createElementNS(SVGNS, 'path');
  s.appendChild(p);
  document.body.appendChild(s);
  return p;
})();
const SAMPLES = {};
function strokeSamples(ch) {
  return SAMPLES[ch] ??= STROKES[ch].s.map(d => {
    measurePath.setAttribute('d', d);
    const len = measurePath.getTotalLength();
    const pts = Array.from({ length: N }, (_, i) => { const q = measurePath.getPointAtLength(len * i / (N - 1)); return [q.x, q.y]; });
    return { len, pts };
  });
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const polyLen = pts => pts.reduce((s, p, i) => i ? s + dist(pts[i - 1], p) : 0, 0);
const meanDist = (a, b) => a.reduce((s, p, i) => s + dist(p, b[i]), 0) / a.length;
function resample(pts, n) {
  const d = [0];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + dist(pts[i - 1], pts[i]));
  const total = d[d.length - 1];
  if (!total) return Array(n).fill(pts[0]);
  const out = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const t = total * i / (n - 1);
    while (j < d.length - 2 && d[j + 1] < t) j++;
    const r = (t - d[j]) / ((d[j + 1] - d[j]) || 1);
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * r, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * r]);
  }
  return out;
}

let pad = null; // { key, ch, mode: watch|trace|memory, done, misses, mistakes, finished }
function ensurePad(key, ch, mode, onDone) {
  if (!pad || pad.key !== key) pad = { key, ch, mode, done: 0, misses: 0, mistakes: 0, finished: false, onDone };
  return pad;
}
function judge(u) {
  const all = strokeSamples(pad.ch), exp = all[pad.done];
  // Eşikler 109'luk ızgarada: ortalama sapma ve uç noktaların sapması
  const ur = resample(u, N), tol = pad.mode === 'trace' ? 14 : 16, endTol = tol * 1.5;
  const ulen = polyLen(u);
  const lenOk = exp.len < 15 || (ulen > exp.len * 0.4 && ulen < exp.len * 2.2 + 15); // kısa çizgilerde el titremesine pay
  const fwd = meanDist(ur, exp.pts), back = meanDist(ur, [...exp.pts].reverse());
  const endsOk = dist(ur[0], exp.pts[0]) < endTol && dist(ur[N - 1], exp.pts[N - 1]) < endTol;
  if (fwd < tol && endsOk && lenOk) return 'ok';
  if (back < tol && back < fwd) return 'dir';
  if (all.some((s, j) => j > pad.done && meanDist(ur, s.pts) < tol)) return 'order';
  return 'miss';
}
function padMsg(html) { const el = document.getElementById('padMsg'); if (el) el.innerHTML = html; }
function drawAnimated(g, ch, from, to) {
  const all = strokeSamples(ch), data = STROKES[ch].s;
  let delay = 0.15;
  g.innerHTML = data.slice(from, to).map((d, i) => {
    const len = all[from + i].len, dur = 0.25 + len / 110;
    const html = `<path d="${d}" style="--len:${len.toFixed(1)}px;--dur:${dur.toFixed(2)}s;--delay:${delay.toFixed(2)}s"/>`;
    delay += dur + 0.12;
    return html;
  }).join('');
}
function showHint(svg, prefix = '') {
  drawAnimated(svg.querySelector('.hint'), pad.ch, pad.done, pad.done + 1);
  padMsg(prefix + `<div class="hint-line">${biI(`İpucu: ${pad.done + 1}. çizgi`, `Hint: stroke ${pad.done + 1}`)}</div>`);
}
function mountPad(el) {
  const p = pad, data = STROKES[p.ch];
  if (!data) { el.innerHTML = `<p class="muted">${bi('Bu karakter için çizgi verisi yok.', 'No stroke data for this character.')}</p>`; return; }
  const guide = p.mode !== 'memory';
  el.innerHTML = `<svg viewBox="0 0 109 109" class="wsvg" role="img" aria-label="Yazma alanı / Writing pad">
    <rect class="grid-box" x="1" y="1" width="107" height="107" rx="8"/>
    <path class="grid" d="M54.5 5v99M5 54.5h99"/>
    ${guide ? `<g class="guide">${data.s.map(d => `<path d="${d}"/>`).join('')}</g>` : ''}
    <g class="ink">${data.s.slice(0, p.done).map(d => `<path d="${d}"/>`).join('')}</g>
    <g class="hint"></g>
    ${p.mode === 'trace' ? `<g class="nums">${data.n.map(([x, y], i) => `<text x="${x}" y="${y}" class="${i === p.done ? 'next' : ''}">${i + 1}</text>`).join('')}</g>` : ''}
    <path class="live"/>
  </svg>`;
  const svg = el.firstElementChild;
  if (p.mode === 'watch') { drawAnimated(svg.querySelector('.hint'), p.ch, 0, data.s.length); return; }
  if (p.finished) return;
  const live = svg.querySelector('.live');
  let pts = null;
  const pt = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 109, (e.clientY - r.top) / r.height * 109]; };
  svg.addEventListener('pointerdown', e => {
    e.preventDefault();
    svg.setPointerCapture(e.pointerId);
    pts = [pt(e)];
    live.classList.remove('bad');
    live.setAttribute('d', '');
  });
  svg.addEventListener('pointermove', e => {
    if (!pts) return;
    pts.push(pt(e));
    live.setAttribute('d', 'M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L'));
  });
  const end = () => {
    if (!pts) return;
    const u = pts;
    pts = null;
    onStroke(svg, u);
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
}
function onStroke(svg, u) {
  const p = pad, live = svg.querySelector('.live'), total = STROKES[p.ch].s.length;
  const res = judge(u);
  if (res === 'ok') {
    live.setAttribute('d', '');
    svg.querySelector('.ink').insertAdjacentHTML('beforeend', `<path d="${STROKES[p.ch].s[p.done]}"/>`);
    svg.querySelector('.hint').innerHTML = '';
    p.done++;
    p.misses = 0;
    svg.querySelectorAll('.nums text').forEach((t, i) => t.classList.toggle('next', i === p.done));
    padMsg('');
    if (p.done === total) {
      p.finished = true;
      setTimeout(() => { if (pad === p) { p.onDone?.(p); render(); } }, 350);
    }
    return;
  }
  p.mistakes++;
  p.misses++;
  live.classList.add('bad');
  setTimeout(() => { if (live.classList.contains('bad')) live.setAttribute('d', ''); }, 450);
  const msg = `<div class="err-line">${{
    dir: biI('Yön ters: çizgiyi diğer uçtan başlat', 'Wrong direction'),
    order: biI(`Sıra yanlış: önce ${p.done + 1}. çizgi`, 'Wrong stroke order'),
    miss: biI('Olmadı, tekrar dene', 'Not quite — try again'),
  }[res]}</div>`;
  if (p.misses >= (p.mode === 'trace' ? 1 : 2)) showHint(svg, msg); else padMsg(msg);
}
function padBlock(key, ch, mode, onDone) {
  const p = ensurePad(key, ch, mode, onDone);
  const done = p.finished
    ? `<span class="pad-ok">${p.mistakes ? bi(`Bitti — ${p.mistakes} hata`, `Done — ${p.mistakes} mistake(s)`) : bi('Kusursuz! ✨', 'Perfect! ✨')}</span>`
    : mode === 'watch' ? bi(`${STROKES[ch]?.s.length ?? 0} çizgi — sırayı izle`, `${STROKES[ch]?.s.length ?? 0} strokes — watch the order`) : '';
  return `<div class="wpad-wrap"><div class="wpad"></div><div class="pad-msg" id="padMsg">${done}</div></div>`;
}
const padControls = () => `<div class="btn-row"><button class="btn ghost" data-a="padHint">${biI('İpucu', 'Hint')}</button><button class="btn ghost" data-a="padReset">${biI('Baştan', 'Restart')}</button></div>`;
const watchControls = next => `<div class="btn-row"><button class="btn ghost" data-a="padReset">${biI('Tekrar izle', 'Replay')}</button>${next}</div>`;

// ---------- Soru üretimi ----------
function makeQuestion(id) {
  const it = ITEMS[id];
  const others = shuffle(Object.values(ITEMS).filter(x => x.kind === it.kind && x.id !== id));
  if (it.kind === 'kana') {
    const wrong = uniqBy(others.filter(x => x.r !== it.r), x => x.r).slice(0, 3);
    return {
      id, speak: it.jp, ask: bi('Bu harf nasıl okunur?', 'How do you read this?'),
      prompt: `<div class="jp xl">${it.jp}</div>`,
      opts: shuffle([it, ...wrong].map(x => ({ html: `<span class="opt-main">${x.r}</span>`, ok: x === it }))),
    };
  }
  const wrong = uniqBy(others.filter(x => x.tr !== it.tr), x => x.tr).slice(0, 3);
  const say = it.say || it.jp;
  if (it.kind !== 'sentence' && Math.random() < 0.35) {
    return {
      id, speak: say, after: true, ask: bi('Japoncası hangisi?', 'Which one is the Japanese?'),
      prompt: `<div class="meaning lg">${it.tr}<span class="en">${it.en}</span></div>`,
      opts: shuffle([it, ...wrong].map(x => ({ html: `<span class="jp opt-main">${x.jp}</span>${x.kind === 'word' ? `<span class="romaji">${x.r}</span>` : ''}`, ok: x === it }))),
    };
  }
  const prompt = it.kind === 'kanji'
    ? `<div class="jp xl">${it.jp}</div>`
    : `${it.k ? `<div class="kanji jp">${it.k}</div>` : ''}<div class="jp ${it.kind === 'word' ? 'lg' : 'md'}">${it.jp}</div><div class="romaji">${it.r}</div>`;
  return {
    id, speak: say, ask: bi('Anlamı nedir?', 'What does it mean?'), prompt,
    opts: shuffle([it, ...wrong].map(x => ({ html: `<span class="opt-main">${x.tr}</span><span class="en">${x.en}</span>`, ok: x === it }))),
  };
}
function grammarQuestions(l) {
  const g = GRAMMAR[l.id];
  const blanks = g.quiz.map(q => ({
    speak: q.q.replace('＿', q.a), after: true, ask: bi('Boşluğu doldur', 'Fill in the blank'),
    prompt: `<div class="jp md">${q.q.replace('＿', '<span class="blank">＿＿</span>')}</div><div class="meaning sm">${q.tr}<span class="en">${q.en}</span></div>`,
    opts: shuffle(q.o).map(o => ({ html: `<span class="jp opt-main">${o}</span>`, ok: o === q.a })),
  }));
  return [...shuffle(blanks), ...sample(lessonItems(l), 2).map(makeQuestion)];
}

// ---------- Egzersiz sonrası kelime ezberi ----------
const SMALL_BASE = { 'っ': 'つ', 'ッ': 'ツ', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ' };
const baseKana = c => SMALL_BASE[c] || c;
const uniq = a => [...new Set(a)];

// Yalnızca bilinen + çalışılan harflerle yazılabilen, çalışılan harflerden en az birini içeren kelimeler.
// Önce yeni kelimeler, sonra çalışılan harflerden en çoğunu kullananlar.
function wordsWith(practiced, n) {
  const prac = new Set(practiced);
  const known = new Set([...practiced, ...learnedIds().filter(id => id.startsWith('k:')).map(id => ITEMS[id].jp)]);
  return Object.values(ITEMS)
    .filter(it => it.kind === 'word' && [...it.jp].every(c => c === 'ー' || known.has(baseKana(c))) && [...it.jp].some(c => prac.has(baseKana(c))))
    .map(it => ({ id: it.id, s: (S.srs[it.id] ? 0 : 100) + uniq([...it.jp].filter(c => prac.has(baseKana(c)))).length * 10 + Math.random() * 8 }))
    .sort((a, b) => b.s - a.s).slice(0, n).map(x => x.id);
}
function wordsForFlow(f) {
  if (!S.settings.afterWords) return { words: [], hl: [] };
  if (f.type === 'kanji') return { words: uniq(f.chars.flatMap(c => KJ[c].ex.map(exWordId))).slice(0, 6), hl: f.chars };
  const ids = f.type === 'lesson' && f.l.type === 'kana' ? f.ids : f.type === 'write' ? f.ids : f.type === 'quiz' ? f.qs.map(q => q.id) : [];
  const kana = uniq(ids.filter(id => id?.startsWith('k:')).map(id => ITEMS[id].jp));
  const kanji = uniq(ids.filter(id => id?.startsWith('j:')).map(id => id.slice(2)));
  const words = [
    ...(kana.length ? wordsWith(kana, f.type === 'lesson' ? 5 : 4) : []),
    ...sample(uniq(kanji.flatMap(c => KJ[c].ex.map(exWordId))), 4),
  ];
  return { words, hl: [...kana, ...kanji] };
}
const markHl = (s, hl) => [...s].map(c => hl.includes(c) || hl.includes(baseKana(c)) ? `<span class="hl">${c}</span>` : c).join('');
function wordCard(it, hl, kanjiFirst) {
  const isNew = !S.srs[it.id];
  return `<div class="study">
    <span class="tag ${isNew ? 'new' : ''}">${isNew ? biI('Yeni kelime', 'New word') : biI('Tekrar', 'Review')}</span>
    ${it.k && kanjiFirst
      ? `<div class="jp lg">${markHl(it.k, hl)}</div><div class="jp md sub-jp">${it.jp}</div>`
      : `${it.k ? `<div class="kanji jp">${it.k}</div>` : ''}<div class="jp lg">${markHl(it.jp, hl)}</div>`}
    ${speakBtn(it.jp)}
    <div class="reading"><span class="romaji">${it.r}</span><span class="trt">TR: ${trRead(it.r)}</span></div>
    <div class="meaning">${it.tr}<span class="en">${it.en}</span></div>
    ${it.note ? `<div class="note"><p>${it.note[0]}</p><p class="en">${it.note[1]}</p></div>` : ''}
  </div>`;
}
// Harf karolarıyla kelimeyi yazma: kelimenin harfleri + çalışılan harflerden çeldiriciler
function spellQuestion(id, hl, kanjiFirst) {
  const it = ITEMS[id], target = [...it.jp];
  const kata = /[ァ-ヺ]/.test(it.jp);
  const pool = Object.values(ITEMS).filter(x => x.kind === 'kana' && (x.script === 'k') === kata).map(x => x.jp);
  const known = pool.filter(c => S.srs['k:' + c]);
  const extra = uniq([...shuffle(hl.filter(c => pool.includes(c))), ...shuffle(known), ...shuffle(pool)]).filter(c => !target.includes(c)).slice(0, 3);
  return {
    type: 'spell', id, target, tiles: shuffle([...target, ...extra]), speak: it.jp,
    ask: it.k && kanjiFirst ? bi('Okunuşunu harflerle yaz', 'Spell the reading with the tiles') : bi('Kelimeyi harflerle yaz', 'Spell the word with the tiles'),
    prompt: `${it.k && kanjiFirst ? `<div class="jp lg">${it.k}</div>` : ''}<div class="meaning lg">${it.tr}<span class="en">${it.en}</span></div>`,
  };
}
const wordQuestions = f => shuffle(f.words.flatMap(id => [makeQuestion(id), spellQuestion(id, f.hl, f.kanjiFirst)]));

// ---------- Kelime ve cümle yazma ----------
// Bir hedef "bölümler"den oluşur: { text, ruby, punct }. Kanji yalnızca öğrenildiyse yazılır;
// değilse okunuşu (kana) yazılır. Noktalama otomatik eklenir.
const isKanji = c => /[一-龯々]/.test(c);
const kanjiKnown = c => !!S.srs['j:' + c] && !!STROKES[c];
const canWrite = c => !!STROKES[c] && (c === 'ー' || (isKanji(c) ? kanjiKnown(c) : !!S.srs['k:' + baseKana(c)]));
function wordParts(it) {
  if (it.k && [...it.k].some(isKanji) && [...it.k].every(canWrite)) return [{ text: it.k, ruby: it.jp }];
  return [...it.jp].every(canWrite) ? [{ text: it.jp, ruby: null }] : null;
}
function sentParts(s) {
  const parts = s.segs.map(g => g.k
    ? ([...g.k].every(kanjiKnown) ? { text: g.k, ruby: g.r } : { text: g.r, ruby: null })
    : { text: g.t, ruby: null, punct: PUNCT.test(g.t) });
  return parts.every(p => p.punct || [...p.text].every(canWrite)) ? parts : null;
}
const writableWords = () => Object.values(ITEMS).filter(it => it.kind === 'word' && wordParts(it));
const availableSentences = () => SENT.filter(sentParts);
const kanjiInParts = parts => parts.filter(p => p.ruby).length;

function seqItem(kind, it) {
  const parts = kind === 'word' ? wordParts(it) : sentParts(it);
  const cells = parts.flatMap(p => [...p.text].map(c => ({ c, w: !p.punct })));
  return { kind, id: it.id, it, parts, cells };
}
const firstCell = (item, from = 0) => { let n = from; while (n < item.cells.length && !item.cells[n].w) n++; return n; };
function startSeq(kind, its, daily = false) {
  if (!its.length) return;
  const items = its.map(it => seqItem(kind, it));
  ui.flow = { uid: uid(), type: 'seq', phase: 'seq', kind, items, i: 0, ci: firstCell(items[0]), mist: 0, itemDone: false, guide: false, perfect: 0, xp: 0, daily };
  ui.sheet = null;
}
function onCellDone(p) {
  const f = ui.flow;
  if (!f || f.type !== 'seq') return;
  const item = f.items[f.i];
  f.mist += p.mistakes;
  f.ci = firstCell(item, f.ci + 1);
  if (f.ci >= item.cells.length) f.itemDone = true;
}
// Kelime yazma: önce tekrarı gelen, sonra öğrenilmiş kelimeler; yeterince yoksa yazılabilen havuz kelimeleri
function pickWriteWords(n = 6) {
  const all = writableWords(), learnedW = all.filter(it => S.srs[it.id]);
  const due = learnedW.filter(it => S.srs[it.id].due <= Date.now());
  return uniqBy([...shuffle(due), ...shuffle(learnedW), ...shuffle(all)], it => it.id).slice(0, n);
}
// Günün cümleleri: az yazılmış ve öğrenilmiş kanjiyi çok kullanan cümleler öne çıkar
function todaysSentences() {
  if (!S.ds || S.ds.date !== today() || (!S.ds.ids.length && !S.ds.done)) {
    const ranked = availableSentences().map(s => ({ id: s.id, sc: -(S.sp[s.id] || 0) * 10 + kanjiInParts(sentParts(s)) * 3 + Math.random() * 4 }));
    S.ds = { date: today(), ids: ranked.sort((a, b) => b.sc - a.sc).slice(0, S.settings.sentencesPerDay).map(x => x.id), done: false };
    save();
  }
  return S.ds;
}
const sentById = id => SENT.find(s => s.id === id);
const partsPreview = parts => parts.map(p => p.ruby ? `<ruby>${p.text}<rt>${p.ruby}</rt></ruby>` : p.text).join('');

// ---------- Akışlar ----------
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function startLesson(id) {
  const l = LESSONS.find(x => x.id === id);
  ui.flow = l.type === 'grammar'
    ? { uid: uid(), type: 'grammar', l, phase: 'read' }
    : { uid: uid(), type: 'lesson', l, phase: 'learn', ids: lessonItems(l), i: 0, wi: 0 };
  ui.sheet = null;
}
function startKanji(chars) {
  if (!chars.length) return;
  const steps = chars.flatMap(c => ['info', 'watch', 'trace', 'memory'].map(k => ({ c, k })));
  ui.flow = { uid: uid(), type: 'kanji', phase: 'steps', chars, steps, i: 0 };
  ui.sheet = null;
}
function startWrite(ids) {
  if (!ids.length) return;
  ui.flow = { uid: uid(), type: 'write', phase: 'write', ids: sample(ids, 8), i: 0, perfect: 0, xp: 0 };
  ui.sheet = null;
}
function startQuiz(f, qs) { Object.assign(f, { phase: 'quiz', qs, qi: 0, answered: null, correct: 0, pick: [] }); }
function startPractice(ids) { ui.flow = { uid: uid(), type: 'quiz' }; startQuiz(ui.flow, sample(ids, 12).map(makeQuestion)); }
function kanjiQuiz(f) { startQuiz(f, shuffle(f.chars.flatMap(c => [makeQuestion('j:' + c), makeQuestion('j:' + c)]))); }
function finish() {
  const f = ui.flow;
  // Egzersiz bitti: önce bu harflerle/kanjilerle kelime ezberi (bir kez)
  if (!f.words && f.type !== 'review' && f.type !== 'grammar' && f.type !== 'listen') {
    Object.assign(f, wordsForFlow(f));
    if (f.words.length) {
      f.main = { correct: f.correct, total: f.qs?.length };
      f.kanjiFirst = f.type === 'kanji' || f.hl.some(c => KJ[c]);
      f.phase = 'wlearn';
      f.wi2 = 0;
      return;
    }
  }
  const correct = f.main ? f.main.correct : f.correct;
  if (f.type === 'lesson' || f.type === 'grammar') {
    learn(lessonItems(f.l));
    S.done[f.l.id] = true;
    f.xp = 10 + correct * 2;
  } else if (f.type === 'kanji') {
    learn(f.chars.map(c => 'j:' + c));
    const kd = todaysKanji();
    if (kd.chars.every(c => S.srs['j:' + c])) kd.done = true;
    f.xp = 10 + f.chars.length * 5 + correct * 2;
  } else if (f.type === 'quiz') f.xp = correct;
  else if (f.type === 'listen') f.xp = correct * 2;
  if (f.words?.length) {
    learn(f.words);
    f.xp += f.words.length * 2 + f.correct; // kelime ezberindeki doğrular
  }
  save();
  addXP(f.xp);
  f.phase = 'done';
}

// ---------- Görünümler ----------
function lessonCard(l) {
  const done = S.done[l.id], next = nextLesson() === l;
  const type = { kana: 'Alfabe', vocab: 'Kelime', grammar: 'Gramer' }[l.type];
  const n = lessonItems(l).length;
  return `<button class="lesson ${done ? 'done' : ''} ${next ? 'next' : ''}" data-a="lesson" data-id="${l.id}">
    <span class="lic ${l.type !== 'vocab' ? 'jp' : ''}">${done ? IC.check : l.icon}</span>
    <span class="lbody"><span class="ltitle">${bi(l.title[0], l.title[1])}</span><span class="lmeta">${type} · ${n} ${l.type === 'grammar' ? 'örnek' : 'kart'}${l.type === 'kana' && S.settings.lessonWrite ? ' · ✍️' : ''}</span></span>
    ${next ? `<span class="pill">Sıradaki</span>` : ''}
  </button>`;
}

function kanjiTodayCard() {
  const kd = todaysKanji();
  if (!kd.chars.length) return `<section class="card">${bi('Tüm kanjileri öğrendin! 🎉', 'You learned every kanji! 🎉')}</section>`;
  return `<section class="card kt">
    <div class="eyebrow">${bi('Günün kanjileri', 'Today\'s kanji')}</div>
    <div class="kt-row">${kd.chars.map(c => `<button class="kt-cell ${S.srs['j:' + c] ? 'learned' : ''}" data-a="kanjiInfo" data-c="${c}"><span class="jp">${c}</span><small>${KJ[c].tr}</small></button>`).join('')}</div>
    ${kd.done
      ? `<div class="ok-line">${IC.check}<span>${bi('Bugün tamamlandı — yarın yenileri gelecek', 'Done for today — new ones tomorrow')}</span></div>`
      : `<button class="btn" data-a="kanjiStart">${IC.pen} ${biI('Öğren ve yaz', 'Learn & write')}</button>`}
  </section>`;
}

function renderHome() {
  const due = dueIds().length, nl = nextLesson(), dx = dailyXP(), goal = S.settings.goal;
  const tip = TIPS[Math.floor(Date.now() / DAY) % TIPS.length];
  const tile = (jp, filter) => {
    const all = Object.values(ITEMS).filter(filter), n = all.filter(i => S.srs[i.id]).length;
    return `<div class="ptile"><div class="jp">${jp}</div><div class="num">${n} / ${all.length}</div><div class="bar"><i style="width:${n / all.length * 100}%"></i></div></div>`;
  };
  return `
  <header class="top">
    <div><div class="jp hello">${S.xp ? 'おかえり！' : 'ようこそ！'}</div><h1>${S.xp ? bi('Tekrar hoş geldin', 'Welcome back') : bi('Megumi Language\'a hoş geldin', 'Welcome to Megumi Language')}</h1></div>
    <div class="chips">
      <span class="chip" title="Günlük seri / Day streak">🔥 ${streakNow()}</span><span class="chip" title="XP">⭐ ${S.xp}</span>
      <button class="icon-btn" data-a="tab" data-id="profile" aria-label="Profil / Profile">${IC.user}</button>
    </div>
  </header>
  <section class="card">
    <div class="row-between"><strong>${bi('Günlük hedef', 'Daily goal')}</strong><span class="muted">${Math.min(dx, goal)} / ${goal} XP</span></div>
    <div class="bar"><i style="width:${Math.min(100, dx / goal * 100)}%"></i></div>
  </section>
  ${due ? `<button class="card cta" data-a="startReview"><div><div class="eyebrow">${bi('Tekrar zamanı', 'Time to review')}</div><div class="big">${due}</div><div>${bi('kart seni bekliyor', 'cards waiting')}</div></div><span class="go">→</span></button>` : ''}
  <h2 class="sec">${bi('Sıradaki ders', 'Up next')}</h2>
  ${nl ? lessonCard(nl) : `<section class="card">${bi('Tüm dersleri bitirdin! 🎉', 'You finished every lesson! 🎉')}</section>`}
  ${kanjiTodayCard()}
  ${sentTodayCard()}
  <div class="grid2 quick"><button class="wtile" data-a="openStory" data-id="${S.lastRead && STORIES.some(s => s.id === S.lastRead) ? S.lastRead : 'tebukuro'}"><span class="wt-ic">📖</span><span class="wt-t">${bi('Okumaya devam', 'Keep reading')}</span></button><button class="wtile" data-a="tab" data-id="listen"><span class="wt-ic">🎧</span><span class="wt-t">${bi('Dinleme pratiği', 'Listening practice')}</span></button></div>
  <section class="card tip"><div class="eyebrow">${bi('Türkçe avantajı', 'The Turkish advantage')}</div><p>${tip[0]}</p><p class="en">${tip[1]}</p></section>
  <h2 class="sec">${bi('İlerleme', 'Progress')}</h2>
  <div class="grid3">
    ${tile('ひらがな', i => i.kind === 'kana' && i.script === 'h')}
    ${tile('カタカナ', i => i.kind === 'kana' && i.script === 'k')}
    ${tile('漢字', i => i.kind === 'kanji')}
  </div>`;
}

function renderKana() {
  const s = ui.kanaScript;
  const grid = rows => `<div class="kgrid">${rows.map(({ cells }) => cells.map(c => c
    ? `<button class="kcell b${S.srs[c.id]?.box || 0}" data-a="kana" data-id="${c.id}" aria-label="${c.r}"><span class="jp">${c.jp}</span><span class="romaji">${c.r}</span></button>`
    : '<span class="kcell empty"></span>').join('')).join('')}</div>`;
  return `
  <h1>${bi('Kana alfabeleri', 'Kana syllabaries')}</h1>
  <p class="muted">${bi('Bir harfe dokun: dinle, ipucunu gör ve yazmayı dene.', 'Tap a character to hear it, see tips and practise writing.')}</p>
  <div class="seg">
    <button class="${s === 'h' ? 'on' : ''}" data-a="kanaScript" data-s="h"><span class="jp">ひらがな</span> Hiragana</button>
    <button class="${s === 'k' ? 'on' : ''}" data-a="kanaScript" data-s="k"><span class="jp">カタカナ</span> Katakana</button>
  </div>
  <div class="btn-row tight">
    <button class="btn" data-a="kanaWrite" data-s="${s}">${IC.pen} ${biI('Yazma', 'Writing')}</button>
    <button class="btn ghost" data-a="kanaTest" data-s="${s}">${biI('Test', 'Quiz')}</button>
  </div>
  <p class="small muted" style="margin-top:14px">${s === 'h'
    ? bi('Hiragana: Japonca kelimeler ve ekler için kullanılan temel alfabe.', 'Hiragana: the basic script for native words and grammar endings.')
    : bi('Katakana: yabancı kökenli kelimeler (コーヒー, トルコ) için kullanılır.', 'Katakana: used for loanwords and foreign names.')}</p>
  ${grid(KANA[s].filter(r => !DAKUTEN_ROWS.includes(r.row)))}
  <h2 class="sec">${bi('Ten-ten ( ゛) ve maru ( ゜)', 'Voiced marks ( ゛ ゜)')}</h2>
  <p class="small muted">${bi('゛ işareti sesi yumuşatır: か ka → が ga. ゜ işareti h → p yapar: は ha → ぱ pa.', '゛ voices the consonant (ka → ga); ゜ turns h into p.')}</p>
  ${grid(KANA[s].filter(r => DAKUTEN_ROWS.includes(r.row)))}
  <div class="legend"><span><i style="opacity:.3"></i>${biI('Öğreniliyor', 'Learning')}</span><span><i style="opacity:.65"></i>${biI('İyi', 'Good')}</span><span><i style="background:var(--ok)"></i>${biI('Ustalaşıldı', 'Mastered')}</span></div>`;
}

function renderKanji() {
  const learned = KANJI.filter(k => S.srs['j:' + k.c]).length;
  return `
  <h1>${bi('Kanji', 'Kanji')}</h1>
  <p class="muted">${bi('Her gün birkaç kanji: anlamını öğren, çizgi sırasını izle, üzerinden geç, sonra ezbere yaz.', 'A few kanji a day: learn the meaning, watch the stroke order, trace it, then write it from memory.')}</p>
  ${kanjiTodayCard()}
  <div class="btn-row tight">
    <button class="btn ghost" data-a="kanjiWrite" ${learned ? '' : 'disabled'}>${IC.pen} ${biI('Yazma pratiği', 'Writing practice')}</button>
    <button class="btn ghost" data-a="kanjiExtra" ${unlearnedKanji().length ? '' : 'disabled'}>${biI('Ekstra kanji', 'Extra kanji')}</button>
  </div>
  <div class="row-between" style="margin-top:22px"><h2 class="sec" style="margin:0">${bi('Kanji listesi (N5–N4)', 'Kanji list (N5–N4)')}</h2><span class="muted small">${learned} / ${KANJI.length}</span></div>
  <div class="bar" style="margin-bottom:12px"><i style="width:${learned / KANJI.length * 100}%"></i></div>
  <div class="jgrid">${KANJI.map(k => `<button class="kcell jcell b${S.srs['j:' + k.c]?.box || 0}" data-a="kanjiInfo" data-c="${k.c}"><span class="jp">${k.c}</span><small>${k.tr.split(';')[0]}</small></button>`).join('')}</div>
  <p class="muted small" style="margin-top:14px">${bi('Gün başına kanji sayısını Profil ▸ Ayarlar\'dan değiştirebilirsin.', 'Change kanji per day in Profile ▸ Settings.')}</p>`;
}

const okuri = r => esc(r).replace(/\((.+?)\)/, '<span class="oku">$1</span>');
function readingList(arr) {
  return arr.map(r => `<span class="rd"><span class="jp">${okuri(r)}</span> <span class="romaji">${kanaToRomaji(r.replace(/[()]/g, ''))}</span></span>`).join('');
}
function kanjiDetail(k) {
  return `
    <div class="meaning">${k.tr}<span class="en">${k.en}</span></div>
    <div class="readings">
      ${k.on.length ? `<div><span class="rlabel" title="Çince kökenli okunuş / Chinese-derived reading">On</span>${readingList(k.on)}</div>` : ''}
      ${k.kun.length ? `<div><span class="rlabel" title="Japonca okunuş / native Japanese reading">Kun</span>${readingList(k.kun)}</div>` : ''}
    </div>
    <div class="kex-list">${k.ex.map(([w, r, tr, en]) => `<button class="kex" data-a="speak" data-t="${esc(r)}">
      <span class="jp kex-w">${w}</span><span class="kex-r"><span class="jp">${r}</span> <span class="romaji">${kanaToRomaji(r)}</span></span>
      <span class="kex-m">${tr}<span class="en">${en}</span></span></button>`).join('')}</div>
    ${k.m ? `<div class="note"><p>💡 ${k.m[0]}</p><p class="en">${k.m[1]}</p></div>` : ''}
    <p class="muted small center" style="margin:10px 0 0">${STROKES[k.c].s.length} ${biI('çizgi', 'strokes')}</p>`;
}

function renderSheet() {
  const it = ITEMS[ui.sheet], tip = tipFor(it);
  const body = it.kind === 'kanji'
    ? `<div class="jp xl">${it.jp}</div>${speakBtn(it.say)}${kanjiDetail(it.k)}`
    : `<div class="jp xl">${it.jp}</div>
       <div class="reading"><span class="romaji-big">${it.r}</span><span class="trt">Türkçe okunuş: ${trRead(it.r)}</span></div>
       ${tip ? `<div class="note"><p>${tip[0]}</p><p class="en">${tip[1]}</p></div>` : ''}
       <div class="muted pair">${it.script === 'h' ? 'Katakana' : 'Hiragana'}: <span class="jp">${it.pair}</span></div>`;
  return `<div class="sheet-back" data-a="closeSheet"></div>
  <div class="sheet" role="dialog" aria-modal="true">
    <button class="icon-btn close" data-a="closeSheet" aria-label="Kapat / Close">${IC.close}</button>
    ${body}
    <div class="btn-row">
      ${it.kind === 'kana' ? `<button class="btn ghost" data-a="speak" data-t="${esc(it.jp)}">${IC.speaker} ${biI('Dinle', 'Listen')}</button>` : ''}
      <button class="btn" data-a="writeOpen" data-ch="${esc(it.jp)}">${IC.pen} ${biI('Yaz', 'Write')}</button>
    </div>
  </div>`;
}

function renderWriteSheet() {
  const ch = ui.write, mode = ui.writeMode;
  const it = ITEMS['k:' + ch] || ITEMS['j:' + ch];
  const key = `free-${ch}-${mode}-${ui.writeNonce}`;
  const block = padBlock(key, ch, mode);
  const controls = mode === 'watch' ? watchControls('')
    : pad.finished ? `<button class="btn" data-a="padReset">${biI('Tekrar yaz', 'Write again')}</button>` : padControls();
  return `<div class="sheet-back" data-a="writeClose"></div>
  <div class="sheet write-sheet" role="dialog" aria-modal="true">
    <button class="icon-btn close" data-a="writeClose" aria-label="Kapat / Close">${IC.close}</button>
    <div class="ws-head"><span class="jp ws-char">${ch}</span><span>${it.kind === 'kana' ? `<b>${it.r}</b>` : bi(it.tr, it.en)}</span></div>
    <div class="seg seg3">${[['watch', 'İzle', 'Watch'], ['trace', 'Takip et', 'Trace'], ['memory', 'Ezbere', 'Memory']].map(([m, tr, en]) =>
      `<button class="${mode === m ? 'on' : ''}" data-a="writeMode" data-m="${m}">${bi(tr, en)}</button>`).join('')}</div>
    ${block}
    ${controls}
  </div>`;
}

function sentTodayCard() {
  const ds = todaysSentences();
  if (!ds.ids.length) {
    const hira = Object.values(ITEMS).filter(i => i.kind === 'kana' && i.script === 'h');
    const n = hira.filter(i => S.srs[i.id]).length;
    return `<section class="card">
      <div class="eyebrow">${bi('Günün cümleleri', 'Today\'s sentences')}</div>
      <p>${bi('Cümle yazmaya başlamak için hiragana derslerine devam et; öğrendiğin harflerle yazılabilen ilk cümleler burada görünecek.', 'Keep going with the hiragana lessons — sentences you can write will appear here.')}</p>
      <div class="bar"><i style="width:${n / hira.length * 100}%"></i></div><p class="muted small" style="margin-top:6px">ひらがな ${n} / ${hira.length}</p>
    </section>`;
  }
  return `<section class="card">
    <div class="eyebrow">${bi('Günün cümleleri', 'Today\'s sentences')}</div>
    <ol class="sent-list">${ds.ids.map(id => { const s = sentById(id); return `<li>${s.tr}<span class="en">${s.en}</span></li>`; }).join('')}</ol>
    ${ds.done
      ? `<div class="ok-line">${IC.check}<span>${bi('Bugün tamamlandı', 'Done for today')}</span></div>`
      : `<button class="btn" data-a="sentDaily">${IC.pen} ${biI('Yazmaya başla', 'Start writing')}</button>`}
  </section>`;
}

function renderWrite() {
  const words = writableWords(), sents = availableSentences();
  const learnedWords = words.filter(it => S.srs[it.id]).length;
  const kanaN = learnedIds().filter(id => id.startsWith('k:')).length, kanjiN = learnedIds().filter(id => id.startsWith('j:')).length;
  const tile = (a, icon, tr, en, sub, enabled) => `<button class="wtile" data-a="${a}" ${enabled ? '' : 'disabled'}><span class="wt-ic jp">${icon}</span><span class="wt-t">${bi(tr, en)}</span><span class="muted small">${sub}</span></button>`;
  return `<h1>${bi('Yazma', 'Writing')}</h1>
  <p class="muted">${bi('Öğrendiğin kana ve kanjilerle kelime ve cümle yaz. Öğrenmediğin kanjiler kana ile yazılır; yeni kanji öğrendikçe cümleler kanjili hâle gelir.', 'Write words and sentences with the kana and kanji you know. Unknown kanji are written in kana; sentences switch to kanji as you learn them.')}</p>
  ${sentTodayCard()}
  <div class="wgrid">
    ${tile('wordWrite', 'ことば', 'Kelime yazma', 'Word writing', `${words.length} ${biI('kelime hazır', 'ready')}`, words.length)}
    ${tile('sentWrite', '文', 'Cümle pratiği', 'Sentence practice', `${sents.length} ${biI('cümle hazır', 'ready')}`, sents.length)}
    ${tile('kanaWrite', 'あ', 'Kana yazma', 'Kana writing', `${kanaN} ${biI('harf', 'kana')}`, true)}
    ${tile('kanjiWrite', '漢', 'Kanji yazma', 'Kanji writing', `${kanjiN} kanji`, kanjiN)}
  </div>
  ${learnedWords < words.length ? `<p class="muted small">${bi(`Kelime yazma önce öğrendiğin ${learnedWords} kelimeyi, sonra bu harflerle yazılabilen diğer kelimeleri getirir.`, `Word writing starts with your ${learnedWords} learned words, then other words you can spell.`)}</p>` : ''}
  <h2 class="sec">${bi('Yazabileceğin cümleler', 'Sentences you can write')} <span class="muted small">(${sents.length}/${SENT.length})</span></h2>
  ${sents.length ? sents.map(s => `<button class="sent-row" data-a="sentOne" data-id="${esc(s.id)}"><span class="jp">${partsPreview(sentParts(s))}</span><span class="small">${s.tr}<span class="en">${s.en}</span></span>${S.sp[s.id] ? `<span class="sp-count">✍️ ${S.sp[s.id]}</span>` : ''}</button>`).join('')
    : `<p class="muted">${bi('Henüz yok — birkaç kana dersi daha bitir.', 'None yet — finish a few more kana lessons.')}</p>`}`;
}

// ---------- Okuma ----------
// Belirteç: [yüzey, okunuş (hiragana) | 0, sözlük biçimi | 0, tür]. Hikâyeler önceden işlenmiştir (stories.js);
// yapıştırılan metinler cihazda kuromoji ile işlenir. Anlamlar önce kendi listemizden (Türkçe), yoksa JMdict'ten (İngilizce).
const KANJI_RE = /[一-龯々〆ヶ]/;
const kataToHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const POS_TR = {
  n: ['isim', 'noun'], v: ['fiil', 'verb'], a: ['sıfat (-i)', 'i-adjective'], adv: ['zarf', 'adverb'], p: ['parçacık (ek)', 'particle'],
  aux: ['yardımcı fiil / ek', 'auxiliary'], conj: ['bağlaç', 'conjunction'], adn: ['belirleyici', 'pre-noun adjectival'],
  int: ['ünlem', 'interjection'], pre: ['ön ek', 'prefix'], s: ['işaret', 'symbol'], f: ['dolgu sözü', 'filler'], x: ['', ''],
};
const loadScript = src => new Promise((res, rej) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = res;
  s.onerror = () => rej(new Error(src));
  document.head.appendChild(s);
});

// JMdict: ilk kelime dokunuşunda yüklenir; yazılış/okunuş → satır dizini
let dictIndex = null, dictP = null, dictErr = false;
function loadDict() {
  return dictP ??= loadScript('vendor/jmdict.js').then(() => {
    const idx = new Map();
    window.JMDICT.forEach((row, i) => {
      for (const f of [...(row[0] ? row[0].split('|') : []), ...row[1].split('|')]) {
        const a = idx.get(f);
        if (!a) idx.set(f, [i]); else if (a.length < 3) a.push(i);
      }
    });
    dictIndex = idx;
  }).catch(e => { dictErr = true; throw e; });
}
const dictLookup = (...forms) => {
  for (const f of forms) { const ids = f && dictIndex?.get(f); if (ids) return ids.map(i => window.JMDICT[i]); }
  return [];
};
function ownWord(...forms) {
  if (!ownIndex) {
    ownIndex = new Map();
    for (const it of Object.values(ITEMS)) if (it.kind === 'word') {
      if (it.k && !ownIndex.has(it.k)) ownIndex.set(it.k, it);
      if (!ownIndex.has(it.jp)) ownIndex.set(it.jp, it);
    }
  }
  for (const f of forms) if (f && ownIndex.has(f)) return ownIndex.get(f);
  return null;
}

// Yapıştırılan metinler için kuromoji (yalnızca gerektiğinde yüklenir)
let tokP = null;
// Sözlük dosyaları ".dat.gz.bin" adıyla dağıtılır (Android'in .gz dosyalarını açmasını önlemek için); kuromoji'nin isteklerini yönlendir
function redirectKuromojiDict() {
  const open = XMLHttpRequest.prototype.open;
  if (open.__megumi) return;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (typeof url === 'string' && /vendor\/kuromoji\/dict\/[^/]+\.dat\.gz$/.test(url)) url += '.bin';
    return open.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.open.__megumi = true;
}
const loadTokenizer = () => tokP ??= loadScript('vendor/kuromoji/kuromoji.js')
  .then(() => new Promise((res, rej) => { redirectKuromojiDict(); window.kuromoji.builder({ dicPath: 'vendor/kuromoji/dict/' }).build((e, t) => e ? rej(e) : res(t)); }))
  .catch(e => { tokP = null; throw e; });
const POS_CODE = { 名詞: 'n', 動詞: 'v', 形容詞: 'a', 副詞: 'adv', 助詞: 'p', 助動詞: 'aux', 記号: 's', 接続詞: 'conj', 連体詞: 'adn', 感動詞: 'int', 接頭詞: 'pre', フィラー: 'f' };
const SPECIAL_READ = { 二人: 'ふたり', 一人: 'ひとり', 今日: 'きょう', 明日: 'あした', 昨日: 'きのう', 大人: 'おとな', 今朝: 'けさ', 今年: 'ことし', 上手: 'じょうず', 下手: 'へた', 眼鏡: 'めがね' };
function tokenizePara(tok, para) {
  const toks = tok.tokenize(para).map(t => {
    const s = t.surface_form;
    const r = KANJI_RE.test(s) ? (SPECIAL_READ[s] || (t.reading && t.reading !== '*' ? kataToHira(t.reading) : 0)) : 0;
    const base = t.basic_form && t.basic_form !== '*' && t.basic_form !== s ? t.basic_form : 0;
    return [s, r, base, POS_CODE[t.pos] || 'x'];
  });
  const out = [];
  for (let i = 0; i < toks.length; i++) {
    const two = toks[i + 1] && toks[i][0] + toks[i + 1][0];
    if (two && SPECIAL_READ[two]) { out.push([two, SPECIAL_READ[two], 0, 'n']); i++; } else out.push(toks[i]);
  }
  return out;
}
// ---------- Kendi metinlerin: kalıcı depo (IndexedDB) ----------
// localStorage ~5 MB ile sınırlı; kitaplar IndexedDB'de { id, title, kind, chapters: [{ title, paras: [metin] }] } olarak saklanır.
// S.texts yalnızca listeyi tutar: { id, title, kind, chars, chapters, at }
const IDB = (() => {
  let dbp;
  const open = () => dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open('megumi', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('texts', { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const run = (mode, fn) => open().then(db => new Promise((res, rej) => {
    const tx = db.transaction('texts', mode), req = fn(tx.objectStore('texts'));
    tx.oncomplete = () => res(req.result);
    tx.onerror = () => rej(tx.error);
  }));
  return {
    get: id => run('readonly', s => s.get(id)), all: () => run('readonly', s => s.getAll()),
    put: rec => run('readwrite', s => s.put(rec)), del: id => run('readwrite', s => s.delete(id)),
  };
})();
const JP_RE = /[぀-ヿ一-龯]/;
// Paragrafları en fazla `per` paragraflık bölümlere ayır
function chunkChapters(paras, per = 40, titleOf = i => `${i + 1}`) {
  const out = [];
  for (let i = 0; i < paras.length; i += per) out.push({ title: titleOf(out.length), paras: paras.slice(i, i + per) });
  return out;
}
async function saveText(title, kind, chapters) {
  const id = 't' + uid();
  await IDB.put({ id, title, kind, chapters });
  navigator.storage?.persist?.().catch(() => {});
  const chars = chapters.reduce((n, c) => n + c.paras.join('').length, 0);
  S.texts.unshift({ id, title, kind, chars, chapters: chapters.length, at: Date.now() });
  save();
  return id;
}
// Eski sürümde metin doğrudan S.texts içinde (text alanı) saklanıyordu; IndexedDB'ye taşı
(async () => {
  let moved = false;
  for (const t of S.texts) {
    if (typeof t.text !== 'string') continue;
    const chapters = chunkChapters(t.text.split(/\n+/).map(p => p.trim()).filter(Boolean));
    await IDB.put({ id: t.id, title: t.title, kind: 'paste', chapters });
    Object.assign(t, { kind: 'paste', chars: t.text.length, chapters: chapters.length });
    delete t.text;
    moved = true;
  }
  // Kitapların asıl kaynağı IndexedDB: listede eksik kalan bir kayıt varsa listeye geri ekle
  const known = new Set(S.texts.map(t => t.id));
  for (const rec of await IDB.all()) {
    if (known.has(rec.id)) continue;
    const chars = rec.chapters.reduce((n, c) => n + c.paras.join('').length, 0);
    S.texts.push({ id: rec.id, title: rec.title, kind: rec.kind, chars, chapters: rec.chapters.length, at: 0 });
    moved = true;
  }
  if (moved) { save(); render(); }
})().catch(() => {});
// Tarayıcıda başka bir sekme ilerlemeyi değiştirirse eski kopyayla üzerine yazmamak için güncel kaydı al
window.addEventListener('storage', e => {
  if (e.key !== STORE || !e.newValue) return;
  try { S = withDefaults(JSON.parse(e.newValue)); render(); } catch {}
});

// EPUB: ZIP'i aç, container.xml → OPF → okuma sırası (spine) → her XHTML'den paragraflar (ruby okunuşları çıkarılır)
async function importEpub(file) {
  if (!window.fflate) await loadScript('vendor/fflate.js');
  const files = window.fflate.unzipSync(new Uint8Array(await file.arrayBuffer()));
  const dec = new TextDecoder();
  const read = p => files[p] ? dec.decode(files[p]) : null;
  if (read('META-INF/encryption.xml')?.includes('EncryptedData')) throw new Error(bi('Bu EPUB DRM korumalı; açılamıyor.', 'This EPUB is DRM-protected.'));
  const opfPath = /full-path="([^"]+)"/.exec(read('META-INF/container.xml') || '')?.[1];
  if (!opfPath || !read(opfPath)) throw new Error(bi('Geçerli bir EPUB dosyası değil.', 'Not a valid EPUB file.'));
  const xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const opf = xml(read(opfPath));
  const dir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
  const resolve = href => {
    const parts = (dir + decodeURIComponent(href.split('#')[0])).split('/'), out = [];
    for (const p of parts) p === '..' ? out.pop() : p !== '.' && out.push(p);
    return out.join('/');
  };
  const manifest = {};
  for (const it of opf.getElementsByTagNameNS('*', 'item')) manifest[it.getAttribute('id')] = it.getAttribute('href');
  const title = opf.getElementsByTagNameNS('*', 'title')[0]?.textContent.trim() || file.name.replace(/\.epub$/i, '');
  const chapters = [];
  for (const ref of opf.getElementsByTagNameNS('*', 'itemref')) {
    const href = manifest[ref.getAttribute('idref')];
    const html = href && read(resolve(href));
    if (!html) continue;
    let doc = new DOMParser().parseFromString(html, 'application/xhtml+xml');
    if (doc.getElementsByTagName('parsererror').length) doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('rt, rp, script, style').forEach(e => e.remove());
    const blocks = [...doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, div')].filter(el => !el.querySelector('p, div, li, h1, h2, h3, h4, h5, h6'));
    const paras = blocks.map(el => el.textContent.replace(/\s+/g, ' ').trim()).filter(t => JP_RE.test(t));
    if (!paras.length) continue;
    const head = doc.querySelector('h1, h2, h3')?.textContent.replace(/\s+/g, ' ').trim() || `${chapters.length + 1}`;
    // Çok uzun bölümleri parçalara ayır (her parça ayrı işlenir)
    const parts = chunkChapters(paras, 120);
    parts.forEach((p, i) => chapters.push({ title: parts.length > 1 ? `${head} (${i + 1}/${parts.length})` : head, paras: p.paras }));
  }
  if (!chapters.length) throw new Error(bi('EPUB içinde Japonca metin bulunamadı.', 'No Japanese text found in the EPUB.'));
  return { title, chapters };
}

// PDF: pdf.js ile sayfa sayfa metin; satırlar cümle sonu işaretlerine göre paragraflara birleştirilir
async function importPdf(file, progress) {
  const pdfjs = await import('./vendor/pdfjs/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.mjs';
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), cMapUrl: 'vendor/pdfjs/cmaps/', cMapPacked: true }).promise;
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const tc = await (await pdf.getPage(n)).getTextContent();
    const lines = [];
    let line = '';
    for (const it of tc.items) {
      line += it.str || '';
      if (it.hasEOL) { lines.push(line.trim()); line = ''; }
    }
    if (line.trim()) lines.push(line.trim());
    const paras = [];
    let cur = '';
    for (const l of lines) {
      if (!l) { if (cur) paras.push(cur), cur = ''; continue; }
      cur += l;
      if (/[。！？!?」』）)]$/.test(l)) { paras.push(cur); cur = ''; }
    }
    if (cur) paras.push(cur);
    pages.push(paras.filter(p => JP_RE.test(p)));
    if (n % 5 === 0) progress?.(n, pdf.numPages);
  }
  const per = 10, chapters = [];
  for (let i = 0; i < pages.length; i += per) {
    const paras = pages.slice(i, i + per).flat();
    if (paras.length) chapters.push({ title: `Sayfa ${i + 1}–${Math.min(i + per, pages.length)}`, paras });
  }
  if (!chapters.length) throw new Error(bi('PDF\'te seçilebilir Japonca metin yok (taranmış bir PDF olabilir; metin tanıma desteklenmiyor).', 'No selectable Japanese text in this PDF (it may be a scan).'));
  return { title: file.name.replace(/\.pdf$/i, ''), chapters };
}
async function importFile(file) {
  const kind = /\.epub$/i.test(file.name) || file.type === 'application/epub+zip' ? 'epub' : /\.pdf$/i.test(file.name) || file.type === 'application/pdf' ? 'pdf' : null;
  if (!kind) return toast(bi('Yalnızca EPUB ve PDF dosyaları desteklenir.', 'Only EPUB and PDF files are supported.'));
  ui.importMsg = bi(`${file.name} işleniyor…`, 'Processing…');
  render();
  try {
    const { title, chapters } = kind === 'epub' ? await importEpub(file)
      : await importPdf(file, (n, total) => { ui.importMsg = bi(`PDF işleniyor… sayfa ${n}/${total}`, `Processing PDF… page ${n}/${total}`); render(); });
    const id = await saveText(title, kind, chapters);
    ui.importMsg = null;
    ui.paste = false;
    A.openText({ id });
  } catch (e) {
    ui.importMsg = null;
    toast(e?.message?.includes('<span') ? e.message : bi('Dosya okunamadı: ', 'Could not read the file: ') + esc(e?.message || e));
  }
  render();
}

// Açık metnin bölümleri: IndexedDB'den yüklenir, yalnızca okunan bölüm kuromoji ile işlenir
const textCache = {};
const textPending = new Set();
function ensureText(id) {
  const r = ui.reader;
  const key = id + ':' + (textCache[id] ? r.ch : 'load');
  if (textPending.has(key)) return;
  const fail = () => { textPending.delete(key); ui.readerErr = bi('Metin yüklenemedi ya da işlenemedi.', 'Could not load or process the text.'); render(); };
  ui.readerErr = null;
  if (!textCache[id]) {
    textPending.add(key);
    IDB.get(id).then(rec => {
      textPending.delete(key);
      if (!rec) return fail();
      textCache[id] = rec.chapters.map(c => ({ title: c.title, raw: c.paras, paras: null }));
      render();
    }, fail);
    return;
  }
  const ch = textCache[id][r.ch];
  if (!ch || ch.paras) return;
  textPending.add(key);
  loadTokenizer().then(tok => { ch.paras = ch.raw.map(p => tokenizePara(tok, p)); textPending.delete(key); render(); }, fail);
}

function readerDoc() {
  const r = ui.reader;
  if (r.kind === 'story') { const s = STORIES.find(x => x.id === r.id); return { title: s.title, chapters: s.chapters }; }
  const t = S.texts.find(x => x.id === r.id);
  return { title: t?.title || '', chapters: textCache[r.id] || null };
}
const curParas = () => readerDoc().chapters[ui.reader.ch].paras;
const paraText = p => p.map(t => t[0]).join('');
const showFuri = (s, r) => r && S.settings.furi !== 'off' && (S.settings.furi === 'all' || [...s].some(c => KANJI_RE.test(c) && !S.srs['j:' + c]));
// Okunuşu yalnızca kanji kısmının üstüne koy: 食べ + たべ → 食(た)べ
function furiHtml(s, r) {
  const runs = s.match(/[一-龯々〆ヶ]+|[^一-龯々〆ヶ]+/g) || [s];
  if (runs.length > 1) {
    const re = new RegExp('^' + runs.map(x => KANJI_RE.test(x) ? '(.+?)' : '(' + kataToHira(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')').join('') + '$');
    const m = kataToHira(r).match(re);
    if (m) return runs.map((x, i) => KANJI_RE.test(x) ? `<ruby>${esc(x)}<rt>${m[i + 1]}</rt></ruby>` : esc(x)).join('');
  }
  return `<ruby>${esc(s)}<rt>${esc(r)}</rt></ruby>`;
}
function tokHtml(t, pi, ti) {
  const [s, r, , pos] = t;
  const inner = showFuri(s, r) ? furiHtml(s, r) : esc(s);
  if (pos === 's' || !s.trim()) return inner;
  const sel = ui.tok && ui.tok.pi === pi && ui.tok.ti === ti ? ' sel' : '';
  return `<span class="tk${sel}" data-a="tok" data-p="${pi}" data-i="${ti}">${inner}</span>`;
}

// Sesli okuma: paragraf paragraf, cümle cümle; okunan paragraf vurgulanır
let readToken = null;
function stopReading() {
  if (!readToken) return;
  readToken = null;
  ui.playing = null;
  stopSpeech();
  document.querySelectorAll('.reader-body .para.playing').forEach(el => el.classList.remove('playing'));
}
function markPlaying(i) {
  const els = document.querySelectorAll('.reader-body .para');
  els.forEach((el, k) => el.classList.toggle('playing', k === i));
  els[i]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
async function startReading(from) {
  stopReading();
  const token = {};
  readToken = token;
  ui.playing = from;
  await stopSpeech();
  const paras = curParas();
  for (let i = from; i < paras.length && readToken === token; i++) {
    ui.playing = i;
    markPlaying(i);
    for (const sentence of paraText(paras[i]).split(/(?<=[。！？!?])/)) {
      if (readToken !== token) return;
      if (sentence.trim()) await speakAsync(sentence);
    }
  }
  if (readToken === token) { readToken = null; ui.playing = null; render(); }
}

const LEVELS = { 1: ['Kolay', 'Easy'], 2: ['Orta', 'Intermediate'], 3: ['Zor', 'Advanced'] };
function renderRead() {
  const last = S.lastRead && (STORIES.find(s => s.id === S.lastRead) || S.texts.find(t => t.id === S.lastRead));
  return `<h1>${bi('Okuma', 'Reading')}</h1>
  <p class="muted">${bi('Kanjilerin üstünde okunuşu gör; bir kelimeye dokununca anlamı, okunuşu ve kanjileri açılır. ▶ ile metni sesli dinleyebilirsin.', 'Readings appear above kanji; tap a word for its meaning, reading and kanji. Use ▶ to listen.')}</p>
  ${last ? `<button class="card cta" data-a="${last.chapters ? 'openStory' : 'openText'}" data-id="${esc(last.id)}"><div><div class="eyebrow">${bi('Kaldığın yerden devam et', 'Continue reading')}</div><div class="jp big-title">${esc(last.title)}</div></div><span class="go">→</span></button>` : ''}
  <h2 class="sec">${bi('Kütüphane', 'Library')}</h2>
  ${STORIES.map(s => {
    const done = s.chapters.filter((_, i) => S.readDone[s.id + ':' + i]).length;
    return `<button class="story" data-a="openStory" data-id="${s.id}">
      <div class="row-between"><span class="jp st-title">${s.title}</span><span class="lvl l${s.level}">${biI(...LEVELS[s.level])}</span></div>
      <div class="st-sub">${s.tr[0]}<span class="en-i"> · ${s.en[0]}</span></div>
      <div class="muted small"><span class="jp">${s.author}</span> · ${s.authorR}</div>
      <p class="small st-desc">${s.tr[1]}</p><p class="en small">${s.en[1]}</p>
      <div class="row-between small muted"><span>${s.chapters.length} ${biI('bölüm', 'chapters')} · ${s.chars.toLocaleString('tr-TR')} ${biI('karakter', 'characters')}</span><span>${done}/${s.chapters.length}</span></div>
      <div class="bar"><i style="width:${done / s.chapters.length * 100}%"></i></div>
    </button>`;
  }).join('')}
  <p class="muted small">${bi('Metinler Aozora Bunko\'dan (青空文庫) alınmıştır; tamamı telifi dolmuş (kamu malı) eserlerdir.', 'Texts from Aozora Bunko; all are in the public domain.')}</p>
  <h2 class="sec">${bi('Kendi metinlerin ve kitapların', 'Your texts and books')}</h2>
  <p class="small">${bi('Okuduğun bir internet romanından (ör. Narō\'daki Re:Zero) bir bölüm yapıştır ya da bir EPUB / PDF kitap ekle. Hepsi yalnızca bu cihazın hafızasında saklanır ve işlenir, hiçbir yere gönderilmez.', 'Paste a chapter from a web novel you read (e.g. Re:Zero on Narou) or add an EPUB / PDF book. Everything is stored and processed only on this device.')}</p>
  <button class="btn" data-a="pasteOpen">＋ ${biI('Metin veya kitap ekle', 'Add text or book')}</button>
  <div style="margin-top:10px">${S.texts.map(t => {
    const icon = { epub: '📘', pdf: '📄' }[t.kind] || '📝';
    const done = t.chapters ? Array.from({ length: t.chapters }, (_, i) => S.readDone[t.id + ':' + i]).filter(Boolean).length : 0;
    return `<div class="text-row"><button class="tr-open" data-a="openText" data-id="${esc(t.id)}"><span class="jp">${icon} ${esc(t.title)}</span><span class="muted small">${(t.chars || 0).toLocaleString('tr-TR')} ${biI('karakter', 'characters')}${t.chapters ? ` · ${done}/${t.chapters} ${biI('bölüm', 'chapters')}` : ''}</span></button><button class="icon-btn" data-a="textDelete" data-id="${esc(t.id)}" aria-label="Sil / Delete">${IC.close}</button></div>`;
  }).join('')}</div>
  ${ui.paste ? renderPasteSheet() : ''}`;
}
function renderPasteSheet() {
  return `<div class="sheet-back" data-a="pasteClose"></div>
  <div class="sheet paste-sheet" role="dialog" aria-modal="true">
    <button class="icon-btn close" data-a="pasteClose" aria-label="Kapat / Close">${IC.close}</button>
    <h3>${bi('Kitap ekle (EPUB / PDF)', 'Add a book (EPUB / PDF)')}</h3>
    ${ui.importMsg
      ? `<div class="import-msg"><div class="spinner"></div><p>${ui.importMsg}</p></div>`
      : `<label class="btn ghost file-btn">📘📄 ${biI('Dosya seç', 'Choose file')}<input type="file" id="bookFile" accept=".epub,.pdf,application/epub+zip,application/pdf" hidden></label>
         <p class="muted small">${bi('DRM korumalı kitaplar ve taranmış (resim) PDF\'ler okunamaz. Dikey yazılmış PDF\'lerde satır sırası bazen karışabilir.', 'DRM-protected books and scanned PDFs cannot be read. Line order may be off in vertical-text PDFs.')}</p>`}
    <h3>${bi('Metin yapıştır', 'Paste text')}</h3>
    <input id="pasteTitle" class="input" maxlength="80" placeholder="Başlık / Title (ör. Re:Zero 1. bölüm)">
    <textarea id="pasteText" class="input jp" rows="7" placeholder="Japonca metni buraya yapıştır… / Paste Japanese text here…"></textarea>
    <p class="muted small">${bi('Telif hakkı olan metinleri yalnızca kişisel okuman için kullan, uygulama onları kimseyle paylaşmaz.', 'Use copyrighted texts only for your personal reading; the app never shares them.')}</p>
    <button class="btn" data-a="pasteSave">${biI('Kaydet ve oku', 'Save and read')}</button>
  </div>`;
}
function renderReader() {
  const r = ui.reader, d = readerDoc();
  const head = (sub, btn = '') => `<div class="flow-head reader-head"><button class="icon-btn" data-a="readerClose" aria-label="Kapat / Close">${IC.close}</button><div class="rh-title"><div class="jp">${esc(d.title)}</div><small class="muted">${sub}</small></div>${btn}</div>`;
  if (r.kind === 'text' && !ui.readerErr && !d.chapters?.[r.ch]?.paras) ensureText(r.id);
  if (!d.chapters?.[r.ch]?.paras) {
    return `<div class="flow reader">${head('')}<div class="flow-body center reader-loading">${ui.readerErr
      ? `<p>${ui.readerErr}</p>` : `<div class="spinner"></div><p>${bi('Metin işleniyor… İlk açılışta sözlük yüklendiği için birkaç saniye sürebilir.', 'Processing text… The first time takes a few seconds.')}</p>`}</div></div>`;
  }
  const ch = d.chapters[r.ch], last = r.ch === d.chapters.length - 1, playing = ui.playing != null;
  const chSelect = d.chapters.length > 3
    ? `<select class="ch-sel" data-chsel="1" aria-label="Bölüm / Chapter">${d.chapters.map((c, i) => `<option value="${i}" ${i === r.ch ? 'selected' : ''}>${i + 1}. ${esc(c.title).slice(0, 40)}</option>`).join('')}</select>` : '';
  const paras = ch.paras.map((p, pi) => `<p class="para${ui.playing === pi ? ' playing' : ''}"><button class="pplay" data-a="readFrom" data-p="${pi}" aria-label="Buradan dinle / Listen from here">▶</button>${p.map((t, ti) => tokHtml(t, pi, ti)).join('')}</p>`).join('');
  const furiSeg = [['all', 'Hepsi', 'All'], ['unknown', 'Bilmediklerim', 'Unknown'], ['off', 'Kapalı', 'Off']]
    .map(([v, tr, en]) => `<button class="${S.settings.furi === v ? 'on' : ''}" data-a="furi" data-v="${v}">${bi(tr, en)}</button>`).join('');
  return `<div class="flow reader">
    ${head(`${ch.title ? esc(ch.title) + ' · ' : ''}${r.ch + 1}/${d.chapters.length}`,
      `<button class="icon-btn ${playing ? 'on' : ''}" data-a="${playing ? 'readStop' : 'readFrom'}" data-p="0" aria-label="Dinle / Listen">${playing ? '■' : IC.speaker}</button>`)}
    <div class="reader-tools">
      <div class="seg seg3 mini">${furiSeg}</div>
      <button class="icon-btn sm" data-a="fontSize" data-d="-1" aria-label="Küçült">A−</button><button class="icon-btn sm" data-a="fontSize" data-d="1" aria-label="Büyüt">A+</button>
    </div>
    ${chSelect ? `<div class="reader-tools ch-row">${chSelect}</div>` : ''}
    <div class="flow-body reader-body jp" style="--rs:${S.settings.readSize}">${paras || `<p class="muted">${bi('Bu metinde Japonca paragraf bulunamadı.', 'No paragraphs found.')}</p>`}</div>
    <div class="flow-foot"><div class="btn-row">
      ${r.ch ? `<button class="btn ghost" data-a="readCh" data-d="-1">${biI('Önceki', 'Previous')}</button>` : ''}
      <button class="btn" data-a="readCh" data-d="1">${last ? biI('Bitirdim', 'Finished') : biI('Sonraki bölüm', 'Next chapter')}</button>
    </div></div>
  </div>${ui.write ? renderWriteSheet() : ui.sheet ? renderSheet() : ui.tok ? renderTokSheet() : ''}`;
}
function renderTokSheet() {
  const [s, r, base, pos] = curParas()[ui.tok.pi][ui.tok.ti], lemma = base || s;
  const own = ownWord(lemma, s);
  if (!dictIndex && !dictErr) loadDict().then(render, render);
  const rows = dictLookup(lemma, s, r);
  const reading = r || (KANJI_RE.test(s) ? '' : kataToHira(s));
  const kanji = uniq([...lemma].filter(c => KANJI_RE.test(c)));
  const meaning = own
    ? `<div class="meaning">${own.tr}<span class="en">${own.en}</span></div>`
    : rows.length
      ? rows.slice(0, 2).map(row => `<div class="dict-row"><span class="jp">${esc(row[0] ? `${row[0].split('|')[0]}【${row[1].split('|')[0]}】` : row[1].split('|')[0])}</span><div>${esc(row[2])}</div></div>`).join('')
        + `<p class="muted small">${bi('Türkçe karşılık henüz yok; anlam JMdict sözlüğünden (İngilizce).', 'Meaning from the JMdict dictionary.')}</p>`
      : `<p class="muted">${dictIndex ? bi('Sözlükte bulunamadı.', 'Not found in the dictionary.') : dictErr ? bi('Sözlük yüklenemedi.', 'Dictionary failed to load.') : bi('Sözlük yükleniyor…', 'Loading dictionary…')}</p>`;
  const inDeck = own && S.srs[own.id];
  return `<div class="sheet-back" data-a="tokClose"></div>
  <div class="sheet tok-sheet" role="dialog" aria-modal="true">
    <button class="icon-btn close" data-a="tokClose" aria-label="Kapat / Close">${IC.close}</button>
    <div class="jp tok-word">${r ? furiHtml(s, r) : esc(s)}</div>
    ${reading ? `<div class="reading"><span class="romaji">${kanaToRomaji(reading)}</span><span class="trt">TR: ${trRead(kanaToRomaji(reading))}</span></div>` : ''}
    <div class="tok-meta">${POS_TR[pos]?.[0] ? biI(...POS_TR[pos]) : ''}${base ? ` · ${biI('Sözlük biçimi', 'Dictionary form')}: <span class="jp">${esc(base)}</span>` : ''}</div>
    ${meaning}
    ${kanji.length ? `<div class="tok-kanji">${kanji.map(c => KJ[c]
      ? `<button class="kchip ${S.srs['j:' + c] ? 'known' : ''}" data-a="kanjiInfo" data-c="${c}"><span class="jp">${c}</span><small>${KJ[c].tr.split(';')[0]}</small></button>`
      : `<span class="kchip off"><span class="jp">${c}</span><small>${biI('listede yok', 'not in list')}</small></span>`).join('')}</div>` : ''}
    <div class="btn-row">
      <button class="btn ghost" data-a="speak" data-t="${esc(reading || s)}">${IC.speaker} ${biI('Dinle', 'Listen')}</button>
      <button class="btn" data-a="tokAdd" ${inDeck || (!own && !rows.length) ? 'disabled' : ''}>${inDeck ? biI('Destede', 'In deck') : biI('Desteme ekle', 'Add to deck')}</button>
    </div>
    <a class="jisho-link block" href="${JISHO_URL(lemma)}" target="_blank" rel="noopener">${biI('Jisho.org\'da ayrıntılı bak ↗', 'More on Jisho.org ↗')}</a>
  </div>`;
}

// ---------- Sözlük (çevrimdışı JMdict + kendi listemiz + Jisho.org) ----------
// Romaji → hiragana (arama için): "neko" → ねこ, "kyou" → きょう, "gakkou" → がっこう
const ROMA = {};
for (const it of Object.values(ITEMS)) if (it.kind === 'kana' && it.script === 'h') ROMA[it.r] ??= it.jp;
for (const b of 'きぎしじちにひびぴみり') for (const s of 'ゃゅょ') ROMA[kanaToRomaji(b + s)] = b + s;
Object.assign(ROMA, { o: 'お', wo: 'を', si: 'し', ti: 'ち', tu: 'つ', hu: 'ふ', zi: 'じ', di: 'ぢ', du: 'づ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ', tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ' });
function toKana(s) {
  s = s.toLowerCase().replace(/[āâ]/g, 'aa').replace(/[īî]/g, 'ii').replace(/[ūû]/g, 'uu').replace(/[ēê]/g, 'ee').replace(/[ōô]/g, 'ou');
  let out = '';
  for (let i = 0; i < s.length;) {
    if (s[i] === s[i + 1] && /[bcdfghjkmpqrstvwxyz]/.test(s[i])) { out += 'っ'; i++; continue; }
    if (s[i] === 'n' && (s[i + 1] === 'n' || s[i + 1] === "'" || !s[i + 1] || !/[aiueoy]/.test(s[i + 1]))) { out += 'ん'; i += s[i + 1] === 'n' || s[i + 1] === "'" ? 2 : 1; continue; }
    let hit = false;
    for (const len of [3, 2, 1]) {
      const k = ROMA[s.slice(i, i + len)];
      if (k) { out += k; i += len; hit = true; break; }
    }
    if (!hit) return null;
  }
  return out;
}
const JISHO_URL = q => 'https://jisho.org/search/' + encodeURIComponent(q);
// Jisho.org'un herkese açık arama arayüzü. Tarayıcılar CORS nedeniyle engeller; Android'de CapacitorHttp (yerel istek) kullanılır.
async function jishoSearch(q) {
  const url = 'https://jisho.org/api/v1/search/words?keyword=' + encodeURIComponent(q);
  const Http = window.capacitorExports?.CapacitorHttp;
  if (isNative && Http) {
    const r = await Http.get({ url, responseType: 'json', headers: { Accept: 'application/json' } });
    const data = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
    if (r.status !== 200) throw new Error('HTTP ' + r.status);
    return data.data || [];
  }
  const r = await fetch(url);
  return (await r.json()).data || [];
}
function dictSearch(raw) {
  const q = raw.trim();
  ui.dict = { q, own: [], jm: [], jisho: { status: q ? 'loading' : 'idle', items: [] } };
  if (!q) return;
  const isJp = JP_RE.test(q), kana = isJp ? null : toKana(q.replace(/\s+/g, ''));
  const lq = q.toLocaleLowerCase('tr');
  // Kendi listemiz (Türkçe anlamlar): yazılış, okunuş, romaji veya Türkçe/İngilizce anlamla eşleşme
  ui.dict.own = Object.values(ITEMS).filter(it => it.kind === 'word' && (
    it.jp === q || it.k === q || (kana && it.jp === kana) || it.r === lq ||
    (!isJp && (it.tr.toLocaleLowerCase('tr').split(/[,;/()]\s*/).some(w => w.trim() === lq || w.trim().startsWith(lq + ' ')) ||
      (it.en || '').toLowerCase().split(/[,;/]\s*/).some(w => w.replace(/^to /, '').trim() === lq.replace(/^to /, '')))))).slice(0, 12);
  const finishJm = () => {
    const rows = uniqBy([...dictLookup(q), ...(kana ? dictLookup(kana) : [])], r => r.join('\t'));
    if (!isJp && rows.length < 15) {
      const re = new RegExp('(^|[;,] ?)(to )?' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[;,( ])', 'i');
      for (const row of window.JMDICT) { if (re.test(row[2])) rows.push(row); if (rows.length >= 15) break; }
    }
    ui.dict.jm = uniqBy(rows, r => r.join('\t')).slice(0, 15);
    render();
  };
  if (dictIndex) finishJm(); else loadDict().then(finishJm, () => render());
  jishoSearch(q).then(items => { if (ui.dict?.q === q) { ui.dict.jisho = { status: 'ok', items: items.slice(0, 10) }; render(); } },
    () => { if (ui.dict?.q === q) { ui.dict.jisho = { status: isNative ? 'err' : 'web', items: [] }; render(); } });
}
// Sözlükten desteye kelime ekle (kendi listemizde yoksa özel kelime olarak; anlamı İngilizce)
function addWordToDeck(word, reading, gloss) {
  let it = ownWord(word, reading);
  if (!it) {
    const k = KANJI_RE.test(word) ? word : undefined, jp = kataToHira(reading || word);
    const id = 'c:' + (k || jp);
    S.custom[id] = { jp, k, tr: gloss, en: '' };
    registerCustom(id);
    it = ITEMS[id];
  }
  learn([it.id]);
  save();
  toast(bi(`"${it.k || it.jp}" tekrar destene eklendi.`, 'Added to your review deck.'));
}
const wordHead = (w, r) => w && r && w !== r && KANJI_RE.test(w) ? furiHtml(w, kataToHira(r)) : esc(w || r);
function renderDict() {
  const d = ui.dict;
  const addBtn = (w, r, g) => `<button class="icon-btn sm" data-a="dictAdd" data-w="${esc(w || r)}" data-r="${esc(r || '')}" data-g="${esc(g)}" aria-label="Desteme ekle / Add to deck">＋</button>`;
  const say = t => `<button class="icon-btn sm" data-a="speak" data-t="${esc(t)}" aria-label="Dinle / Listen">${IC.speaker}</button>`;
  const row = (head, sub, body, actions, tags = '') => `<div class="dres"><div class="dres-top"><span class="jp dres-w">${head}</span>${tags}<span class="dres-act">${actions}</span></div>${sub ? `<div class="romaji small">${sub}</div>` : ''}<div class="dres-g">${body}</div></div>`;
  let results = '';
  if (d?.q) {
    results += `<h2 class="sec">${bi('Megumi listesi', 'Megumi list')} <span class="muted small">(Türkçe)</span></h2>`
      + (d.own.length ? d.own.map(it => row(wordHead(it.k, it.jp), it.r, `${it.tr}<span class="en">${it.en}</span>`, say(it.jp) + (S.srs[it.id] ? '<span class="tag">✓</span>' : addBtn(it.k || it.jp, it.jp, it.tr)))).join('')
        : `<p class="muted small">${bi('Listemizde eşleşme yok.', 'No match in our list.')}</p>`);
    results += `<h2 class="sec">${bi('Çevrimdışı sözlük', 'Offline dictionary')} <span class="muted small">(JMdict)</span></h2>`
      + (!dictIndex ? `<p class="muted small">${dictErr ? bi('Sözlük yüklenemedi.', 'Dictionary failed to load.') : bi('Sözlük yükleniyor…', 'Loading dictionary…')}</p>`
        : d.jm.length ? d.jm.map(r => { const w = r[0].split('|')[0], k = r[1].split('|')[0]; return row(wordHead(w, k), kanaToRomaji(kataToHira(k)), esc(r[2]), say(k) + addBtn(w || k, k, r[2].split(';')[0]), r[3] ? `<span class="tag new">${biI('yaygın', 'common')}</span>` : ''); }).join('')
        : `<p class="muted small">${bi('Sonuç yok.', 'No results.')}</p>`);
    const j = d.jisho;
    results += `<h2 class="sec">Jisho.org <a class="small jisho-link" href="${JISHO_URL(d.q)}" target="_blank" rel="noopener">${biI('sitede aç ↗', 'open ↗')}</a></h2>`
      + (j.status === 'loading' ? `<p class="muted small">${bi('Jisho.org\'da aranıyor…', 'Searching Jisho.org…')}</p>`
        : j.status === 'web' ? `<p class="muted small">${bi('Tarayıcıda Jisho sonuçları doğrudan gösterilemiyor (CORS). Android uygulamasında burada görünür; şimdilik yukarıdaki bağlantıyla sitede açabilirsin.', 'Jisho results cannot be shown in the browser (CORS); they appear here in the Android app.')}</p>`
        : j.status === 'err' ? `<p class="muted small">${bi('Jisho.org\'a ulaşılamadı (internet bağlantını kontrol et).', 'Could not reach Jisho.org.')}</p>`
        : j.items.length ? j.items.map(e => {
          const jw = e.japanese[0] || {}, gloss = e.senses.slice(0, 3).map(s => s.english_definitions.join(', ')).join('; ');
          const pos = e.senses[0]?.parts_of_speech?.[0] || '';
          const tags = (e.is_common ? `<span class="tag new">${biI('yaygın', 'common')}</span>` : '') + (e.jlpt?.length ? `<span class="tag">${esc(e.jlpt[0].replace('jlpt-', '').toUpperCase())}</span>` : '');
          return row(wordHead(jw.word, jw.reading), (jw.reading ? kanaToRomaji(kataToHira(jw.reading)) : '') + (pos ? ` · ${esc(pos)}` : ''), esc(gloss), say(jw.reading || jw.word) + addBtn(jw.word || jw.reading, jw.reading, gloss.split(';')[0]), tags);
        }).join('') : `<p class="muted small">${bi('Sonuç yok.', 'No results.')}</p>`);
  }
  return `<h1>${bi('Sözlük', 'Dictionary')}</h1>
  <p class="muted">${bi('Japonca (かな / 漢字), romaji (ör. neko), İngilizce veya Türkçe ara.', 'Search in Japanese, romaji (e.g. neko), English or Turkish.')}</p>
  <div class="dict-search"><input id="dictQ" class="input" type="search" enterkeyhint="search" value="${esc(d?.q || '')}" placeholder="猫 · neko · cat · kedi" autocomplete="off"><button class="btn" data-a="dictSearch">${biI('Ara', 'Search')}</button></div>
  ${results}
  <p class="muted small" style="margin-top:16px">${bi('Çevrimdışı sözlük: JMdict (EDRDG, CC BY-SA 4.0). Çevrimiçi sonuçlar: Jisho.org.', 'Offline: JMdict (EDRDG, CC BY-SA 4.0). Online: Jisho.org.')}</p>`;
}

// ---------- Dinleme ----------
// Önce öğrenilmiş kelime/cümleler, sonra bilinen harflerle okunabilenler, en son tüm havuz
function listenWordPool() {
  const all = Object.values(ITEMS).filter(it => it.kind === 'word');
  const learned = all.filter(it => S.srs[it.id]), readable = all.filter(it => [...it.jp].every(c => c === 'ー' || S.srs['k:' + baseKana(c)]));
  return uniq([...shuffle(learned), ...shuffle(readable), ...shuffle(all)].map(it => it.id));
}
function listenSentPool() {
  const all = Object.values(ITEMS).filter(it => it.kind === 'sentence');
  const known = new Set(availableSentences().map(s => s.id));
  return uniq([...shuffle(all.filter(it => known.has(it.id) || S.srs[it.id])), ...shuffle(all)].map(it => it.id));
}
const sayOf = it => it.kana || it.jp;
const revealHtml = it => `<div class="reveal"><div class="jp ${it.kind === 'word' ? 'lg' : 'md'}">${it.kind === 'word' && it.k ? `<ruby>${it.k}<rt>${it.jp}</rt></ruby>` : it.jp}</div><div class="romaji">${it.r}</div><div class="meaning sm">${it.tr}<span class="en">${it.en}</span></div></div>`;
const listenControls = (q, answered) => `<div class="listen-box">
  <button class="play-big" data-a="qplay" aria-label="Dinle / Listen">${IC.speaker}</button>
  <button class="link-btn" data-a="qplay" data-slow="1">🐢 ${biI('Yavaş dinle', 'Slower')}</button>
  ${answered ? q.reveal : ''}</div>`;
function listenQuestion(id, mode) {
  const it = ITEMS[id];
  const others = shuffle(Object.values(ITEMS).filter(x => x.kind === it.kind && x.id !== id && x.tr !== it.tr));
  let opts, ask;
  if (mode === 'pick') {
    const near = uniqBy(others.filter(x => x.jp !== it.jp), x => x.jp)
      .sort((a, b) => Math.abs(a.jp.length - it.jp.length) - Math.abs(b.jp.length - it.jp.length)).slice(0, 3);
    opts = shuffle([it, ...near].map(x => ({ html: `<span class="jp opt-main">${x.jp}</span>`, ok: x === it })));
    ask = bi('Ne duydun?', 'What did you hear?');
  } else {
    opts = shuffle([it, ...uniqBy(others, x => x.tr).slice(0, 3)].map(x => ({ html: `<span class="opt-main">${x.tr}</span><span class="en">${x.en}</span>`, ok: x === it })));
    ask = it.kind === 'word' ? bi('Duyduğun kelimenin anlamı ne?', 'What does the word mean?') : bi('Duyduğun cümlenin anlamı ne?', 'What does the sentence mean?');
  }
  return { id, listen: true, speak: sayOf(it), ask, opts, reveal: revealHtml(it), remake: () => listenQuestion(id, mode) };
}
function dictationQuestion(id) {
  const it = ITEMS[id];
  return { ...spellQuestion(id, [], false), listen: true, speak: it.jp, reveal: revealHtml(it),
    ask: bi('Duyduğun kelimeyi harflerle yaz', 'Spell the word you hear'), remake: () => dictationQuestion(id) };
}
function startListen(mode) {
  const words = listenWordPool(), sents = listenSentPool();
  const qs = mode === 'word' ? words.slice(0, 10).map(id => listenQuestion(id, 'meaning'))
    : mode === 'sent' ? sents.slice(0, 8).map(id => listenQuestion(id, 'meaning'))
    : mode === 'pick' ? [...words.slice(0, 5), ...sents.slice(0, 4)].map(id => listenQuestion(id, 'pick'))
    : words.filter(id => [...ITEMS[id].jp].length <= 6).slice(0, 8).map(dictationQuestion);
  ui.flow = { uid: uid(), type: 'listen', mode };
  startQuiz(ui.flow, shuffle(qs));
}
function renderListen() {
  const card = (m, icon, tr, en, dtr, den) => `<button class="wtile" data-a="listenStart" data-m="${m}"><span class="wt-ic">${icon}</span><span class="wt-t">${bi(tr, en)}</span><span class="muted small">${bi(dtr, den)}</span></button>`;
  return `<h1>${bi('Dinleme', 'Listening')}</h1>
  <p class="muted">${bi('Japonca sesi dinle, anlamını ya da yazılışını bul. Önce öğrendiğin kelime ve cümleler sorulur; her soruyu istediğin kadar ve yavaş da dinleyebilirsin.', 'Listen to Japanese and find the meaning or spelling. Items you have learned come first; replay as often as you like, also slowly.')}</p>
  <div class="wgrid">
    ${card('word', '🎧', 'Kelime dinleme', 'Word listening', 'Duy, anlamını seç', 'Hear it, pick the meaning')}
    ${card('dict', '✍️', 'Dikte', 'Dictation', 'Duy, harflerle yaz', 'Hear it, spell it')}
    ${card('sent', '💬', 'Cümle dinleme', 'Sentence listening', 'Duy, çevirisini seç', 'Hear it, pick the translation')}
    ${card('pick', '👂', 'Ne duydun?', 'What did you hear?', 'Duy, doğru yazılışı seç', 'Hear it, pick the text')}
  </div>
  <section class="card"><div class="eyebrow">${bi('Hikâye dinle', 'Listen to stories')}</div>
    <p>${bi('Okuma sekmesindeki hikâyeleri ▶ düğmesiyle sesli dinleyebilir, dinlerken metni okunuşlarıyla takip edebilirsin.', 'Play the stories in the Reading tab with ▶ and follow the text with readings.')}</p>
    <button class="btn ghost" data-a="openStory" data-id="tebukuro">🦊 <span class="jp">手袋を買いに</span> · ${biI('dinle', 'listen')}</button></section>
  <p class="muted small">${bi('Konuşma hızını Profil ▸ Ayarlar\'dan değiştirebilirsin.', 'Change the speech rate in Profile ▸ Settings.')}</p>`;
}

function renderLessons() {
  return `<h1>${bi('Dersler', 'Lessons')}</h1>
  <p class="muted">${bi('Bir dersi bitirdiğinde kartları tekrar destene eklenir.', 'Finished lessons add their cards to your review deck.')}</p>
  ${UNITS.map(([u, tr, en]) => {
    const ls = LESSONS.filter(l => l.unit === u), d = ls.filter(l => S.done[l.id]).length;
    return `<h2 class="sec">${u}. ${bi(tr, en)} <span class="muted small">(${d}/${ls.length})</span></h2>${ls.map(lessonCard).join('')}`;
  }).join('')}`;
}

function renderReview() {
  const due = dueIds(), learned = learnedIds();
  const boxes = [1, 2, 3, 4, 5, 6].map(b => learned.filter(id => S.srs[id].box === b).length);
  const max = Math.max(1, ...boxes);
  const nextDue = learned.map(id => S.srs[id].due).filter(d => d > Date.now()).sort((a, b) => a - b)[0];
  const canWrite = learned.some(writable);
  return `<h1>${bi('Tekrar', 'Review')}</h1>
  <p class="muted">${bi('Aralıklı tekrar: bildiğin kartlar giderek daha seyrek karşına çıkar.', 'Spaced repetition: cards you know come back less and less often.')}</p>
  ${due.length
    ? `<button class="card cta" data-a="startReview"><div><div class="eyebrow">${bi('Tekrar zamanı', 'Time to review')}</div><div class="big">${due.length}</div><div>${bi('kart seni bekliyor', 'cards waiting')}</div></div><span class="go">→</span></button>`
    : `<section class="card center"><div class="confetti">✅</div><strong>${bi('Şu an tekrar edilecek kart yok', 'Nothing due right now')}</strong>${nextDue ? `<p class="muted">${biI('Sıradaki', 'Next')}: ${fmtWhen(nextDue)}</p>` : ''}</section>`}
  ${canWrite ? `<button class="btn" data-a="reviewWrite">${IC.pen} ${biI('Yazarak tekrar', 'Review by writing')}</button>` : ''}
  ${learned.length
    ? `<button class="btn ghost" data-a="practice">${biI('Serbest pratik', 'Free practice')}</button>`
    : `<p class="muted center">${bi('Önce bir ders tamamla.', 'Complete a lesson first.')}</p>`}
  <h2 class="sec">${bi('Kutular', 'Boxes')}</h2>
  <div class="boxes">${boxes.map((n, i) => `<div class="boxcol"><div class="boxbar"><i style="height:${n / max * 100}%"></i></div><b>${n}</b><small>${i + 1}</small></div>`).join('')}</div>
  <p class="muted small center">${bi('1 = yeni · 6 = ustalaşıldı', '1 = new · 6 = mastered')}</p>`;
}

function renderProfile() {
  const learned = learnedIds(), mastered = learned.filter(id => S.srs[id].box >= 4).length, done = Object.keys(S.done).length;
  const stat = (v, tr, en) => `<div class="stat"><b>${v}</b><span>${bi(tr, en)}</span></div>`;
  const tg = (k, tr, en) => `<label class="setting"><span>${bi(tr, en)}</span><input type="checkbox" class="switch" data-set="${k}" ${S.settings[k] ? 'checked' : ''}></label>`;
  const sel = (k, tr, en, vals, unit) => `<label class="setting"><span>${bi(tr, en)}</span><select data-set="${k}">${vals.map(v => `<option value="${v}" ${v === S.settings[k] ? 'selected' : ''}>${v} ${unit}</option>`).join('')}</select></label>`;
  return `<h1>${bi('Profil', 'Profile')}</h1>
  <div class="grid2">
    ${stat(S.xp, 'Toplam XP', 'Total XP')}${stat(streakNow(), 'Günlük seri', 'Day streak')}
    ${stat(learned.length, 'Öğrenilen kart', 'Cards learned')}${stat(mastered, 'Ustalaşılan', 'Mastered')}
  </div>
  <p class="muted" style="margin-top:10px">${done} / ${LESSONS.length} ${biI('ders tamamlandı', 'lessons done')} · ${KANJI.filter(k => S.srs['j:' + k.c]).length} kanji</p>
  <h2 class="sec">${bi('Ayarlar', 'Settings')}</h2>
  <div class="card list">
    ${tg('en', 'İngilizce açıklamaları göster', 'Show English explanations')}
    ${tg('romaji', 'Romaji göster', 'Show romaji')}
    ${tg('trt', 'Türkçe okunuşu göster (şi, çi, ci…)', 'Show Turkish-style spelling')}
    ${tg('lessonWrite', 'Kana derslerinde yazma adımı', 'Writing step in kana lessons')}
    ${tg('afterWords', 'Egzersiz sonrası kelime ezberi', 'Word drill after each exercise')}
    ${sel('kanjiPerDay', 'Günlük kanji', 'Kanji per day', [1, 2, 3, 5], '')}
    ${sel('sentencesPerDay', 'Günlük cümle', 'Sentences per day', [1, 2, 3, 5], '')}
    ${sel('goal', 'Günlük hedef', 'Daily goal', [10, 20, 30, 50, 80], 'XP')}
    <label class="setting"><span>${bi('Konuşma hızı', 'Speech rate')}</span><input type="range" min="0.5" max="1.2" step="0.05" value="${S.settings.rate}" data-set="rate"></label>
  </div>
  <button class="btn ghost" data-a="speak" data-t="こんにちは。めぐみです。">${IC.speaker} ${biI('Sesi dene', 'Test voice')}</button>
  <h2 class="sec">${bi('Yedek', 'Backup')}</h2>
  <p class="muted small">${bi('İlerlemen yalnızca bu cihazda saklanır. Uygulamayı silmeden ya da telefon değiştirmeden önce yedeğini al. Eklediğin kitaplar ve metinler yedeğe dahil değildir; dosyalarını ayrıca sakla.', 'Progress is stored only on this device. Back it up before uninstalling or switching phones. Added books and texts are not included in the backup.')}</p>
  <div class="btn-row">
    <button class="btn ghost" data-a="backupExport">${biI('Yedeği kopyala', 'Copy backup')}</button>
    <button class="btn ghost" data-a="backupImport">${biI('Yedeği yükle', 'Restore backup')}</button>
  </div>
  <button class="btn danger" data-a="reset">${biI('İlerlemeyi sıfırla', 'Reset progress')}</button>
  <p class="muted small center" style="margin-top:18px">Megumi Language ${APP_VERSION} · ${biI('Megumi Projesi', 'Megumi Project')}<br>${bi('Çizgi sırası: KanjiVG (CC BY-SA 3.0) · Sözlük: JMdict/KANJIDIC2, EDRDG (CC BY-SA 4.0) · Metin işleme: kuromoji (Apache-2.0) · Hikâyeler: Aozora Bunko (kamu malı)', 'Stroke order: KanjiVG (CC BY-SA 3.0) · Dictionary: JMdict/KANJIDIC2, EDRDG (CC BY-SA 4.0) · Tokenizer: kuromoji (Apache-2.0) · Stories: Aozora Bunko (public domain)')}</p>`;
}

function studyCard(it, revealed) {
  if (it.kind === 'kanji') {
    return `<div class="study"><div class="jp xl">${it.jp}</div>${speakBtn(it.say)}${revealed ? kanjiDetail(it.k) : ''}</div>`;
  }
  const tip = tipFor(it);
  const size = { kana: 'xl', word: 'lg', sentence: 'md' }[it.kind];
  return `<div class="study">
    ${it.k ? `<div class="kanji jp">${it.k}</div>` : ''}
    <div class="jp ${size}">${it.jp}</div>
    ${speakBtn(it.jp)}
    ${revealed ? `
      <div class="reading">${it.kind === 'kana' ? `<span class="romaji-big">${it.r}</span>` : `<span class="romaji">${it.r}</span>`}<span class="trt">TR: ${trRead(it.r)}</span></div>
      ${it.kind !== 'kana' ? `<div class="meaning">${it.tr}<span class="en">${it.en}</span></div>` : ''}
      ${tip ? `<div class="note"><p>${tip[0]}</p><p class="en">${tip[1]}</p></div>` : ''}` : ''}
  </div>`;
}

// Yazma adımlarında ne yazılacağını gösteren üst bilgi
function writePrompt(it, showChar) {
  if (it.kind === 'kana') {
    return `<div class="wprompt">${showChar ? `<span class="jp wp-char">${it.jp}</span>` : ''}<span class="romaji-big">${it.r}</span><span class="trt">TR: ${trRead(it.r)}</span><span class="muted small">${it.script === 'h' ? 'Hiragana' : 'Katakana'}</span></div>`;
  }
  const k = it.k;
  return `<div class="wprompt">${showChar ? `<span class="jp wp-char">${it.jp}</span>` : ''}<span class="meaning sm">${k.tr}<span class="en">${k.en}</span></span><span class="jp muted small">${[...k.on, ...k.kun].join('・')}</span></div>`;
}

function renderFlow() {
  const f = ui.flow;
  if (f.phase === 'done') return renderDone();
  let pct = 0, body = '', foot = '';

  if (f.phase === 'learn') {
    const it = ITEMS[f.ids[f.i]];
    pct = f.i / f.ids.length * 33;
    body = `<div class="eyebrow center">${biI('Yeni kart', 'New card')} · ${f.i + 1}/${f.ids.length}</div>${studyCard(it, true)}`;
    const last = f.i === f.ids.length - 1;
    const nextLabel = !last ? biI('İleri', 'Next') : f.l.type === 'kana' && S.settings.lessonWrite ? biI('Yazmaya geç', 'Start writing') : biI('Teste geç', 'Start quiz');
    foot = `<div class="btn-row">${f.i ? `<button class="btn ghost" data-a="prev">${biI('Geri', 'Back')}</button>` : ''}<button class="btn" data-a="next">${nextLabel}</button></div>`;
  } else if (f.phase === 'lwrite') {
    const it = ITEMS[f.ids[f.wi]];
    pct = 33 + f.wi / f.ids.length * 33;
    body = `<div class="ask">${bi('Üzerinden geçerek yaz', 'Trace the character')} <span class="muted small">${f.wi + 1}/${f.ids.length}</span></div>
      ${writePrompt(it, false)}${padBlock(`${f.uid}-lw-${f.wi}`, it.jp, 'trace')}`;
    foot = pad.finished
      ? `<button class="btn" data-a="padNext">${biI('İleri', 'Next')}</button>`
      : `${padControls()}<button class="link-btn" data-a="skipWrite">${biI('Yazmayı atla', 'Skip writing')}</button>`;
  } else if (f.phase === 'steps') {
    const st = f.steps[f.i], it = ITEMS['j:' + st.c], n = f.chars.indexOf(st.c) + 1;
    pct = f.i / f.steps.length * 60;
    const head = (tr, en) => `<div class="eyebrow center">${biI('Kanji', 'Kanji')} ${n}/${f.chars.length}</div><div class="ask center">${bi(tr, en)}</div>`;
    const next = `<button class="btn" data-a="stepNext">${biI('İleri', 'Next')}</button>`;
    if (st.k === 'info') {
      body = `<div class="eyebrow center">${biI('Yeni kanji', 'New kanji')} · ${n}/${f.chars.length}</div>${studyCard(it, true)}`;
      foot = next;
    } else if (st.k === 'watch') {
      body = head('Çizgi sırasını izle', 'Watch the stroke order') + padBlock(`${f.uid}-${f.i}`, st.c, 'watch');
      foot = watchControls(`<button class="btn" data-a="stepNext">${biI('Yazmaya geç', 'Start writing')}</button>`);
    } else {
      const memory = st.k === 'memory';
      body = head(memory ? 'Şimdi ezbere yaz' : 'Üzerinden geçerek yaz', memory ? 'Now write it from memory' : 'Trace over the guide')
        + writePrompt(it, false) + padBlock(`${f.uid}-${f.i}`, st.c, st.k);
      foot = pad.finished ? next : padControls();
    }
  } else if (f.phase === 'write') {
    const it = ITEMS[f.ids[f.i]];
    pct = f.i / f.ids.length * 100;
    body = `<div class="ask">${bi('Ezbere yaz', 'Write from memory')} <span class="muted small">${f.i + 1}/${f.ids.length}</span></div>
      ${writePrompt(it, false)}${padBlock(`${f.uid}-w-${f.i}`, it.jp, 'memory')}`;
    foot = pad.finished ? `<button class="btn" data-a="padNext">${biI('İleri', 'Next')}</button>` : padControls();
  } else if (f.phase === 'read') {
    const g = GRAMMAR[f.l.id];
    body = `<h1 class="g-title">${bi(f.l.title[0], f.l.title[1])}</h1>
      ${g.sections.map(s => `<section class="card"><h3>${bi(s.h[0], s.h[1])}</h3><p>${s.p[0]}</p><p class="en">${s.p[1]}</p></section>`).join('')}
      ${g.table ? `<table class="gtable"><thead><tr><th>日本語</th><th>Türkçe</th><th class="en-col">English</th></tr></thead><tbody>${g.table.map(r => `<tr><td class="jp">${r[0]}</td><td>${r[1]}</td><td class="en-col">${r[2]}</td></tr>`).join('')}</tbody></table>` : ''}
      <h2 class="sec">${bi('Örnekler', 'Examples')}</h2>
      ${g.examples.map(ex => `<div class="example">${speakBtn(ex.jp)}<div><div class="jp md">${ex.jp}</div><div class="romaji">${ex.r}</div><div class="meaning sm">${ex.tr}<span class="en">${ex.en}</span></div></div></div>`).join('')}`;
    foot = `<button class="btn" data-a="startGQuiz">${biI('Alıştırmaya başla', 'Start practice')}</button>`;
  } else if (f.phase === 'seq') {
    const item = f.items[f.i], it = item.it, w = item.cells.filter(c => c.w).length;
    const doneCells = item.cells.filter((c, j) => c.w && j < f.ci).length;
    pct = (f.i + doneCells / w) / f.items.length * 100;
    let gi = 0;
    const row = item.parts.map(p => {
      const boxes = [...p.text].map(c => {
        const idx = gi++;
        if (!item.cells[idx].w) return `<span class="pc jp">${c}</span>`;
        const done = idx < f.ci || f.itemDone;
        return `<span class="bx jp ${done ? 'done' : idx === f.ci ? 'cur' : ''}">${done ? c : ''}</span>`;
      }).join('');
      return `<span class="part"><span class="bxs">${boxes}</span>${p.ruby ? `<small class="ruby jp">${p.ruby}</small>` : ''}</span>`;
    }).join('');
    const cell = item.cells[f.ci];
    body = `<div class="ask">${f.kind === 'word' ? bi('Kelimeyi yaz', 'Write the word') : bi('Cümleyi yaz', 'Write the sentence')} <span class="muted small">${f.i + 1}/${f.items.length}</span></div>
      <div class="prompt seq-prompt"><div class="meaning sm">${it.tr}<span class="en">${it.en}</span></div><div class="romaji">${it.r}</div>${speakBtn(it.jp)}</div>
      <div class="seq-row">${row}</div>
      ${f.itemDone
        ? `<div class="seq-done"><div class="jp md">${partsPreview(item.parts)}</div><div class="pad-ok">${f.mist ? bi(`Bitti — ${f.mist} hata`, `Done — ${f.mist} mistake(s)`) : bi('Kusursuz! ✨', 'Perfect! ✨')}</div></div>`
        : padBlock(`${f.uid}-${f.i}-${f.ci}-${f.guide ? 't' : 'm'}`, cell.c, f.guide ? 'trace' : 'memory', onCellDone)}`;
    foot = f.itemDone
      ? `<button class="btn" data-a="seqNext">${f.i < f.items.length - 1 ? biI('İleri', 'Next') : biI('Bitir', 'Finish')}</button>`
      : `<div class="btn-row"><button class="btn ghost" data-a="padHint">${biI('İpucu', 'Hint')}</button><button class="btn ghost" data-a="seqGuide">${f.guide ? biI('Rehberi gizle', 'Hide guide') : biI('Rehberi göster', 'Show guide')}</button></div>`;
  } else if (f.phase === 'wlearn') {
    const it = ITEMS[f.words[f.wi2]], last = f.wi2 === f.words.length - 1;
    const kanaHl = f.hl.filter(c => !KJ[c]);
    pct = f.wi2 / f.words.length * 40;
    body = (f.wi2 === 0 ? `<div class="card words-intro">
        <div class="eyebrow">${bi('Kelime zamanı', 'Word time')}</div>
        <p>${f.kanjiFirst ? bi('Bu kanjilerle kurulan kelimeleri öğren ve ezberle.', 'Learn and memorise words built with these kanji.')
          : bi('Bu egzersizdeki harflerle okuyabileceğin kelimeler! Yeni harfler renkli.', 'Words you can now read with these kana! New kana are highlighted.')}</p>
        ${kanaHl.length ? `<div class="jp hl-row">${kanaHl.map(c => `<span class="hl">${c}</span>`).join(' ')}</div>` : ''}
      </div>` : '')
      + `<div class="eyebrow center">${biI('Kelime', 'Word')} · ${f.wi2 + 1}/${f.words.length}</div>${wordCard(it, f.hl, f.kanjiFirst)}`;
    foot = `<div class="btn-row">${f.wi2 ? `<button class="btn ghost" data-a="wordPrev">${biI('Geri', 'Back')}</button>` : `<button class="btn ghost" data-a="wordsSkip">${biI('Atla', 'Skip')}</button>`}
      <button class="btn" data-a="${last ? 'wordsQuiz' : 'wordNext'}">${last ? biI('Ezberle', 'Memorise') : biI('İleri', 'Next')}</button></div>`;
  } else if (f.phase === 'quiz' && f.qs[f.qi].type === 'spell') {
    const q = f.qs[f.qi], answered = f.answered != null, picked = f.pick.map(i => q.tiles[i]);
    pct = 40 + f.qi / f.qs.length * 60;
    if (!f.main) pct = f.qi / f.qs.length * 100;
    body = `<div class="ask">${q.ask}</div>
      <div class="prompt">${q.listen ? listenControls(q, answered) : q.prompt + speakBtn(q.speak)}</div>
      <div class="slots ${answered ? f.answered : ''}">${q.target.map((_, i) => `<span class="slot jp">${picked[i] ?? ''}</span>`).join('')}</div>
      <div class="tiles">${q.tiles.map((t, i) => `<button class="tile jp" data-a="tile" data-i="${i}" ${answered || f.pick.includes(i) ? 'disabled' : ''}>${t}</button>`).join('')}</div>
      ${!answered && f.pick.length ? `<button class="link-btn" data-a="untile">⌫ ${biI('Son harfi sil', 'Delete last')}</button>` : ''}`;
    if (answered) {
      const ok = f.answered === 'ok', it = ITEMS[q.id];
      foot = `<div class="feedback ${ok ? 'ok' : 'bad'}"><strong>${ok ? biI('Doğru!', 'Correct!') : biI('Doğru yazılışı', 'Correct spelling')}</strong>
        <div class="fb-ans"><span class="jp opt-main">${it.jp}</span> <span class="romaji">${it.r}</span></div></div>
        <button class="btn" data-a="cont">${biI('Devam', 'Continue')}</button>`;
    }
  } else if (f.phase === 'quiz') {
    const q = f.qs[f.qi], answered = f.answered != null;
    const [base, span] = f.main ? [40, 60] : ({ lesson: [66, 34], grammar: [50, 50], kanji: [60, 40] }[f.type] || [0, 100]);
    pct = base + f.qi / f.qs.length * span;
    body = `<div class="ask">${q.ask}</div>
      <div class="prompt">${q.listen ? listenControls(q, answered) : q.prompt + (q.speak && (!q.after || answered) ? speakBtn(q.speak) : '')}</div>
      <div class="opts">${q.opts.map((o, i) => {
        const cls = answered ? (o.ok ? 'ok' : i === f.answered ? 'bad' : '') : '';
        return `<button class="opt ${cls}" data-a="answer" data-i="${i}" ${answered ? 'disabled' : ''}>${o.html}</button>`;
      }).join('')}</div>`;
    if (answered) {
      const ok = q.opts[f.answered].ok;
      foot = `<div class="feedback ${ok ? 'ok' : 'bad'}"><strong>${ok ? biI('Doğru!', 'Correct!') : biI('Doğru cevap', 'Correct answer')}</strong>${ok ? '' : `<div class="fb-ans">${q.opts.find(o => o.ok).html}</div>`}</div>
        <button class="btn" data-a="cont">${biI('Devam', 'Continue')}</button>`;
    }
  } else if (f.phase === 'review') {
    const id = f.queue[f.i], c = S.srs[id];
    pct = f.i / f.queue.length * 100;
    body = `<div class="eyebrow center">${biI('Tekrar', 'Review')} · ${f.queue.length - f.i}</div>${studyCard(ITEMS[id], f.revealed)}`;
    foot = f.revealed
      ? `<div class="grades">
          <button class="grade again" data-a="grade" data-g="0">${bi('Tekrar', 'Again')}<small>10 dk</small></button>
          <button class="grade hard" data-a="grade" data-g="1">${bi('Zor', 'Hard')}<small>${fmtDays(hardDays(c.box))}</small></button>
          <button class="grade good" data-a="grade" data-g="2">${bi('Bildim', 'Got it')}<small>${fmtDays(INTERVALS[Math.min(c.box + 1, 6)])}</small></button>
        </div>`
      : `<button class="btn" data-a="reveal">${biI('Cevabı göster', 'Show answer')}</button>`;
  }

  return `<div class="flow">
    <div class="flow-head"><button class="icon-btn" data-a="exit" aria-label="Çık / Exit">${IC.close}</button><div class="progress"><i style="width:${pct}%"></i></div></div>
    <div class="flow-body">${body}</div>
    <div class="flow-foot">${foot}</div>
  </div>`;
}

function renderDone() {
  const f = ui.flow;
  const isLesson = f.type === 'lesson' || f.type === 'grammar' || f.type === 'kanji';
  const title = {
    review: ['Tekrar tamamlandı!', 'Review complete!'], quiz: ['Test bitti!', 'Quiz finished!'],
    write: ['Yazma alıştırması bitti!', 'Writing practice done!'], kanji: ['Günün kanjileri tamam!', 'Today\'s kanji done!'],
    seq: f.kind === 'word' ? ['Kelime yazma bitti!', 'Word writing done!'] : f.daily ? ['Günün cümleleri tamam!', 'Today\'s sentences done!'] : ['Cümle yazma bitti!', 'Sentence writing done!'],
    listen: ['Dinleme tamamlandı!', 'Listening done!'],
  }[f.type] || ['Ders tamamlandı!', 'Lesson complete!'];
  const main = f.main || (f.qs ? { correct: f.correct, total: f.qs.length } : null);
  const score = f.type === 'write' ? `${f.perfect} / ${f.ids.length} ${biI('kusursuz', 'perfect')}`
    : f.type === 'seq' ? `${f.perfect} / ${f.items.length} ${biI('kusursuz', 'perfect')}`
    : main?.total ? `${main.correct} / ${main.total} ${biI('doğru', 'correct')}` : `${f.total} ${biI('kart', 'cards')}`;
  const wordsLine = f.words?.length && f.qs
    ? `<p class="muted">📚 ${f.words.length} ${biI('kelime', 'words')} · ${f.correct} / ${f.qs.length} ${biI('doğru', 'correct')}</p>` : '';
  const nl = f.type === 'lesson' || f.type === 'grammar' ? nextLesson() : null;
  return `<div class="flow done-screen">
    <div class="flow-body">
      <div class="confetti">${f.type === 'write' || f.type === 'kanji' || f.type === 'seq' ? '✍️' : f.type === 'listen' ? '🎧' : '🎉'}</div>
      <h1>${bi(title[0], title[1])}</h1>
      <p class="muted">${score}</p>
      ${wordsLine}
      <div class="xp-gain">+${f.xp} XP</div>
      ${isLesson || f.words?.length ? `<p>${bi('Kartlar ve kelimeler tekrar destene eklendi; yarın tekrar karşına çıkacaklar.', 'The cards and words were added to your review deck — see you tomorrow.')}</p>` : ''}
    </div>
    <div class="flow-foot">
      ${nl ? `<button class="btn" data-a="lesson" data-id="${nl.id}">${biI('Sıradaki ders', 'Next lesson')}</button>` : ''}
      <button class="btn ghost" data-a="exit">${biI('Ana sayfaya dön', 'Back home')}</button>
    </div>
  </div>`;
}

// Alt menü: Harfler = Kana + Kanji, Pratik = Yaz + Dinle (üstte sekme seçici)
const GROUPS = { chars: ['kana', 'kanji'], read: ['read', 'dict'], practice: ['write', 'listen'] };
const groupOf = tab => Object.keys(GROUPS).find(g => GROUPS[g].includes(tab)) || tab;
const lastInGroup = { chars: 'kana', read: 'read', practice: 'write' };
function renderNav() {
  const due = dueIds().length;
  const tabs = [['home', IC.home, 'Ana Sayfa', 'Home'], ['lessons', IC.book, 'Dersler', 'Lessons'], ['chars', IC.kana, 'Harfler', 'Letters'],
    ['read', IC.read, 'Oku', 'Read'], ['practice', IC.pen, 'Pratik', 'Practice'], ['review', IC.review, 'Tekrar', 'Review']];
  return `<nav class="tabbar">${tabs.map(([id, ic, tr, en]) =>
    `<button class="tab ${groupOf(ui.tab) === id ? 'on' : ''}" data-a="tab" data-id="${id}" aria-label="${tr} / ${en}">${ic}${id === 'review' && due ? `<b class="badge">${due}</b>` : ''}<span>${tr}</span></button>`).join('')}</nav>`;
}
function subTabs() {
  const g = groupOf(ui.tab);
  if (!GROUPS[g]) return '';
  const labels = { kana: ['Kana', 'Kana'], kanji: ['Kanji', 'Kanji'], read: ['Okuma', 'Reading'], dict: ['Sözlük', 'Dictionary'], write: ['Yazma', 'Writing'], listen: ['Dinleme', 'Listening'] };
  return `<div class="seg subtabs">${GROUPS[g].map(t => `<button class="${ui.tab === t ? 'on' : ''}" data-a="tab" data-id="${t}">${biI(...labels[t])}</button>`).join('')}</div>`;
}

const VIEWS = { home: renderHome, kana: renderKana, kanji: renderKanji, lessons: renderLessons, write: renderWrite, listen: renderListen, read: renderRead, dict: renderDict, review: renderReview, profile: renderProfile };

function render() {
  const b = document.body.classList;
  b.toggle('no-en', !S.settings.en);
  b.toggle('no-romaji', !S.settings.romaji);
  b.toggle('no-trt', !S.settings.trt);
  app.innerHTML = ui.flow
    ? renderFlow()
    : ui.reader
      ? renderReader()
      : `<main class="view">${subTabs()}${VIEWS[ui.tab]()}</main>${renderNav()}${ui.write ? renderWriteSheet() : ui.sheet ? renderSheet() : ''}`;
  const el = app.querySelector('.wpad');
  if (el && pad) mountPad(el);
  // Dinleme sorusu ilk gösterildiğinde sesi kendiliğinden çal
  const q = ui.flow?.phase === 'quiz' && ui.flow.answered == null && ui.flow.qs[ui.flow.qi];
  if (q?.listen && !q.played) { q.played = true; setTimeout(() => speak(q.speak), 300); }
}

// ---------- Eylemler ----------
const A = {
  tab: d => {
    const id = GROUPS[d.id] ? lastInGroup[d.id] : d.id;
    if (groupOf(id) !== id) lastInGroup[groupOf(id)] = id;
    ui.tab = id;
    ui.sheet = null;
    top();
  },
  // Okuma
  openStory: d => { stopReading(); ui.reader = { kind: 'story', id: d.id, ch: S.readPos[d.id] || 0 }; ui.tok = null; S.lastRead = d.id; save(); top(); },
  openText: d => { stopReading(); ui.reader = { kind: 'text', id: d.id, ch: S.readPos[d.id] || 0 }; ui.tok = null; S.lastRead = d.id; save(); ensureText(d.id); top(); },
  readerClose: () => { stopReading(); ui.reader = null; ui.tok = null; ui.sheet = null; ui.write = null; },
  readCh: d => {
    const r = ui.reader, n = readerDoc().chapters.length;
    stopReading();
    if (+d.d > 0) {
      const key = r.id + ':' + r.ch;
      if (!S.readDone[key]) { S.readDone[key] = true; addXP(5); }
      if (r.ch === n - 1) { toast(bi('Tebrikler, metni bitirdin! 🎉', 'Well done, you finished the text! 🎉')); ui.reader = null; save(); top(); return; }
    }
    r.ch = Math.max(0, Math.min(n - 1, r.ch + +d.d));
    S.readPos[r.id] = r.ch;
    ui.tok = null;
    save();
    top();
  },
  furi: d => { S.settings.furi = d.v; save(); },
  fontSize: d => { S.settings.readSize = Math.max(0, Math.min(5, S.settings.readSize + +d.d)); save(); },
  tok: d => { ui.tok = { pi: +d.p, ti: +d.i }; },
  tokClose: () => { ui.tok = null; },
  tokAdd: () => {
    const [s, r, base] = curParas()[ui.tok.pi][ui.tok.ti], lemma = base || s;
    let it = ownWord(lemma, s);
    if (!it) {
      const row = dictLookup(lemma, s, r)[0];
      if (!row) return false;
      const jp = row[1].split('|')[0], k = KANJI_RE.test(lemma) ? lemma : undefined;
      const id = 'c:' + (k || jp);
      S.custom[id] = { jp, k, tr: row[2].split(';')[0], en: '' };
      registerCustom(id);
      it = ITEMS[id];
    }
    learn([it.id]);
    save();
    toast(bi(`"${it.k || it.jp}" tekrar destene eklendi.`, 'Added to your review deck.'));
  },
  readFrom: d => { startReading(+d.p); },
  readStop: () => { stopReading(); },
  pasteOpen: () => { ui.paste = true; },
  pasteClose: () => { ui.paste = false; },
  pasteSave: () => {
    const text = document.getElementById('pasteText').value.trim();
    if (!JP_RE.test(text)) { toast(bi('Japonca bir metin yapıştır.', 'Please paste a Japanese text.')); return false; }
    const title = document.getElementById('pasteTitle').value.trim() || text.slice(0, 16) + '…';
    const chapters = chunkChapters(text.split(/\n+/).map(p => p.trim()).filter(Boolean));
    saveText(title, 'paste', chapters).then(id => { ui.paste = false; A.openText({ id }); render(); },
      () => toast(bi('Metin kaydedilemedi.', 'Could not save the text.')));
    return false;
  },
  textDelete: d => {
    if (!confirm('Bu metin silinsin mi?\nDelete this text?')) return false;
    S.texts = S.texts.filter(t => t.id !== d.id);
    for (const k of Object.keys(S.readDone)) if (k.startsWith(d.id + ':')) delete S.readDone[k];
    delete S.readPos[d.id];
    delete textCache[d.id];
    if (S.lastRead === d.id) S.lastRead = null;
    IDB.del(d.id).catch(() => {});
    save();
  },
  // Sözlük
  dictSearch: () => { dictSearch(document.getElementById('dictQ')?.value || ''); },
  dictAdd: d => { addWordToDeck(d.w, d.r, d.g); },
  // Dinleme
  listenStart: d => { startListen(d.m); top(); },
  qplay: d => { const f = ui.flow, q = f.qs[f.qi]; speak(q.speak, d.slow ? 0.7 : 1); return false; },
  kanaScript: d => { ui.kanaScript = d.s; },
  kana: d => { ui.sheet = d.id; },
  kanjiInfo: d => { ui.sheet = 'j:' + d.c; },
  closeSheet: () => { ui.sheet = null; },
  speak: d => { speak(d.t); return false; },
  writeOpen: d => { ui.write = d.ch; ui.writeMode = 'watch'; ui.writeNonce = uid(); },
  writeMode: d => { ui.writeMode = d.m; ui.writeNonce = uid(); },
  writeClose: () => { ui.write = null; },
  padHint: () => {
    const svg = app.querySelector('.wsvg');
    if (!pad || pad.finished || !svg) return false;
    pad.mistakes++;
    showHint(svg);
    return false;
  },
  padReset: () => { if (pad) Object.assign(pad, { done: 0, misses: 0, mistakes: 0, finished: false }); },
  padNext: () => {
    const f = ui.flow;
    if (f.phase === 'write') {
      const id = f.ids[f.i], m = pad.mistakes, grade = m === 0 ? 2 : m <= 2 ? 1 : 0;
      if (S.srs[id]) schedule(id, grade);
      if (!m) f.perfect++;
      f.xp += m ? 1 : 3;
      if (++f.i >= f.ids.length) finish();
    } else if (f.phase === 'lwrite') {
      if (++f.wi >= f.ids.length) startQuiz(f, sample(f.ids, 15).map(makeQuestion));
    }
    top();
  },
  skipWrite: () => { startQuiz(ui.flow, sample(ui.flow.ids, 15).map(makeQuestion)); top(); },
  stepNext: () => {
    const f = ui.flow;
    if (++f.i >= f.steps.length) kanjiQuiz(f);
    top();
  },
  lesson: d => { startLesson(d.id); top(); },
  next: () => {
    const f = ui.flow;
    if (f.i < f.ids.length - 1) f.i++;
    else if (f.l.type === 'kana' && S.settings.lessonWrite) { f.phase = 'lwrite'; f.wi = 0; }
    else startQuiz(f, sample(f.ids, 15).map(makeQuestion));
    top();
  },
  prev: () => { ui.flow.i--; top(); },
  startGQuiz: () => { startQuiz(ui.flow, grammarQuestions(ui.flow.l)); top(); },
  answer: d => {
    const f = ui.flow;
    if (f.answered != null) return false;
    const i = +d.i, q = f.qs[f.qi];
    f.answered = i;
    if (q.opts[i].ok) f.correct++;
    else if (q.id && !q.retry) f.qs.push({ ...(q.remake ? q.remake() : makeQuestion(q.id)), retry: true }); // yanlışı sona ekle
  },
  wordNext: () => { ui.flow.wi2++; top(); },
  wordPrev: () => { ui.flow.wi2--; top(); },
  wordsQuiz: () => { startQuiz(ui.flow, wordQuestions(ui.flow)); top(); },
  wordsSkip: () => { ui.flow.words = []; finish(); top(); },
  tile: d => {
    const f = ui.flow, q = f.qs[f.qi], i = +d.i;
    if (f.answered != null || f.pick.includes(i)) return false;
    f.pick.push(i);
    if (f.pick.length < q.target.length) return;
    const ok = f.pick.map(j => q.tiles[j]).join('') === q.target.join('');
    f.answered = ok ? 'ok' : 'bad';
    if (ok) f.correct++;
    else if (!q.retry) f.qs.push({ ...(q.remake ? q.remake() : spellQuestion(q.id, f.hl, f.kanjiFirst)), retry: true });
  },
  untile: () => { ui.flow.pick.pop(); },
  cont: () => {
    const f = ui.flow;
    f.qi++;
    f.answered = null;
    f.pick = [];
    if (f.qi >= f.qs.length) finish();
    top();
  },
  startReview: () => {
    const queue = dueIds().slice(0, 30);
    if (!queue.length) return;
    ui.flow = { uid: uid(), type: 'review', phase: 'review', queue, i: 0, revealed: false, xp: 0, total: queue.length };
    top();
  },
  reveal: () => { ui.flow.revealed = true; },
  grade: d => {
    const f = ui.flow, g = +d.g, id = f.queue[f.i];
    schedule(id, g);
    if (g === 0) f.queue.push(id); else f.xp += g;
    f.i++;
    f.revealed = false;
    if (f.i >= f.queue.length) finish();
    top();
  },
  practice: () => { startPractice(learnedIds()); top(); },
  kanaTest: d => { startPractice(Object.values(ITEMS).filter(i => i.kind === 'kana' && i.script === d.s).map(i => i.id)); top(); },
  seqGuide: () => { ui.flow.guide = !ui.flow.guide; },
  seqNext: () => {
    const f = ui.flow, item = f.items[f.i], perfect = f.mist === 0;
    if (item.kind === 'word' && S.srs[item.id]) schedule(item.id, perfect ? 2 : f.mist <= 2 ? 1 : 0);
    if (item.kind === 'sentence') S.sp[item.id] = (S.sp[item.id] || 0) + 1;
    if (perfect) f.perfect++;
    f.xp += item.kind === 'sentence' ? (perfect ? 6 : 3) : (perfect ? 3 : 1);
    Object.assign(f, { i: f.i + 1, mist: 0, itemDone: false });
    if (f.i < f.items.length) f.ci = firstCell(f.items[f.i]);
    else {
      if (f.daily) S.ds.done = true;
      save();
      addXP(f.xp);
      f.phase = 'done';
    }
    top();
  },
  wordWrite: () => { startSeq('word', pickWriteWords()); top(); },
  sentWrite: () => { startSeq('sentence', sample(availableSentences(), 3)); top(); },
  sentDaily: () => { startSeq('sentence', todaysSentences().ids.map(sentById), true); top(); },
  sentOne: d => { startSeq('sentence', [sentById(d.id)]); top(); },
  kanaWrite: d => {
    const all = Object.values(ITEMS).filter(i => i.kind === 'kana' && (!d.s || i.script === d.s)).map(i => i.id);
    const known = all.filter(id => S.srs[id]);
    startWrite(known.length ? known : all.slice(0, 10)); // henüz öğrenilmediyse ilk satırlarla başla
    top();
  },
  kanjiStart: () => { startKanji(todaysKanji().chars.filter(c => !S.srs['j:' + c])); top(); },
  kanjiExtra: () => {
    const kd = todaysKanji();
    startKanji(unlearnedKanji().filter(c => kd.done || !kd.chars.includes(c)).slice(0, S.settings.kanjiPerDay));
    top();
  },
  kanjiWrite: () => { startWrite(KANJI.map(k => 'j:' + k.c).filter(id => S.srs[id])); top(); },
  reviewWrite: () => {
    const due = dueIds().filter(writable);
    startWrite(due.length ? due : learnedIds().filter(writable));
    top();
  },
  exit: () => { ui.flow = null; top(); },
  backupExport: () => {
    const json = JSON.stringify(S);
    const fallback = () => prompt('Bu metni kopyalayıp güvenli bir yere kaydet:\nCopy and keep this text:', json);
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(json).then(() => toast(bi('Yedek panoya kopyalandı. Notlar uygulaması gibi bir yere yapıştırıp sakla.', 'Backup copied — paste it somewhere safe.')), fallback);
    else fallback();
    return false;
  },
  backupImport: () => {
    const txt = prompt('Yedek metnini buraya yapıştır:\nPaste your backup here:');
    if (!txt) return false;
    try {
      const s = JSON.parse(txt);
      if (!s || typeof s.srs !== 'object') throw new Error('bad');
      if (!confirm('Mevcut ilerlemenin yerine bu yedek yüklensin mi?\nReplace current progress with this backup?')) return false;
      S = withDefaults(s);
      save();
      toast(bi('Yedek yüklendi.', 'Backup restored.'));
    } catch {
      toast(bi('Bu metin geçerli bir Megumi Language yedeği değil.', 'That is not a valid Megumi Language backup.'));
      return false;
    }
  },
  reset: () => {
    if (!confirm('Tüm ilerleme silinsin mi?\nReset all progress?')) return false;
    S = JSON.parse(JSON.stringify(DEFAULTS));
    save();
  },
};

app.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled || !A[el.dataset.a]) return;
  if (A[el.dataset.a](el.dataset, el) !== false) render();
});
app.addEventListener('change', e => {
  if (e.target.id === 'bookFile' && e.target.files[0]) return importFile(e.target.files[0]);
  if (e.target.dataset.chsel) {
    stopReading();
    ui.reader.ch = +e.target.value;
    S.readPos[ui.reader.id] = ui.reader.ch;
    ui.tok = null;
    save();
    render();
    return top();
  }
  const k = e.target.dataset.set;
  if (!k) return;
  S.settings[k] = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
  save();
  render();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'dictQ') { e.preventDefault(); dictSearch(e.target.value); render(); return; }
  if (e.key !== 'Escape') return;
  if (ui.write) ui.write = null; else if (ui.sheet) ui.sheet = null; else if (ui.tok) ui.tok = null; else if (ui.paste) ui.paste = false; else return;
  render();
});

// Android geri tuşu: önce açık paneli/dersi kapat, sonra ana sayfaya dön, en son uygulamadan çık
if (isNative) {
  const AppPlugin = registerPlugin('App');
  AppPlugin.addListener('backButton', () => {
    if (ui.write) ui.write = null;
    else if (ui.sheet) ui.sheet = null;
    else if (ui.tok) ui.tok = null;
    else if (ui.paste) ui.paste = false;
    else if (ui.reader) { stopReading(); ui.reader = null; }
    else if (ui.flow) ui.flow = null;
    else if (ui.tab !== 'home') ui.tab = 'home';
    else return AppPlugin.exitApp();
    render();
    top();
  });
}

render();
})();
