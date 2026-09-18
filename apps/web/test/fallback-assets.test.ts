import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { SILHOUETTE_KINDS } from '../src/components/creatureSilhouettes';

interface SilhouetteAsset {
  path: string;
  bytes: number;
  sha256: string;
}

interface SilhouetteManifest {
  schemaVersion: number;
  pixelSize: number;
  format: string;
  assets: Record<string, SilhouetteAsset>;
}

const assetRoot = new URL(
  '../../../assets/fallbacks/marine-life/',
  import.meta.url,
);

async function readManifest(): Promise<SilhouetteManifest> {
  return JSON.parse(
    await readFile(new URL('manifest.json', assetRoot), 'utf8'),
  ) as SilhouetteManifest;
}

describe('marine fallback silhouette assets', () => {
  it('contains exactly the raster families the UI can request', async () => {
    const manifest = await readManifest();

    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.pixelSize).toBe(384);
    expect(manifest.format).toBe('webp');
    expect(Object.keys(manifest.assets).sort()).toEqual(
      [...SILHOUETTE_KINDS].sort(),
    );
  });

  it('commits every family as a real hashed WebP file', async () => {
    const manifest = await readManifest();

    for (const kind of SILHOUETTE_KINDS) {
      const entry = manifest.assets[kind];
      expect(entry, kind).toBeDefined();
      expect(entry.path, kind).toBe(`${kind}.webp`);

      const bytes = await readFile(new URL(entry.path, assetRoot));
      expect(bytes.length, kind).toBe(entry.bytes);
      expect(bytes.subarray(0, 4).toString('ascii'), kind).toBe('RIFF');
      expect(bytes.subarray(8, 12).toString('ascii'), kind).toBe('WEBP');
      expect(createHash('sha256').update(bytes).digest('hex'), kind).toBe(
        entry.sha256,
      );
    }
  });
});
