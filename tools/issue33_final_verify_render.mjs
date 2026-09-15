import assert from 'node:assert/strict';
import { resolve } from 'node:path';

import { chromium } from 'playwright';
import { createServer as createViteServer } from 'vite';

import { launchOptions } from './chromium.mjs';

const root = resolve(import.meta.dirname, '../apps/web');
const basePath = normalizeBase(process.env.POSEIDON_BASE_PATH ?? '/');

function normalizeBase(value) {
  const leading = value.startsWith('/') ? value : `/${value}`;
  return leading.endsWith('/') ? leading : `${leading}/`;
}

const species = [
  ['bluehead-wrasse', 'Bluehead wrasse'],
  ['loggerhead-sea-turtle', 'Loggerhead sea turtle'],
  ['ocean-surgeonfish', 'Ocean surgeonfish'],
  ['rock-beauty', 'Rock beauty'],
  ['splendid-toadfish', 'Splendid toadfish'],
  ['yellowhead-wrasse', 'Yellowhead wrasse'],
];

async function assertLocatorImageLoaded(image, expectedFragment, label) {
  await image.waitFor({ state: 'attached' });
  await image.scrollIntoViewIfNeeded();
  await image.waitFor({ state: 'visible' });
  await image.evaluate(async (node) => {
    if (!(node instanceof HTMLImageElement)) throw new Error('target is not an image');
    if (!node.complete) {
      await Promise.race([
        new Promise((done) => node.addEventListener('load', done, { once: true })),
        new Promise((_, reject) =>
          node.addEventListener('error', () => reject(new Error(`image failed: ${node.src}`)), { once: true }),
        ),
      ]);
    }
  });
  const loaded = await image.evaluate(
    (node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0 && node.naturalHeight > 0,
  );
  const src = await image.getAttribute('src');
  assert.ok(loaded, `${label}: image failed to render (${src})`);
  assert.ok(src?.includes(expectedFragment), `${label}: wrong source ${src}`);
  console.log(`[issue33-final] ${label}: ${src}`);
}

const vite = await createViteServer({
  root,
  logLevel: 'error',
  server: {
    host: '127.0.0.1',
    port: 0,
  },
});
await vite.listen();
const address = vite.httpServer?.address();
assert.ok(address && typeof address !== 'string', 'mock Vite server did not bind');
const origin = `http://127.0.0.1:${address.port}`;
const appUrl = `${origin}${basePath}`;
const route = (path = '/') => `${appUrl}?mock=0#${path}`;

const browser = await chromium.launch(launchOptions());
try {
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  // Use the supported zero-Firebase mock app and create one real temporary dive
  // containing all six species. This proves Log Dive thumbnails and makes the
  // encounter-only Collection on this branch render the same six species.
  await page.goto(route('/log'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Cozumel' }).first().click();
  await page.getByLabel('Dive site').fill('Issue 33 final render check');
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByLabel('Max depth').fill('18');
  await page.getByLabel('Duration').fill('42');
  await page.getByRole('button', { name: /Choose creatures/ }).click();

  for (const [id, name] of species) {
    const button = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
    await button.scrollIntoViewIfNeeded();
    const image = button.locator('img[data-testid="creature-artwork"]').first();
    await assertLocatorImageLoaded(image, `/creatures/${id}/thumb.webp`, `Log Dive ${id}`);
    await button.click();
  }

  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('button', { name: /Save this memory/ }).click();
  await page.getByRole('heading', { name: 'Issue 33 final render check' }).waitFor();

  await page.goto(route('/collection'), { waitUntil: 'domcontentloaded' });
  for (const [id, name] of species) {
    const card = page.getByRole('link', { name: new RegExp(name, 'i') }).first();
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('img[data-testid="creature-artwork"]').first();
    await assertLocatorImageLoaded(image, `/creatures/${id}/gallery.webp`, `Collection ${id}`);
  }

  for (const [id] of species) {
    await page.goto(route(`/collection/${id}`), { waitUntil: 'domcontentloaded' });
    const image = page.locator('img[data-testid="creature-artwork"]').first();
    await assertLocatorImageLoaded(image, `/creatures/${id}/hero.webp`, `Creature Detail ${id}`);
  }

  await context.close();
} finally {
  await browser.close();
  await vite.close();
}

console.log('[issue33-final] rendered verification passed');
