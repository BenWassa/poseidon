import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

import { chromium } from 'playwright';

import { launchOptions } from '../../../tools/chromium.mjs';

const distDir = resolve(import.meta.dirname, '../dist');
const MAX_PRECACHE_BYTES = 2 * 1024 * 1024;
const PRECACHE_EXTENSIONS = new Set([
  '.js',
  '.css',
  '.html',
  '.webp',
  '.png',
  '.svg',
  '.woff2',
]);
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

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(path)));
    else files.push(path);
  }
  return files;
}

async function checkPrecacheBudget() {
  const files = await filesUnder(distDir);
  const precached = files.filter((file) => {
    const relative = file.slice(distDir.length + 1);
    return (
      PRECACHE_EXTENSIONS.has(extname(file)) &&
      relative !== 'sw.js' &&
      !relative.startsWith('workbox-')
    );
  });
  const sizes = await Promise.all(
    precached.map(async (file) => (await stat(file)).size),
  );
  const bytes = sizes.reduce((total, size) => total + size, 0);
  assert.ok(
    bytes <= MAX_PRECACHE_BYTES,
    `Precache candidates use ${bytes} bytes; budget is ${MAX_PRECACHE_BYTES}.`,
  );
  assert.equal(
    precached.some((file) => file.includes('mock-data-')),
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
  await page
    .getByRole('heading', { name: 'Sign in to your dive log' })
    .waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page
    .getByRole('heading', { name: 'Sign in to your dive log' })
    .waitFor();

  await context.setOffline(true);
  await page.goto(route('/journal'), { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: 'Sign in to your dive log' })
    .waitFor();

  await page.close();
  page = await context.newPage();
  await page.goto(route('/data'), { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: 'Sign in to your dive log' })
    .waitFor();

  console.log(
    '[pwa] production auth shell is controlled, deep-route-safe and cold-starts offline',
  );
  console.log('[pwa] development mock seed code is absent from production output');
} finally {
  await context.setOffline(false).catch(() => {});
  await context.close();
  await browser.close();
  server.close();
}
