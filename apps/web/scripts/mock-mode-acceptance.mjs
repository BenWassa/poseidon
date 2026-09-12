import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import { createServer as createViteServer } from 'vite';

import { launchOptions } from '../../../tools/chromium.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

function normalizeBase(value) {
  const leading = value.startsWith('/') ? value : `/${value}`;
  return leading.endsWith('/') ? leading : `${leading}/`;
}

const basePath = normalizeBase(process.env.POSEIDON_BASE_PATH ?? '/');
const vite = await createViteServer({
  root,
  mode: 'mock',
  logLevel: 'error',
  server: {
    host: '127.0.0.1',
    port: 0,
  },
});

await vite.listen();
const address = vite.httpServer?.address();
assert.ok(
  address && typeof address !== 'string',
  'mock Vite server did not bind',
);
const origin = `http://127.0.0.1:${address.port}`;
const appUrl = `${origin}${basePath}`;

const browser = await chromium.launch(launchOptions());
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2.6,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'reduce',
});

const firebaseRequests = [];
const firebasePattern =
  /firebase|firestore|identitytoolkit|securetoken|googleapis\.com\/.*firebase/i;

try {
  const page = await context.newPage();
  page.on('request', (request) => {
    const url = request.url();
    if (firebasePattern.test(url)) firebaseRequests.push(url);
  });

  await page.goto(`${appUrl}?mock=3#/`, { waitUntil: 'domcontentloaded' });
  await page.getByText(/^3 dives · 9 creatures ·/).waitFor();

  assert.equal(
    await page.getByRole('button', { name: /sign in/i }).count(),
    0,
    'mock mode unexpectedly rendered sign-in UI',
  );

  await page.goto(`${appUrl}?mock=5#/data`, {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('heading', { name: 'Data & backup' }).waitFor();
  await page
    .getByRole('button', { name: 'Export everything as JSON' })
    .waitFor();

  await page.waitForTimeout(250);
  assert.deepEqual(
    firebaseRequests,
    [],
    `mock mode loaded or contacted Firebase: ${firebaseRequests.join(', ')}`,
  );

  console.log('[mock] auth bypass + seeded app + Data & Backup: ok');
  console.log('[mock] zero Firebase module/network requests: ok');
} finally {
  await context.close();
  await browser.close();
  await vite.close();
}

console.log('[mock] development mock-mode acceptance passed');
