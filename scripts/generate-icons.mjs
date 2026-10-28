/**
 * Renders the PWA/app icons from SVG sources into public/.
 * Run with `npm run icons` after changing the artwork.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

/** Full-bleed artwork for maskable icons: content kept inside the central 80% safe zone. */
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#151E50"/>
      <stop offset="0.66" stop-color="#3A3F86"/>
      <stop offset="1" stop-color="#C7798A"/>
    </linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FCD58F"/>
      <stop offset="1" stop-color="#F2A04A"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#sky)"/>
  <path d="M164 318a92 92 0 0 1 184 0Z" fill="url(#sun)"/>
  <rect y="318" width="512" height="194" fill="#0D1233"/>
  <rect x="124" y="312" width="264" height="12" rx="6" fill="#FFF1DC"/>
</svg>`;

const standard = await readFile(new URL('../public/favicon.svg', import.meta.url));

const targets = [
  { file: 'favicon-32x32.png', size: 32, svg: standard },
  { file: 'pwa-64x64.png', size: 64, svg: standard },
  { file: 'pwa-192x192.png', size: 192, svg: standard },
  { file: 'pwa-512x512.png', size: 512, svg: standard },
  { file: 'maskable-icon-512x512.png', size: 512, svg: Buffer.from(maskable) },
  // iOS ignores transparency and rounds corners itself, so use the full-bleed art.
  { file: 'apple-touch-icon-180x180.png', size: 180, svg: Buffer.from(maskable) },
];

for (const { file, size, svg } of targets) {
  const png = await sharp(svg, { density: Math.ceil((72 * size) / 512) * 2 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(`${publicDir}${file}`, png);
  console.log(`wrote public/${file} (${size}×${size})`);
}
