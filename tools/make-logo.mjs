// Uygulama simgesi: "め" (Megumi Language) harfi, KanjiVG çizgileriyle beyaz kalın fırça izi.
// assets/logo.svg ve assets/logo.png (1024×1024, şeffaf) üretir; @capacitor/assets bunları kullanır.
// Kullanım: node tools/make-logo.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'www', 'strokes.js'), 'utf8') + ';this.S = STROKES;', ctx);

const paths = ctx.S['め'].s.map(d => `<path d="${d}"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109 109" width="1024" height="1024">
  <g fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${paths}</g>
</svg>`;
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets', 'logo.svg'), svg);
await sharp(Buffer.from(svg)).resize(1024, 1024).png().toFile(path.join(root, 'assets', 'logo.png'));
console.log('assets/logo.png hazır');
