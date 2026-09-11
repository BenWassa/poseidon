/**
 * Renders the production build at phone size and saves screenshots.
 *
 * Tests prove behaviour; this proves composition. It serves `dist/`, seeds a
 * representative history into localStorage, and captures every screen at
 * Pixel-class portrait plus a short-landscape and a wide-screen check.
 *
 *   npm run build && npm run screenshots
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { launchOptions } from '../../../tools/chromium.mjs';
import { buildDemoState } from '../tools/demo-state.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '../dist');
const outputDir = process.env.POSEIDON_SHOTS
  ? resolve(process.env.POSEIDON_SHOTS)
  : resolve(here, '../../../docs/evidence');

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

async function resolveFile(pathname) {
  const candidate = join(
    distDir,
    pathname === '/' ? 'index.html' : decodeURIComponent(pathname),
  );
  try {
    const info = await stat(candidate);
    if (info.isFile()) return candidate;
  } catch {
    // Fall through to the SPA entry point.
  }
  return join(distDir, 'index.html');
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  void resolveFile(url.pathname).then((file) => {
    response.writeHead(200, {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
    });
    createReadStream(file).pipe(response);
  });
});

await new Promise((done) => server.listen(0, '127.0.0.1', done));
const { port } = server.address();
const origin = `http://127.0.0.1:${port}`;
const route = (path) => `${origin}/#${path}`;

const SCREENS = [
  { file: '01-home.jpg', path: '/' },
  { file: '02-journal.jpg', path: '/journal' },
  { file: '03-dive-detail.jpg', path: '/journal/dive_demo_3' },
  { file: '04-log-where.jpg', path: '/log' },
  { file: '05-log-creatures.jpg', path: '/log', prepare: 'creatures' },
  { file: '05b-log-memory.jpg', path: '/log', prepare: 'memory' },
  { file: '06-collection.jpg', path: '/collection' },
  { file: '07-creature-detail.jpg', path: '/collection/spotted-eagle-ray' },
  { file: '08-atlas.jpg', path: '/atlas' },
  { file: '09-place-detail.jpg', path: '/atlas/area%3AMX%3Acozumel' },
  { file: '10-data-backup.jpg', path: '/data' },
];

await mkdir(outputDir, { recursive: true });
const demo = buildDemoState();
const browser = await chromium.launch(launchOptions());

/** Seeds persisted history before the app boots, then waits for the shell. */
async function openPage({ width, height, seeded = true }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  await context.addInitScript(
    ([key, state, shouldSeed]) => {
      window.localStorage.clear();
      if (shouldSeed) window.localStorage.setItem(key, JSON.stringify(state));
    },
    [demo.storageKey, demo.state, seeded],
  );
  return { context, page: await context.newPage() };
}

/** Drives the real logging flow so later steps are shot with real state. */
async function advanceLogFlow(page, upTo) {
  await page.getByRole('button', { name: 'Cozumel' }).first().click();
  await page.getByLabel('Dive site').fill('Santa Rosa Wall');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Max depth').fill('26');
  await page.getByLabel('Duration').fill('44');
  await page.getByRole('button', { name: 'Choose creatures' }).click();
  await page.waitForTimeout(350);
  if (upTo === 'creatures') {
    await page
      .getByRole('button', { name: /Spotted eagle ray/ })
      .first()
      .click();
    await page
      .getByRole('button', { name: /Green sea turtle/ })
      .first()
      .click();
    await page.waitForTimeout(200);
    return;
  }
  await page
    .getByRole('button', { name: /Spotted eagle ray/ })
    .first()
    .click();
  await page
    .getByRole('button', { name: /Nurse shark/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(250);
}

async function capture(page, file) {
  // Artwork is lazy by design; settle the viewport before the shot.
  await page.waitForTimeout(450);
  // Retina capture, JPEG encoded: crisp enough to review, small enough to keep
  // in the repository as durable evidence.
  await page.screenshot({
    path: join(outputDir, file),
    fullPage: false,
    quality: 82,
    type: 'jpeg',
  });
  console.log(`[shots] ${file}`);
}

try {
  for (const screen of SCREENS) {
    const { context, page } = await openPage({ width: 412, height: 915 });
    await page.goto(route(screen.path), { waitUntil: 'networkidle' });
    if (screen.prepare) await advanceLogFlow(page, screen.prepare);
    await capture(page, screen.file);
    await context.close();
  }

  // Empty profile: the state a real first run starts from.
  {
    const { context, page } = await openPage({
      width: 412,
      height: 915,
      seeded: false,
    });
    await page.goto(route('/'), { waitUntil: 'networkidle' });
    await capture(page, '11-home-empty.jpg');
    await page.goto(route('/collection'), { waitUntil: 'networkidle' });
    await capture(page, '12-collection-empty.jpg');
    await context.close();
  }

  // Short landscape and a wide screen, which must stay a phone column.
  {
    const { context, page } = await openPage({ width: 915, height: 412 });
    await page.goto(route('/'), { waitUntil: 'networkidle' });
    await capture(page, '13-landscape.jpg');
    await context.close();
  }
  {
    const { context, page } = await openPage({ width: 1280, height: 800 });
    await page.goto(route('/journal'), { waitUntil: 'networkidle' });
    await capture(page, '14-wide.jpg');
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(`[shots] written to ${outputDir}`);
