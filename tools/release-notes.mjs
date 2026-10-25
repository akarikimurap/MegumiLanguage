// Bir sürüm etiketinin notlarını CHANGELOG.md'den çıkarır ve GitHub sürüm açıklaması olarak yazdırır.
// Kullanım:  node tools/release-notes.mjs v0.2.1-beta > notes.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tag = process.argv[2];
if (!tag) { console.error('Kullanım: node tools/release-notes.mjs <etiket>'); process.exit(1); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lines = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8').split(/\r?\n/);
const start = lines.findIndex(l => l.startsWith('## ') && l.includes(`(${tag})`));
let section = '';
if (start >= 0) {
  const end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  section = lines.slice(start + 1, end < 0 ? undefined : end).join('\n').trim();
} else {
  console.error(`Uyarı: CHANGELOG.md'de ${tag} için bölüm yok.`);
}
const apk = `MegumiLanguage-${tag.replace(/^v/, '')}.apk`;
const repo = process.env.GITHUB_REPOSITORY || 'akarikimurap/MegumiLanguage';
const parts = [];
if (tag.endsWith('-beta')) parts.push('🧪 **Beta sürüm:** denemek içindir, hatalar olabilir. Geri bildirimlerini Issues sekmesinden ya da [Megumi Projesi Discord](https://discord.gg/4gzM6eZgQ8) sunucusundan iletebilirsin.');
if (section) parts.push(`## Yenilikler\n\n${section}`);
parts.push(`## 📱 Kurulum

1. Aşağıdaki **Assets** bölümünden \`${apk}\` dosyasını telefonuna indirip aç.
2. İlk kurulumda Android "bilinmeyen kaynaklardan uygulama yükleme" izni ister, tarayıcına veya Dosyalar uygulamasına bu izni ver.
3. Güncellemek için yeni APK'yı eskisinin üzerine kurman yeterli, ilerlemen korunur.`);
parts.push(`Tüm sürümlerin notları: [CHANGELOG.md](https://github.com/${repo}/blob/main/CHANGELOG.md)`);
process.stdout.write(parts.join('\n\n') + '\n');
