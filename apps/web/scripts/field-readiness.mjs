import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from 'playwright';
import { createServer as createViteServer } from 'vite';

import { launchOptions } from '../../../tools/chromium.mjs';

const root = resolve(import.meta.dirname, '..');
const basePath = normalizeBase(process.env.POSEIDON_BASE_PATH ?? '/');

function normalizeBase(value) {
  const leading = value.startsWith('/') ? value : `/${value}`;
  return leading.endsWith('/') ? leading : `${leading}/`;
}

// The ordinary development server; every route below selects mock history at
// runtime with `?mock=0`, so this exercises the same site a developer uses.
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
  acceptDownloads: true,
});

function route(path = '/') {
  return `${appUrl}?mock=0#${path}`;
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    main: document.querySelector('[data-testid="app-main"]')?.scrollWidth ?? 0,
  }));
  assert.ok(
    metrics.document <= metrics.viewport + 1,
    `${label}: document overflows horizontally`,
  );
  assert.ok(
    metrics.main <= metrics.viewport + 1,
    `${label}: main rail overflows horizontally`,
  );
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
  await page
    .getByRole('button', { name: /Green sea turtle/ })
    .first()
    .click();
  await page
    .getByRole('button', { name: /Spotted eagle ray/ })
    .first()
    .click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page
    .getByRole('button', {
      name: 'Make Spotted eagle ray the highlight of this dive',
    })
    .click();
  await page.getByLabel('Note').fill('Field readiness memory.');
  await page.getByRole('button', { name: /Save this memory/ }).click();
  await page.getByRole('heading', { name: 'Field Reef' }).waitFor();
}

async function verifyCollectionResponsive(page) {
  const viewports = [
    { width: 390, height: 844, label: '390×844 portrait' },
    { width: 320, height: 568, label: '320px narrow portrait' },
    { width: 844, height: 390, label: '844×390 landscape' },
    { width: 1280, height: 900, label: 'desktop sanity' },
  ];

  await page.goto(route('/collection'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /^2 of \d+ seen$/ }).waitFor();

  const statusFilters = page.getByRole('group', {
    name: 'Filter by discovery status',
  });
  assert.equal(
    await statusFilters
      .getByRole('button', { name: /^All/ })
      .getAttribute('aria-pressed'),
    'true',
    'Collection All filter should be selected by default',
  );
  assert.equal(
    await statusFilters
      .getByRole('button', { name: /^Seen/ })
      .getAttribute('aria-pressed'),
    'false',
    'Collection Seen filter should not be selected by default',
  );

  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await assertNoHorizontalOverflow(page, `Collection ${viewport.label}`);
    assert.ok(
      await page.getByText('Green sea turtle').first().isVisible(),
      `${viewport.label}: a seen creature name should remain visible`,
    );
    assert.ok(
      await page.getByText('Not yet seen').first().isVisible(),
      `${viewport.label}: unseen state text should remain visible`,
    );
  }

  await page.setViewportSize({ width: 412, height: 915 });
}

async function verifyCoherence(page) {
  const nav = page.getByRole('navigation', { name: 'Main' });

  await nav.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('heading', { name: 'Your underwater life' }).waitFor();
  await assertNoHorizontalOverflow(page, 'Home');

  await nav.getByRole('link', { name: 'Journal' }).click();
  await page.getByRole('heading', { name: 'Field Reef' }).waitFor();
  await assertNoHorizontalOverflow(page, 'Journal');

  await nav.getByRole('link', { name: 'Collection' }).click();
  await page.getByRole('heading', { name: /^2 of \d+ seen$/ }).waitFor();
  await page.getByText('Spotted eagle ray').first().waitFor();
  await assertNoHorizontalOverflow(page, 'Collection');

  await nav.getByRole('link', { name: 'Atlas' }).click();
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
  await page.close();
  const clean = await context.newPage();
  await clean.goto(route('/'), { waitUntil: 'domcontentloaded' });
  await clean
    .getByRole('heading', { name: 'Your atlas starts here' })
    .waitFor();

  await clean.goto(route('/data'), { waitUntil: 'domcontentloaded' });
  await clean.locator('#poseidon-restore-file').setInputFiles({
    name: 'poseidon-field-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await clean.getByText(/Backup contains 1 dive/).waitFor();
  clean.once('dialog', (dialog) => dialog.accept());
  await clean.getByRole('button', { name: 'Replace current record' }).click();
  await clean
    .getByText(
      /Restored backup: 1 dive and 0 custom creatures now on this device/,
    )
    .waitFor();

  const roundTrip = await downloadJson(clean);
  assert.deepEqual(
    roundTrip.personal,
    backup.personal,
    'export → clean state → restore changed personal history',
  );
  return clean;
}

try {
  let page = await context.newPage();
  await page.goto(route('/'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Your atlas starts here' }).waitFor();
  console.log('[field] clean zero-dive mock root: ok');

  await logDive(page);
  await verifyCoherence(page);
  await verifyCollectionResponsive(page);
  await editDive(page);
  await verifySystemBack(page);
  console.log(
    '[field] create/edit + Home/Journal/Collection/Atlas + Collection viewport matrix + Back: ok',
  );

  await page.goto(route('/data'), { waitUntil: 'domcontentloaded' });
  const backup = await downloadJson(page);
  assert.equal(backup.personal.dives.length, 1);
  assert.equal(backup.personal.dives[0].siteName, 'Field Reef North');

  page = await restoreIntoCleanState(page, backup);
  console.log(
    '[field] export → clean state → validated replace restore equivalence: ok',
  );

  const diveId = backup.personal.dives[0].id;
  await page.goto(route(`/journal/${encodeURIComponent(diveId)}`), {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('heading', { name: 'Field Reef North' }).waitFor();
  await page.getByRole('button', { name: 'Delete dive' }).click();
  await page.getByText('Delete this dive?').waitFor();
  await page.getByRole('button', { name: /^Delete$/ }).click();
  await page.getByRole('heading', { name: 'No dives yet' }).waitFor();
  console.log('[field] delete + derived history cleanup: ok');

  const safeBottom = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Main"]');
    return nav ? Number.parseFloat(getComputedStyle(nav).paddingBottom) : 0;
  });
  assert.ok(
    safeBottom >= 16,
    'bottom navigation must retain safe-area-aware minimum padding',
  );
  await assertNoHorizontalOverflow(page, 'final Pixel viewport');
  console.log('[field] Pixel viewport composition + safe-area minimum: ok');
} finally {
  await context.close();
  await browser.close();
  await vite.close();
}

console.log('[field] zero-Firebase product-flow readiness probe passed');
