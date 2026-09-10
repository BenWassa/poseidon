import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { launchOptions } from '../../../tools/chromium.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '../dist');
const basePath = normalizeBase(process.env.POSEIDON_BASE_PATH ?? '/');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function normalizeBase(value) {
  const leading = value.startsWith('/') ? value : `/${value}`;
  return leading.endsWith('/') ? leading : `${leading}/`;
}

async function resolveFile(pathname) {
  if (!pathname.startsWith(basePath)) return null;
  const relative = decodeURIComponent(pathname.slice(basePath.length));
  const candidate = join(distDir, relative || 'index.html');
  try {
    const info = await stat(candidate);
    if (info.isFile()) return candidate;
  } catch {
    // Hash routes never reach the server; falling back keeps accidental direct
    // requests useful during the automated production probe.
  }
  return join(distDir, 'index.html');
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  void resolveFile(url.pathname).then((file) => {
    if (!file) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-cache',
    });
    createReadStream(file).pipe(response);
  });
});

await new Promise((done) => server.listen(0, '127.0.0.1', done));
const { port } = server.address();
const origin = `http://127.0.0.1:${port}`;
const appUrl = `${origin}${basePath}`;
const browser = await chromium.launch(launchOptions());
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2.6,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'reduce',
  acceptDownloads: true,
});

function route(path = '/') {
  return `${appUrl}#${path}`;
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    main: document.querySelector('[data-testid="app-main"]')?.scrollWidth ?? 0,
  }));
  assert.ok(metrics.document <= metrics.viewport + 1, `${label}: document overflows horizontally`);
  assert.ok(metrics.main <= metrics.viewport + 1, `${label}: main rail overflows horizontally`);
}

async function downloadJson(page) {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export everything as JSON' }).click();
  const download = await pending;
  const path = await download.path();
  assert.ok(path, 'export download did not produce a local file');
  return JSON.parse(await readFile(path, 'utf8'));
}

