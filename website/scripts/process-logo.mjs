/**
 * Makes the white background of the logo transparent and produces:
 *  - public/logo-full.png  (full wordmark, transparent, trimmed)
 *  - public/logo-mark.png  (circular "P" emblem only, transparent, trimmed)
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, 'tmp-img', 'logo.jpeg');
const outDir = path.join(root, 'public');

async function whiteToTransparent(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Distance from white — gold pixels have a low blue channel, so the min
    // channel is a good separator. Soft ramp keeps anti-aliased edges smooth.
    const minCh = Math.min(r, g, b);
    if (minCh >= 245) {
      data[i + 3] = 0;
    } else if (minCh > 200) {
      data[i + 3] = Math.round(255 * (1 - (minCh - 200) / 45));
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png();
}

const meta = await sharp(src).metadata();
console.log(`source: ${meta.width}x${meta.height}`);

// Full wordmark
const full = await whiteToTransparent(src);
await full.trim().toFile(path.join(outDir, 'logo-full.png'));

// Emblem only: top ~70% of the image contains the circle + swoosh, no text
const emblemRegion = await sharp(src)
  .extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * 0.7) })
  .toBuffer();
const mark = await whiteToTransparent(emblemRegion);
await mark.trim().toFile(path.join(outDir, 'logo-mark.png'));

// Square favicon version with padding
const markBuf = await sharp(path.join(outDir, 'logo-mark.png')).toBuffer();
const mMeta = await sharp(markBuf).metadata();
const size = Math.max(mMeta.width, mMeta.height) + 24;
await sharp({
  create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: markBuf, gravity: 'centre' }])
  .png()
  .toFile(path.join(outDir, 'favicon.png'));

console.log('done: logo-full.png, logo-mark.png, favicon.png');
