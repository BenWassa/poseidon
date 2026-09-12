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

// The ordinary development server. Mock history is now a runtime choice on the
// same site rather than a separate Vite mode, so this probe must prove that the
// normal dev build still loads zero Firebase modules once mock is selected.
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
assert.ok(
  address && typeof address !== 'string',
  'development Vite server did not bind',
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
  await page.getByText(/A permanent record of 3 dives exploring/).waitFor();

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

  console.log('[mock] auth bypass + seeded app + Data & Backup: ok');

  // The in-app switcher is the supported way to change history without
  // restarting the server or hand-editing the URL.
  await page.goto(`${appUrl}?mock=3#/`, { waitUntil: 'domcontentloaded' });
  const badge = page.getByTestId('dev-mode-badge');
  await badge.waitFor();
  await badge
    .getByRole('button', { name: 'Development data: Mock · 3' })
    .click();
  await badge.getByRole('button', { name: 'Real · Firebase' }).waitFor();
  await badge.getByRole('button', { name: 'Mock · 30' }).click();

  await page.getByText(/A permanent record of 30 dives exploring/).waitFor();
  assert.equal(
    new URL(page.url()).searchParams.has('mock'),
    false,
    'the switcher left a stale ?mock= parameter on the URL',
  );

  // The choice is stored, so a plain reload with no parameter keeps it.
  await page.goto(`${appUrl}#/`, { waitUntil: 'domcontentloaded' });
  await page.getByText(/A permanent record of 30 dives exploring/).waitFor();

  console.log('[mock] in-app switcher + persisted selection: ok');

  // A stale production service worker on this origin would serve its precached
  // bundle over the dev server, silently hiding the badge, `?mock=` and every
  // source edit. The dev server must answer the worker-update fetch with a
  // worker that unregisters itself instead.
  const swResponse = await page.request.get(`${appUrl}sw.js`);
  assert.equal(swResponse.status(), 200, 'dev server did not answer /sw.js');
  const swSource = await swResponse.text();
  assert.ok(
    swSource.includes('self.registration.unregister()'),
    'the development server served a service worker that does not unregister itself',
  );
  assert.ok(
    !swSource.includes('precache'),
    'the development server served a precaching service worker',
  );

  console.log('[mock] development service-worker reset: ok');

  await page.waitForTimeout(250);
  assert.deepEqual(
    firebaseRequests,
    [],
    `mock mode loaded or contacted Firebase: ${firebaseRequests.join(', ')}`,
  );

  console.log('[mock] zero Firebase module/network requests: ok');
} finally {
  await context.close();
  await browser.close();
  await vite.close();
}

console.log('[mock] development mock-mode acceptance passed');
