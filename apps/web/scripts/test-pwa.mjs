import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

import { chromium } from 'playwright';

import { launchOptions } from '../../../tools/chromium.mjs';

const distDir = resolve(import.meta.dirname, '../dist');
// The HD-art promotion (#30) replaced flat SVG-derived illustrations with
// richer opaque-scene thumb/gallery variants, raising the legitimate
// precached footprint for cold-start browsing. `hero.webp` (the largest
// variant) is deliberately excluded from precache via `globIgnores` in
// vite.config.ts and runtime-cached on first view instead, so this budget
// covers the shell plus thumb/gallery art only, with headroom for the
// remaining starter-catalog promotions tracked in #31.
const MAX_PRECACHE_BYTES = 3 * 1024 * 1024;
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

/**
 * The budget must reflect what the service worker actually precaches, not
 * every matching-extension file that happens to sit in `dist` — workbox's
 * `globIgnores`/`runtimeCaching` (e.g. lazily-cached `hero.webp` creature
 * art) deliberately keep some built assets out of the precache manifest.
 * Reading `self.__WB_MANIFEST`'s literal from the generated `sw.js` is the
 * only way to measure the real precache set rather than re-deriving
 * (and silently drifting from) workbox's own glob configuration.
 */
async function readPrecacheManifest() {
  const swSource = await readFile(join(distDir, 'sw.js'), 'utf8');
  const match = swSource.match(/precacheAndRoute\((\[.*?\])\s*,/s);
  assert.ok(match, 'Could not locate the precacheAndRoute manifest in sw.js.');
  const entries = new Function(`return ${match[1]};`)();
  return entries.map((entry) =>
    typeof entry === 'string' ? entry : entry.url,
  );
}

async function checkPrecacheBudget() {
  const precached = await readPrecacheManifest();
  const sizes = await Promise.all(
    precached.map(async (url) => (await stat(join(distDir, url))).size),
  );
  const bytes = sizes.reduce((total, size) => total + size, 0);
  assert.ok(
    bytes <= MAX_PRECACHE_BYTES,
    `Precache candidates use ${bytes} bytes; budget is ${MAX_PRECACHE_BYTES}.`,
  );
  assert.equal(
    precached.some((url) => url.includes('mock-data-')),
    false,
    'development mock seed code must not ship in the production bundle',
  );
  console.log(
    `[pwa] precache budget: ${precached.length} files, ${(bytes / 1024).toFixed(1)} KiB`,
  );
}

function normalizeBase(value) {
  const leading = value.startsWith('/') ? value : `/${value}`;
  return leading.endsWith('/') ? leading : `${leading}/`;
}

const basePath = normalizeBase(process.env.POSEIDON_BASE_PATH ?? '/');

async function resolveFile(pathname) {
  if (!pathname.startsWith(basePath)) return null;
  const relative = decodeURIComponent(pathname.slice(basePath.length));
  const candidate = join(distDir, relative || 'index.html');
  try {
    if ((await stat(candidate)).isFile()) return candidate;
  } catch {
    // Hash routes never reach the server; the application shell resolves them client-side.
  }
  return join(distDir, 'index.html');
}

await checkPrecacheBudget();

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  void resolveFile(url.pathname).then((file) => {
    if (!file) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, {
      'cache-control':
        url.pathname === `${basePath}sw.js` ? 'no-cache' : 'public, max-age=0',
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      'service-worker-allowed': basePath,
    });
    createReadStream(file).pipe(response);
  });
});

await new Promise((done) => server.listen(0, '127.0.0.1', done));
const address = server.address();
assert.ok(address && typeof address !== 'string');
const origin = `http://127.0.0.1:${address.port}`;
const appUrl = `${origin}${basePath}`;

function route(path = '/') {
  return `${appUrl}#${path}`;
}

const browser = await chromium.launch(launchOptions());
const context = await browser.newContext({ serviceWorkers: 'allow' });
let page = await context.newPage();

try {
  await page.goto(route('/'), { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Your underwater life' }).waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.getByRole('heading', { name: 'Your underwater life' }).waitFor();

  await context.setOffline(true);
  await page.goto(route('/journal'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Your underwater life' }).waitFor();

  await page.close();
  page = await context.newPage();
  await page.goto(route('/data'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Your underwater life' }).waitFor();

  console.log(
    '[pwa] production auth shell is controlled, deep-route-safe and cold-starts offline',
  );
  console.log(
    '[pwa] development mock seed code is absent from production output',
  );
} finally {
  await context.setOffline(false).catch(() => {});
  await context.close();
  await browser.close();
  server.close();
}
