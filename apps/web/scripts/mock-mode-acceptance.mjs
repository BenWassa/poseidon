import assert from 'node:assert/strict';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import {
  build as viteBuild,
  createServer as createViteServer,
  preview as vitePreview,
} from 'vite';

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

  await page.goto(`${appUrl}?mock=5#/profile`, {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('heading', { name: 'Profile' }).waitFor();
  await page
    .getByRole('button', { name: 'Export everything as JSON' })
    .waitFor();

  console.log('[mock] auth bypass + seeded app + Profile: ok');

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

// ---------------------------------------------------------------------------
// Portfolio demo build (`npm run build:demo`, VITE_POSEIDON_DEMO=true).
//
// The development server above proves the mock boundary on the dev site. The
// demo is different: it is a *production* bundle that a stranger reaches with no
// sign-in, so it is built for real, served as built, and probed the same way.
// ---------------------------------------------------------------------------
const demoOut = mkdtempSync(join(tmpdir(), 'poseidon-demo-'));
const demoBase = '/poseidon/demo/';
const demoErrors = [];
const demoRequests = [];

function* walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const savedBase = process.env.POSEIDON_BASE_PATH;
delete process.env.POSEIDON_BASE_PATH; // exercise the real Pages default
let previewServer;
let demoBrowser;
try {
  await viteBuild({
    root,
    mode: 'demo',
    logLevel: 'error',
    build: { outDir: demoOut, emptyOutDir: true },
  });

  // Static: the demo bundle must not contain the real backend at all, and must
  // not ship a service worker that could outlive a redeploy.
  const backendPattern =
    /firebase|firestore|identitytoolkit|securetoken|googleapis\.com/i;
  const files = [...walk(demoOut)];
  for (const file of files.filter((name) => /\.(js|html|css)$/.test(name))) {
    assert.ok(
      !backendPattern.test(readFileSync(file, 'utf8')),
      `demo bundle contains a real-backend reference: ${file}`,
    );
  }
  assert.ok(
    !files.some((name) => /(^|\/)(sw\.js|manifest\.webmanifest)$/.test(name)),
    'demo bundle shipped a service worker or manifest',
  );
  console.log(
    '[demo] bundle has no Firebase/backend code, no service worker: ok',
  );

  previewServer = await vitePreview({
    root,
    mode: 'demo',
    logLevel: 'error',
    build: { outDir: demoOut },
    preview: { host: '127.0.0.1', port: 0 },
  });
  const demoAddress = previewServer.httpServer.address();
  assert.ok(
    demoAddress && typeof demoAddress !== 'string',
    'demo preview did not bind',
  );
  const demoOrigin = `http://127.0.0.1:${demoAddress.port}`;
  const demoUrl = `${demoOrigin}${demoBase}`;

  demoBrowser = await chromium.launch(launchOptions());
  const demoContext = await demoBrowser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
    serviceWorkers: 'allow',
  });
  // A stale dev/real selection in storage must be ignored by the demo.
  await demoContext.addInitScript(() => {
    if (!window.sessionStorage.getItem('seeded')) {
      window.sessionStorage.setItem('seeded', '1');
      window.localStorage.setItem(
        'poseidon.dev.selection',
        JSON.stringify({ kind: 'real' }),
      );
    }
  });
  const demoPage = await demoContext.newPage();
  demoPage.on('request', (request) => demoRequests.push(request.url()));
  demoPage.on('pageerror', (error) => demoErrors.push(error.message));
  demoPage.on('console', (message) => {
    if (message.type() === 'error') demoErrors.push(message.text());
  });

  // No parameter: populated by default, no sign-in, visible demo messaging.
  await demoPage.goto(demoUrl, { waitUntil: 'domcontentloaded' });
  await demoPage
    .getByText(/A permanent record of 15 dives exploring/)
    .waitFor();
  await demoPage.getByTestId('demo-notice').waitFor();
  assert.equal(
    await demoPage.getByRole('button', { name: /sign in/i }).count(),
    0,
    'demo build rendered sign-in UI',
  );
  assert.equal(
    await demoPage.getByTestId('dev-mode-badge').count(),
    0,
    'demo build rendered the development badge',
  );

  // `?mock=off` / `?mock=real` must not reach the real application.
  for (const value of ['off', 'real']) {
    await demoPage.goto(`${demoUrl}?mock=${value}#/`, {
      waitUntil: 'domcontentloaded',
    });
    await demoPage
      .getByText(/A permanent record of 15 dives exploring/)
      .waitFor();
  }

  // An explicit preset is still honoured, and nothing is persisted.
  await demoPage.goto(`${demoUrl}?mock=5#/`, { waitUntil: 'domcontentloaded' });
  await demoPage.getByText(/A permanent record of 5 dives exploring/).waitFor();
  assert.equal(
    await demoPage.evaluate(() =>
      window.localStorage.getItem('poseidon.dev.selection'),
    ),
    JSON.stringify({ kind: 'real' }),
    'demo build wrote to the development selection key',
  );
  assert.equal(
    (await demoPage.evaluate(() => navigator.serviceWorker.getRegistrations()))
      .length,
    0,
    'demo build registered a service worker',
  );

  // A plain reload boots the same baseline (session edits are never stored).
  await demoPage.goto(`${demoUrl}#/`, { waitUntil: 'domcontentloaded' });
  await demoPage
    .getByText(/A permanent record of 15 dives exploring/)
    .waitFor();

  console.log(
    '[demo] populated default, no sign-in, stale selection ignored: ok',
  );

  await demoPage.waitForTimeout(250);
  const foreign = demoRequests.filter(
    (url) => new URL(url).origin !== demoOrigin,
  );
  assert.deepEqual(
    foreign.filter((url) => backendPattern.test(url)),
    [],
    'demo build contacted a real backend',
  );
  assert.deepEqual(demoErrors, [], `demo build logged errors: ${demoErrors}`);
  console.log('[demo] zero backend requests, zero console errors: ok');
} finally {
  if (savedBase !== undefined) process.env.POSEIDON_BASE_PATH = savedBase;
  await demoBrowser?.close();
  await previewServer?.close();
  rmSync(demoOut, { recursive: true, force: true });
}

console.log('[demo] demo-build acceptance passed');