async function logDive(page) {
  await page.goto(route('/log'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Cozumel' }).first().click();
  await page.getByLabel('Dive site').fill('Field Reef');
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByLabel('Max depth').fill('21');
  await page.getByLabel('Duration').fill('48');
  await assertNoHorizontalOverflow(page, 'focused log form');
  await page.getByRole('button', { name: /Choose creatures/ }).click();
  await page.getByRole('button', { name: /Green sea turtle/ }).first().click();
  await page.getByRole('button', { name: /Spotted eagle ray/ }).first().click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('button', { name: 'Make Spotted eagle ray the highlight of this dive' }).click();
  await page.getByLabel('Note').fill('Field readiness memory.');
  await page.getByRole('button', { name: /Save this memory/ }).click();
  await page.getByRole('heading', { name: 'Field Reef' }).waitFor();
}

async function verifyCoherence(page) {
  await page.getByRole('link', { name: /Home/ }).click();
  await page.getByText(/1 dive · 2 creatures/).waitFor();
  await assertNoHorizontalOverflow(page, 'Home');

  await page.getByRole('link', { name: /Journal/ }).click();
  await page.getByRole('heading', { name: 'Field Reef' }).waitFor();
  await assertNoHorizontalOverflow(page, 'Journal');

  await page.getByRole('link', { name: /Collection/ }).click();
  await page.getByText('2 creatures').waitFor();
  await page.getByText('Spotted eagle ray').first().waitFor();
  await assertNoHorizontalOverflow(page, 'Collection');

  await page.getByRole('link', { name: /Atlas/ }).click();
  await page.getByText('1 place').waitFor();
  await page.getByText('Cozumel').first().waitFor();
  await assertNoHorizontalOverflow(page, 'Atlas');
}

async function editDive(page) {
  await page.goto(route('/journal'), { waitUntil: 'domcontentloaded' });
  await page.getByText('Field Reef').first().click();
  await page.getByRole('heading', { name: 'Field Reef' }).waitFor();
  await page.getByRole('link', { name: 'Edit this dive' }).click();
  const site = page.getByLabel('Dive site');
  await site.fill('Field Reef North');
  await page.getByRole('button', { name: /Continue/ }).click();
  const depth = page.getByLabel('Max depth');
  await depth.fill('24');
  await page.getByRole('button', { name: /Choose creatures/ }).click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('button', { name: /Save changes/ }).click();
  await page.getByRole('heading', { name: 'Field Reef North' }).waitFor();
}

async function verifySystemBack(page) {
  await page.goto(route('/journal'), { waitUntil: 'domcontentloaded' });
  await page.getByText('Field Reef North').first().click();
  await page.getByRole('heading', { name: 'Field Reef North' }).waitFor();
  await page.goBack();
  await page.getByText('Field Reef North').first().waitFor();
}

async function restoreIntoCleanState(page, backup) {
  await page.evaluate(() => window.localStorage.clear());
  await page.close();
  const clean = await context.newPage();
  await clean.goto(route('/'), { waitUntil: 'domcontentloaded' });
  await clean.getByRole('heading', { name: 'Your atlas starts here' }).waitFor();

  await clean.goto(route('/data'), { waitUntil: 'domcontentloaded' });
  await clean.locator('#poseidon-restore-file').setInputFiles({
    name: 'poseidon-field-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await clean.getByText(/Backup contains 1 dive/).waitFor();
  clean.once('dialog', (dialog) => dialog.accept());
  await clean.getByRole('button', { name: 'Replace current record' }).click();
  await clean.getByText(/Restored backup: 1 dive and 0 custom creatures now on this device/).waitFor();

  const roundTrip = await downloadJson(clean);
  assert.deepEqual(roundTrip.personal, backup.personal, 'export → clean state → restore changed personal history');
  return clean;
}

try {
  let page = await context.newPage();
  await page.goto(route('/'), { waitUntil: 'networkidle' });

  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    if (!(link instanceof HTMLLinkElement)) throw new Error('manifest link missing');
    const response = await fetch(link.href);
    return response.json();
  });
  assert.equal(manifest.display, 'standalone', 'manifest must request standalone display');
  assert.equal(manifest.start_url, `${basePath}#/`, 'manifest start_url must preserve the deployment base and hash router');
  assert.equal(manifest.scope, basePath, 'manifest scope must match deployment base');
  assert.ok(
    Array.isArray(manifest.icons) && manifest.icons.some((icon) => icon.sizes === '512x512'),
    'manifest needs a 512px install icon',
  );

  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return false;
    await navigator.serviceWorker.ready;
    return true;
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  console.log('[field] installability signals: manifest + controlled service worker');

  await context.setOffline(true);
  await page.close();
  page = await context.newPage();
  await page.goto(route('/'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Your atlas starts here' }).waitFor();
  console.log('[field] offline cold start after cache: ok');

  await logDive(page);
  await verifyCoherence(page);
  await editDive(page);
  await verifySystemBack(page);
  console.log('[field] offline create/edit + Home/Journal/Collection/Atlas + Back: ok');

  await page.goto(route('/data'), { waitUntil: 'domcontentloaded' });
  const backup = await downloadJson(page);
  assert.equal(backup.personal.dives.length, 1);
  assert.equal(backup.personal.dives[0].siteName, 'Field Reef North');

  page = await restoreIntoCleanState(page, backup);
  console.log('[field] export → clean state → validated replace restore equivalence: ok');

  const diveId = backup.personal.dives[0].id;
  await page.goto(route(`/journal/${encodeURIComponent(diveId)}`), { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Field Reef North' }).waitFor();
  await page.getByRole('button', { name: 'Delete dive' }).click();
  await page.getByText('Delete this dive?').waitFor();
  await page.getByRole('button', { name: /^Delete$/ }).click();
  await page.getByRole('heading', { name: 'No dives yet' }).waitFor();
  console.log('[field] offline delete + derived history cleanup: ok');

  const safeBottom = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Main"]');
    return nav ? Number.parseFloat(getComputedStyle(nav).paddingBottom) : 0;
  });
  assert.ok(safeBottom >= 16, 'bottom navigation must retain safe-area-aware minimum padding');
  await assertNoHorizontalOverflow(page, 'final Pixel viewport');
  console.log('[field] Pixel viewport composition + safe-area minimum: ok');
} finally {
  await context.setOffline(false).catch(() => {});
  await context.close();
  await browser.close();
  server.close();
}

console.log('[field] automated production PWA field-readiness probe passed');
