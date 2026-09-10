/**
 * Integrity of the seam between the repository's marine content pack, the
 * creature asset pipeline and the application.
 *
 * These are the assertions that catch a content or asset change silently
 * breaking the product without anyone opening the app.
 */
import { describe, expect, it } from 'vitest';

import { contentMeta, contentPack, creatures, curatedAreas, curatedSites, places, regions } from '../src/data/content';

describe('the Mexican Caribbean content pack', () => {
  it('loads every creature with a stable unique id', () => {
    expect(creatures.length).toBeGreaterThanOrEqual(50);
    expect(new Set(creatures.map((creature) => creature.id)).size).toBe(creatures.length);
    for (const creature of creatures) {
      expect(creature.commonName.trim()).not.toBe('');
      expect(creature.curated).toBe(true);
    }
  });

  it('loads sites and regions the logging flow can suggest from', () => {
    expect(curatedSites.length).toBeGreaterThanOrEqual(20);
    expect(places.length).toBe(curatedSites.length);
    expect(curatedAreas.map((area) => area.name)).toEqual(
      expect.arrayContaining(['Cozumel', 'Playa del Carmen']),
    );
    for (const site of curatedSites) {
      expect(site.areaName).not.toBe('');
      expect(regions.some((region) => region.id === site.regionId)).toBe(true);
    }
  });

  it('gives Cozumel and Playa del Carmen their own local creature sets', () => {
    const cozumel = creatures.filter((creature) => creature.regionIds?.includes('mx-caribbean-cozumel'));
    const playa = creatures.filter((creature) =>
      creature.regionIds?.includes('mx-caribbean-playa-del-carmen'),
    );
    expect(cozumel.length).toBeGreaterThan(10);
    expect(playa.length).toBeGreaterThan(10);
  });

  it('carries researched creature provenance into runtime content', () => {
    const eagleRay = creatures.find((creature) => creature.id === 'spotted-eagle-ray');
    expect(eagleRay?.provenance?.length).toBeGreaterThan(0);
    expect(eagleRay?.provenance?.some((entry) => entry.source.includes('REEF'))).toBe(true);

    for (const entry of eagleRay?.provenance ?? []) {
      expect(entry.source.trim()).not.toBe('');
      expect(entry.note).toMatch(/accessed \d{4}-\d{2}-\d{2}/);
      if (entry.url) expect(entry.url).toMatch(/^https:\/\//);
    }
  });

  it('wires asset-pipeline variants onto the creatures that have artwork', () => {
    const illustrated = creatures.filter((creature) => creature.artwork?.status === 'curated');
    expect(illustrated.length).toBe(contentMeta.curatedArtworkCount);
    expect(illustrated.length).toBeGreaterThanOrEqual(12);

    for (const creature of illustrated) {
      const artwork = creature.artwork;
      expect(artwork?.thumb).toBe(`/assets/creatures/${creature.id}/thumb.webp`);
      expect(artwork?.gallery).toBe(`/assets/creatures/${creature.id}/gallery.webp`);
      expect(artwork?.hero).toBe(`/assets/creatures/${creature.id}/hero.webp`);
      // Fixed square geometry lets the UI reserve space before loading.
      expect(artwork?.aspectRatio).toBe(1);
    }
  });

  it('leaves the rest in an explicit no-artwork state rather than a broken link', () => {
    const unillustrated = creatures.filter((creature) => creature.artwork?.status !== 'curated');
    expect(unillustrated.length).toBeGreaterThan(0);
    for (const creature of unillustrated) {
      expect(creature.artwork?.thumb).toBeUndefined();
      expect(creature.artwork?.gallery).toBeUndefined();
      expect(creature.artwork?.hero).toBeUndefined();
    }
  });

  it('never references a remote host for anything the product needs', () => {
    const references = creatures.flatMap((creature) => [
      creature.artwork?.thumb,
      creature.artwork?.gallery,
      creature.artwork?.hero,
    ]);
    for (const reference of references) {
      if (!reference) continue;
      expect(reference.startsWith('/')).toBe(true);
      expect(reference).not.toMatch(/^https?:/);
    }
  });

  it('exposes the pack to the store as content, not as application code', () => {
    expect(contentPack.creatures).toBe(creatures);
    expect(contentPack.regions).toBe(regions);
    expect(contentPack.places).toBe(places);
    expect(contentMeta.sourceCount).toBeGreaterThan(0);
  });
});
