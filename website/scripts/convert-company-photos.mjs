// Converts the raw company photos in photos-src/ (iPhone HEIC files disguised
// as .jpeg, JPEG screenshots disguised as .png) into web-ready, downscaled
// JPEGs in public/photos/. Run with: node scripts/convert-company-photos.mjs
import { readFileSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

mkdirSync('public/photos', { recursive: true });

const files = ['1.jpeg', '2.jpeg', '3.png', '4.jpeg', '5.jpeg', '6.png', '7.jpeg', '8.png', '9.jpeg'];

for (const f of files) {
  const n = f.split('.')[0];
  const buf = readFileSync(`photos-src/${f}`);
  const isHeic = buf.subarray(4, 12).toString('ascii').startsWith('ftypheic');

  let input = buf;
  if (isHeic) {
    // sharp's bundled libheif rejects these iPhone files (iref security limit),
    // so decode with the pure-JS heic-convert first.
    input = Buffer.from(await heicConvert({ buffer: buf, format: 'JPEG', quality: 0.95 }));
  }

  let img = sharp(input).rotate();
  if (n === '8') {
    // 8.png is a phone screenshot: crop off the black bars + caption strip.
    img = img.extract({ left: 0, top: 90, width: 1170, height: 1440 });
  }

  await img
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`public/photos/delivery-${n}.jpg`);
  console.log(`ok ${f} -> delivery-${n}.jpg${isHeic ? ' (heic)' : ''}`);
}
