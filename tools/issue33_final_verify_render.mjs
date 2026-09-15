import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { launchOptions } from './chromium.mjs';
import { buildDemoState } from '../apps/web/tools/demo-state.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '../apps/web/dist');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const species = [
  ['bluehead-wrasse', 'Bluehead wrasse'],
  ['loggerhead-sea-turtle', 'Loggerhead sea turtle'],
  ['ocean-surgeonfish', 'Ocean surgeonfish'],
  ['rock-beauty', 'Rock beauty'],
  ['splendid-toadfish', 'Splendid toadfish'],
  ['yellowhead-wrasse', 'Yellowhead wrasse'],
];

async function resolveFile(pathname) {
  const candidate = join(distDir, pathname === '/' ? 'index.html' : decodeURIComponent(pathname));
  try {
    const info = await stat(candidate);
    if (info.isFile()) return candidate;
  } catch {
    // SPA fallback below.
  }
  return join(distDir, 'index.html');
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  void resolveFile(url.pathname).then((file) => {
    response.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(response);
  });
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const { port } = server.address();
const origin = `http://127.0.0.1:${port}`;
const route = (path) => `${origin}/#${path}`;
const demo = buildDemoState();
const proofStamp = '2026-09-15T12:00:00.000Z';
demo.state.dives.push({
  id: 'dive_issue33_final_render',
  date: '2026-09-15',
  siteName: 'Palancar Gardens',
  areaName: 'Cozumel',
  countryCode: 'MX',
  regionId: 'mx-caribbean-cozumel',
  maxDepth: { value: 18, unit: 'm' },
  durationMinutes: 42,
  sightings: species.map(([id], index) => ({
    id: `sighting_issue33_final_${index}`,
    creatureId: id,
  })),
  highlightCreatureId: species[0][0],
  createdAt: proofStamp,
  updatedAt: proofStamp,
});
demo.state.updatedAt = proofStamp;

async function assertLocatorImageLoaded(image, expectedFragment, label) {
  await image.waitFor({ state: 'attached' });
  await image.scrollIntoViewIfNeeded();
  await image.waitFor({ state: 'visible' });
  await image.evaluate(async (node) => {
    if (!(node instanceof HTMLImageElement)) throw new Error('target is not an image');
    if (!node.complete) await new Promise((resolve) => node.addEventListener('load', resolve, { once: true }));
  });
  const loaded = await image.evaluate(
    (node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0 && node.naturalHeight > 0,
  );
  const src = await image.getAttribute('src');
  if (!loaded) throw new Error(`${label}: image failed to render (${src})`);
  if (!src?.includes(expectedFragment)) throw new Error(`${label}: wrong source ${src}`);
  console.log(`[issue33-final] ${label}: ${src}`);
}

const browser = await chromium.launch(launchOptions());
try {
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await context.addInitScript(
    ([key, state]) => {
      window.localStorage.clear();
      window.localStorage.setItem(key, JSON.stringify(state));
    },
    [demo.storageKey, demo.state],
  );
  const page = await context.newPage();

  await page.goto(route('/collection'), { waitUntil: 'networkidle' });
  const collectionSearch = page.getByLabel('Search your collection');
  for (const [id, name] of species) {
    await collectionSearch.fill(name);
    const card = page.getByRole('link', { name: new RegExp(name, 'i') }).first();
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('img[data-testid="creature-artwork"]').first();
    await assertLocatorImageLoaded(image, `/creatures/${id}/gallery.webp`, `Collection ${id}`);
    await collectionSearch.fill('');
  }

  for (const [id] of species) {
    await page.goto(route(`/collection/${id}`), { waitUntil: 'networkidle' });
    const image = page.locator(`img[data-testid="creature-artwork"][src*="/creatures/${id}/hero.webp"]`).first();
    await assertLocatorImageLoaded(image, `/creatures/${id}/hero.webp`, `Creature Detail ${id}`);
  }

  await page.goto(route('/log'), { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Cozumel' }).first().click();
  await page.getByLabel('Dive site').fill('Issue 33 final render check');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Max depth').fill('18');
  await page.getByLabel('Duration').fill('42');
  await page.getByRole('button', { name: 'Choose creatures' }).click();
  await page.waitForTimeout(300);

  for (const [id, name] of species) {
    const button = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
    await button.scrollIntoViewIfNeeded();
    const image = button.locator(`img[data-testid="creature-artwork"]`).first();
    await assertLocatorImageLoaded(image, `/creatures/${id}/thumb.webp`, `Log Dive ${id}`);
  }

  await context.close();
} finally {
  await browser.close();
  server.close();
}

console.log('[issue33-final] rendered verification passed');
