/**
 * Generates Poseidon's application icons from one hand-authored mark.
 *
 * The mark is a coral trident rising through the ocean gradient and the
 * bathymetric swell used across the app's memory surfaces, so the installed
 * icon reads as the same product as the screens behind it.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { launchOptions } from '../chromium.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(here, '../../apps/web/public/icons');

/** @param {{ padded: boolean }} options */
function mark({ padded }) {
  // A maskable icon must survive an aggressive circular crop, so the mark is
  // drawn smaller inside a full-bleed field.
  const scale = padded ? 0.62 : 0.82;
  const radius = padded ? 0 : 116;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="sea" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#118AB2"/>
      <stop offset="0.55" stop-color="#084C61"/>
      <stop offset="1" stop-color="#05323F"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#sea)"/>
  <g opacity="0.28" fill="none" stroke="#7FD8E8" stroke-width="10" stroke-linecap="round">
    <path d="M 36 372 C 116 336 172 404 256 372 C 340 340 400 400 476 366"/>
    <path d="M 36 424 C 116 388 172 456 256 424 C 340 392 400 452 476 418"/>
  </g>
  <g transform="translate(256 240) scale(${scale}) translate(-256 -240)">
    <g fill="#FF6B6B">
      <path d="M 140 182 L 158 54 L 176 182 Z"/>
      <path d="M 238 182 L 256 26 L 274 182 Z"/>
      <path d="M 336 182 L 354 54 L 372 182 Z"/>
      <rect x="130" y="176" width="252" height="34" rx="17"/>
      <rect x="240" y="196" width="32" height="242" rx="16"/>
      <rect x="196" y="286" width="120" height="26" rx="13"/>
    </g>
  </g>
</svg>`;
}

const TARGETS = [
  { file: 'icon-192.png', size: 192, padded: false },
  { file: 'icon-512.png', size: 512, padded: false },
  { file: 'icon-maskable-512.png', size: 512, padded: true },
  { file: 'apple-touch-icon.png', size: 180, padded: false },
];

await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, 'mark.svg'), `${mark({ padded: false })}\n`, 'utf8');

const browser = await chromium.launch(launchOptions());
try {
  for (const target of TARGETS) {
    const page = await browser.newPage({
      viewport: { width: target.size, height: target.size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<style>html,body{margin:0;background:transparent}svg{display:block;width:${target.size}px;height:${target.size}px}</style>${mark({ padded: target.padded })}`,
      { waitUntil: 'load' },
    );
    await page.screenshot({
      path: join(outputDir, target.file),
      omitBackground: true,
      clip: { x: 0, y: 0, width: target.size, height: target.size },
    });
    await page.close();
    console.log(`[brand] wrote ${target.file}`);
  }
} finally {
  await browser.close();
}
