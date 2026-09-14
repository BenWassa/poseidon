import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer as createViteServer } from 'vite';
import { launchOptions } from './chromium.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../apps/web');
const species = [
  ['bicolor-damselfish', 'Bicolor damselfish'],
  ['french-grunt', 'French grunt'],
  ['honeycomb-cowfish', 'Honeycomb cowfish'],
  ['lionfish', 'Lionfish'],
  ['mutton-snapper', 'Mutton snapper'],
  ['redband-parrotfish', 'Redband parrotfish'],
];

const vite = await createViteServer({
  root,
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
});
await vite.listen();
const address = vite.httpServer?.address();
assert.ok(address && typeof address !== 'string', 'development Vite server did not bind');
const origin = `http://127.0.0.1:${address.port}`;
const route = (path) => `${origin}/?mock=3#${path}`;

async function assertLoaded(page, selector, expectedFragment, label) {
  const image = page.locator(selector).first();
  await image.scrollIntoViewIfNeeded();
  await image.waitFor({ state: 'visible' });
  await image.evaluate(async (node) => {
    if (!(node instanceof HTMLImageElement)) throw new Error('expected an image element');
    if (!node.complete) {
      await new Promise((resolveLoad, rejectLoad) => {
        node.addEventListener('load', resolveLoad, { once: true });
        node.addEventListener('error', () => rejectLoad(new Error('image load failed')), { once: true });
      });
    }
    if (node.naturalWidth <= 0 || node.naturalHeight <= 0) {
      throw new Error('decoded image has no intrinsic size');
    }
  });
  const src = await image.getAttribute('src');
  if (!src?.includes(expectedFragment)) throw new Error(`${label}: wrong source ${src}`);
  console.log(`[issue33-bcdf] ${label}: ${src}`);
}

const browser = await chromium.launch(launchOptions());
try {
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.6,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  // Supported development mock mode bypasses Firebase auth without changing
  // production code, while exercising the same CreatureImage/runtime assets.
  await page.goto(route('/'), { waitUntil: 'domcontentloaded' });
  await page.getByText(/A permanent record of 3 dives exploring/).waitFor();
  assert.equal(await page.getByRole('button', { name: /sign in/i }).count(), 0);

  for (const [id] of species) {
    await page.goto(route(`/collection/${id}`), { waitUntil: 'domcontentloaded' });
    await assertLoaded(
      page,
      `img[data-testid="creature-artwork"][src*="/creatures/${id}/hero.webp"]`,
      `/creatures/${id}/hero.webp`,
      `Creature Detail ${id}`,
    );
  }

  await page.goto(route('/log'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Cozumel' }).first().click();
  await page.getByLabel('Dive site').fill('Issue 33 Render Check');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Max depth').fill('18');
  await page.getByLabel('Duration').fill('42');
  await page.getByRole('button', { name: 'Choose creatures' }).click();

  for (const [id, name] of species) {
    const button = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
    await button.scrollIntoViewIfNeeded();
    await assertLoaded(
      page,
      `button:has-text("${name}") img[data-testid="creature-artwork"][src*="/creatures/${id}/thumb.webp"]`,
      `/creatures/${id}/thumb.webp`,
      `Log Dive ${id}`,
    );
    await button.click();
  }

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Make Lionfish the highlight of this dive' }).click();
  await page.getByLabel('Note').fill('Rendered verification for isolated issue 33 art batch.');
  await page.getByRole('button', { name: /Save this memory/ }).click();
  await assertLoaded(
    page,
    'img[data-testid="creature-artwork"][src*="/creatures/lionfish/hero.webp"]',
    '/creatures/lionfish/hero.webp',
    'Dive highlight lionfish',
  );

  // Collection is encounter-driven, so confirm galleries after the saved dive
  // has created real encounters for all six species.
  await page.goto(`${origin}/#/collection`, { waitUntil: 'domcontentloaded' });
  for (const [id] of species) {
    await assertLoaded(
      page,
      `img[data-testid="creature-artwork"][src*="/creatures/${id}/gallery.webp"]`,
      `/creatures/${id}/gallery.webp`,
      `Collection ${id}`,
    );
  }

  await context.close();
} finally {
  await browser.close();
  await vite.close();
}

console.log('[issue33-bcdf] rendered verification passed');
