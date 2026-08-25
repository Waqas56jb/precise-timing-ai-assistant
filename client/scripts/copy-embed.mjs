import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'dist-embed', 'embed.js');
const dests = [
  join(root, 'dist', 'embed.js'),
  join(root, '..', 'website', 'public', 'embed.js'),
];

if (!existsSync(src)) {
  console.error('Missing dist-embed/embed.js — run vite embed build first');
  process.exit(1);
}

for (const dest of dests) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log(`copied → ${dest}`);
}
