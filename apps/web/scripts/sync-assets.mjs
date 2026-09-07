// Mounts the canonical repository creature-asset tree (assets/creatures) into the
// web application's static directory. The pipeline in tools/creature_assets owns
// the canonical tree; the application only mounts it where Vite expects statics.
import { cp, rm, mkdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../../../assets/creatures');
const target = resolve(here, '../public/assets/creatures');

try {
  await access(source);
} catch {
  console.warn(`[sync-assets] no creature assets at ${source}; skipping.`);
  process.exit(0);
}

await rm(target, { recursive: true, force: true });
await mkdir(dirname(target), { recursive: true });
await cp(source, target, { recursive: true });
console.log(`[sync-assets] mounted ${source} -> ${target}`);
