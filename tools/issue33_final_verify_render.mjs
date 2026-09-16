import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

import { chromium } from 'playwright';

import { launchOptions } from './chromium.mjs';

const webRoot = resolve(import.meta.dirname, '../apps/web');
const viteBin = resolve(webRoot, 'node_modules/vite/bin/vite.js');
const port = 4179;
const origin = `http://127.0.0.1:${port}`;
const route = (path = '/') => `${origin}/?mock=0#${path}`;

const species = [
  ['bluehead-wrasse', 'Bluehead wrasse'],
  ['loggerhead-sea-turtle', 'Loggerhead sea turtle'],
  ['ocean-surgeonfish', 'Ocean surgeonfish'],
  ['rock-beauty', 'Rock beauty'],
  ['splendid-toadfish', 'Splendid toadfish'],
  ['yellowhead-wrasse', 'Yellowhead wrasse'],
];

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin, { redirect: 'manual' });
      if (response.ok || response.status === 302 || response.status === 307) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  throw new Error(`dev server did not become ready: ${lastError ?? 'timeout'}`);
}

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

const devServer = spawn(
  process.execPath,
  [viteBin, '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
  {
    cwd: webRoot,
    env: { ...process.env, POSEIDON_BASE_PATH: '/' },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
devServer.stdout.on('data', (chunk) => process.stdout.write(`[issue33-dev] ${chunk}`));
devServer.stderr.on('data', (chunk) => process.stderr.write(`[issue33-dev] ${chunk}`));

await waitForServer();
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
    await assertLocatorImageLoaded(image, `/creatures/${id}/gallery.webp`, `Log Dive ${id}`);
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
  devServer.kill('SIGTERM');
  devServer.stdout.destroy();
  devServer.stderr.destroy();
  devServer.unref();
}

console.log('[issue33-final] rendered verification passed');
