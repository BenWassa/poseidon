import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const webRoot = process.cwd();
const repoRoot = join(webRoot, '../..');
const ICON_SOURCE_SHA256 =
  'c3bebef7794cb00f1987d6ac52bec98e6d8e84377551674fa640a0ba3208e028';

const BRAND = {
  abyss: '#05323F',
  marine: '#087EA4',
  lagoon: '#34B6A4',
  coral: '#F7735C',
  sun: '#EFC15E',
  canvas: '#F3FAFA',
  shell: '#FFF8EC',
} as const;

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map(
    (start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255,
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function contrast(a: string, b: string): number {
  const [bright, dark] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (bright! + 0.05) / (dark! + 0.05);
}

function sourceText(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return sourceText(path);
      return ['.ts', '.tsx', '.css'].includes(extname(path))
        ? readFileSync(path, 'utf8')
        : '';
    })
    .join('\n');
}

function iconSourcePayload(): Buffer {
  const sourceDirectory = join(repoRoot, 'tools/brand/source');
  const encoded = readdirSync(sourceDirectory)
    .filter((name) => name.startsWith('app-icon-master.b64.'))
    .sort()
    .map((name) => readFileSync(join(sourceDirectory, name), 'utf8').trim())
    .join('');
  return Buffer.from(encoded, 'base64');
}

describe('Sunlit Reef brand contract', () => {
  it('keeps the locked anchors in the single CSS token authority', () => {
    const css = readFileSync(join(webRoot, 'src/index.css'), 'utf8').toLowerCase();
    for (const [token, value] of Object.entries(BRAND)) {
      expect(css).toContain(`--color-${token}: ${value.toLowerCase()};`);
    }
  });

  it('keeps required normal-text pairings at WCAG AA contrast', () => {
    expect(contrast('#FFFFFF', BRAND.marine)).toBeGreaterThanOrEqual(4.5);
    for (const background of [
      BRAND.lagoon,
      BRAND.coral,
      BRAND.sun,
      BRAND.canvas,
      BRAND.shell,
    ]) {
      expect(contrast(BRAND.abyss, background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast('#FFFFFF', '#A73931')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#176B55', '#E7F5EF')).toBeGreaterThanOrEqual(4.5);
  });

  it('does not reintroduce retired palette tokens or unsafe white-on-brand fills', () => {
    const source = sourceText(join(webRoot, 'src'));
    for (const retired of [
      'tide',
      'foam',
      'shallows',
      'ocean',
      'reef',
      'sand',
    ]) {
      expect(source).not.toMatch(
        new RegExp(
          `(?:bg|text|border|ring|from|via|to)-${retired}(?:[/\\s"']|$)`,
        ),
      );
    }
    for (const fill of ['coral', 'lagoon', 'sun']) {
      const hasUnsafePairing = source
        .split(/["'`]/)
        .some(
          (segment) =>
            segment.includes(`bg-${fill}`) && segment.includes('text-white'),
        );
      expect(hasUnsafePairing).toBe(false);
    }
    expect(source).not.toContain('text-lagoon');
  });

  it('keeps obsolete expressive hex values out of live brand/UI code', () => {
    const live = [
      sourceText(join(webRoot, 'src')),
      readFileSync(join(webRoot, 'vite.config.ts'), 'utf8'),
      readFileSync(join(webRoot, 'index.html'), 'utf8'),
      readFileSync(join(repoRoot, 'tools/brand/build.py'), 'utf8'),
    ]
      .join('\n')
      .toUpperCase();
    for (const old of [
      '#F2FBFC',
      '#118AB2',
      '#084C61',
      '#17C3B2',
      '#06D6A0',
      '#FF6B6B',
      '#F2B21E',
    ]) {
      expect(live).not.toContain(old);
    }
  });

  it('keeps PWA chrome and the owner-approved icon source locked', () => {
    const vite = readFileSync(join(webRoot, 'vite.config.ts'), 'utf8');
    const html = readFileSync(join(webRoot, 'index.html'), 'utf8');
    const generator = readFileSync(join(repoRoot, 'tools/brand/build.py'), 'utf8');
    const digest = createHash('sha256').update(iconSourcePayload()).digest('hex');

    expect(vite.match(/#F3FAFA/g)).toHaveLength(2);
    expect(html).toContain('content="#F3FAFA"');
    expect(html).toContain('%BASE_URL%icons/apple-touch-icon.png');
    expect(html).toContain('%BASE_URL%icons/favicon-32.png');
    expect(html).toContain('%BASE_URL%icons/favicon-64.png');
    expect(digest).toBe(ICON_SOURCE_SHA256);
    expect(generator).toContain(`SOURCE_SHA256 = '${ICON_SOURCE_SHA256}'`);
    expect(generator).toContain('MASKABLE_SCALE = 0.82');
  });
});
