/**
 * Builds Poseidon's curated creature artwork.
 *
 *   1. writes the hand-authored SVG source art to tools/creature_art/svg/
 *   2. rasterises each SVG to a transparent 1024x1024 PNG with Chromium
 *   3. hands the PNG to the repository asset pipeline (tools/creature_assets)
 *      which owns variant generation, manifests and validation
 *
 * The application never consumes these SVGs directly: it consumes the
 * thumb/gallery/hero WebP variants the pipeline produces, which is what proves
 * the asset contract from issue #6.
 */
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import { launchOptions } from '../chromium.mjs';
import { creatures, renderCreature } from './creatures.mjs';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const svgDir = join(here, 'svg');
const assetRoot = join(repoRoot, 'assets/creatures');

const only = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
const svgOnly = process.argv.includes('--svg-only');
const selected = only.length > 0 ? creatures.filter((c) => only.includes(c.id)) : creatures;

if (selected.length === 0) {
  console.error(`No creature art matched: ${only.join(', ')}`);
  process.exit(1);
}

await mkdir(svgDir, { recursive: true });
for (const entry of selected) {
  await writeFile(join(svgDir, `${entry.id}.svg`), `${renderCreature(entry)}\n`, 'utf8');
}
console.log(`[art] wrote ${selected.length} SVG source files to ${svgDir}`);

if (svgOnly) process.exit(0);

const { chromium } = await import('playwright');
const work = await mkdtemp(join(tmpdir(), 'poseidon-art-'));
const browser = await chromium.launch(launchOptions());
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  for (const entry of selected) {
    const svg = renderCreature(entry);
    await page.setContent(
      `<style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>${svg}`,
      { waitUntil: 'load' },
    );
    const png = join(work, `${entry.id}.png`);
    await page.screenshot({ path: png, omitBackground: true, clip: { x: 0, y: 0, width: 1024, height: 1024 } });
    await run('python3', ['-m', 'tools.creature_assets', 'ingest', '--id', entry.id, '--source', png, '--root', assetRoot, '--force'], {
      cwd: repoRoot,
    });
    console.log(`[art] ingested ${entry.id}`);
  }
} finally {
  await browser.close();
  await rm(work, { recursive: true, force: true });
}

await run('python3', ['-m', 'tools.creature_assets', 'validate', '--root', assetRoot], { cwd: repoRoot });
console.log(`[art] validated ${assetRoot}`);
