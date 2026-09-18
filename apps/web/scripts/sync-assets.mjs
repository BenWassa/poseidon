// Mounts canonical repository asset trees into the web application's static
// directory. Creature assets remain owned by their guarded pipeline; brand
// media is kept alongside them so generated public files are never authoritative.
import { cp, rm, mkdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const mounts = [
  {
    source: resolve(here, '../../../assets/creatures'),
    target: resolve(here, '../public/assets/creatures'),
  },
  {
    source: resolve(here, '../../../assets/brand'),
    target: resolve(here, '../public/assets/brand'),
  },
];

for (const { source, target } of mounts) {
  try {
    await access(source);
  } catch {
    console.warn(`[sync-assets] no assets at ${source}; skipping.`);
    continue;
  }

  await rm(target, { recursive: true, force: true });
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
  console.log(`[sync-assets] mounted ${source} -> ${target}`);
}
