import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const webRoot = fileURLToPath(new URL('..', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));

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
          `(?:bg|text|border|ring|from|via|to)-${retired}(?:[/\\s"'\\`]|$)`,
        ),
      );
    }
    for (const fill of ['coral', 'lagoon', 'sun']) {
      expect(source).not.toMatch(new RegExp(`bg-${fill}[^"'\\`]*text-white`));
    }
    expect(source).not.toContain('text-lagoon');
  });

  it('keeps obsolete expressive hex values out of live brand/UI code', () => {
    const live = [
      sourceText(join(webRoot, 'src')),
      readFileSync(join(webRoot, 'vite.config.ts'), 'utf8'),
      readFileSync(join(webRoot, 'index.html'), 'utf8'),
      readFileSync(join(repoRoot, 'tools/brand/build.mjs'), 'utf8'),
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

  it('keeps PWA chrome and icon generation on the locked palette', () => {
    const vite = readFileSync(join(webRoot, 'vite.config.ts'), 'utf8');
    const html = readFileSync(join(webRoot, 'index.html'), 'utf8');
    const generator = readFileSync(
      join(repoRoot, 'tools/brand/build.mjs'),
      'utf8',
    );
    expect(vite.match(/#F3FAFA/g)).toHaveLength(2);
    expect(html).toContain('content="#F3FAFA"');
    for (const value of [
      BRAND.marine,
      BRAND.abyss,
      BRAND.lagoon,
      BRAND.coral,
    ]) {
      expect(generator).toContain(value);
    }
  });
});
