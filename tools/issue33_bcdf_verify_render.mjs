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
  ['bicolor-damselfish', 'Bicolor damselfish'],
  ['french-grunt', 'French grunt'],
  ['honeycomb-cowfish', 'Honeycomb cowfish'],
  ['lionfish', 'Lionfish'],
  ['mutton-snapper', 'Mutton snapper'],
  ['redband-parrotfish', 'Redband parrotfish'],
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

async function assertLoaded(page, selector, expectedFragment, label) {
  const image = page.locator(selector).filter({ has: page.locator(`xpath=.`) }).first();
  await image.scrollIntoViewIfNeeded();
  await image.waitFor({ state: 'visible' });
  await page.waitForFunction(
    ([sel, fragment]) => {
      const candidates = [...document.querySelectorAll(sel)];
      const target = candidates.find((node) => node instanceof HTMLImageElement && node.src.includes(fragment));
      return Boolean(target && target.complete && target.naturalWidth > 0 && target.naturalHeight > 0);
    },
    [selector, expectedFragment],
  );
  const src = await image.getAttribute('src');
  if (!src?.includes(expectedFragment)) throw new Error(`${label}: wrong source ${src}`);
  console.log(`[issue33-bcdf] ${label}: ${src}`);
}

const browser = await chromium.launch(launchOptions());
try {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await context.addInitScript(
    ([key, state]) => {
      window.localStorage.clear();
      window.localStorage.setItem(key, JSON.stringify(state));
    },
    [demo.storageKey, demo.state],
  );
  const page = await context.newPage();

  // Collection: every new gallery image must be present and decodable in the real built app.
  await page.goto(route('/collection'), { waitUntil: 'networkidle' });
  for (const [id] of species) {
    const selector = `img[data-testid="creature-artwork"][src*="/creatures/${id}/gallery.webp"]`;
    await assertLoaded(page, selector, `/creatures/${id}/gallery.webp`, `Collection ${id}`);
  }

  // Creature Detail: hero variant for every member of this isolated batch.
  for (const [id] of species) {
    await page.goto(route(`/collection/${id}`), { waitUntil: 'networkidle' });
    const selector = `img[data-testid="creature-artwork"][src*="/creatures/${id}/hero.webp"]`;
    await assertLoaded(page, selector, `/creatures/${id}/hero.webp`, `Creature Detail ${id}`);
  }

  // Log Dive: exercise the actual creature picker and require each thumb to load.
  await page.goto(route('/log'), { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Cozumel' }).first().click();
  await page.getByLabel('Dive site').fill('Issue 33 Render Check');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Max depth').fill('18');
  await page.getByLabel('Duration').fill('42');
  await page.getByRole('button', { name: 'Choose creatures' }).click();
  await page.waitForTimeout(300);

  for (const [id, name] of species) {
    const button = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
    await button.scrollIntoViewIfNeeded();
    const image = button.locator(`img[data-testid="creature-artwork"][src*="/creatures/${id}/thumb.webp"]`).first();
    await image.waitFor({ state: 'visible' });
    const loaded = await image.evaluate((node) => node.complete && node.naturalWidth > 0 && node.naturalHeight > 0);
    if (!loaded) throw new Error(`Log Dive ${id}: thumb failed to render`);
    await button.click();
    console.log(`[issue33-bcdf] Log Dive ${id}: rendered and selected`);
  }

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Make Lionfish the highlight of this dive' }).click();
  await page.getByLabel('Note').fill('Rendered verification for isolated issue 33 art batch.');
  await page.getByRole('button', { name: /Save this memory/ }).click();
  await page.waitForLoadState('networkidle');
  await assertLoaded(
    page,
    'img[data-testid="creature-artwork"][src*="/creatures/lionfish/hero.webp"]',
    '/creatures/lionfish/hero.webp',
    'Dive highlight lionfish',
  );

  await context.close();
} finally {
  await browser.close();
  server.close();
}

console.log('[issue33-bcdf] rendered verification passed');
