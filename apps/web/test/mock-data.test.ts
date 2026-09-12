import { describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_MOCK_PRESET,
  MOCK_PRESETS,
  createMockStore,
  resolveMockPreset,
} from '../src/dev/mock-data';
import { isMockMode } from '../src/dev/mode';

describe('development mock data', () => {
  it.each(MOCK_PRESETS)('builds exactly %i seeded dives', async (preset) => {
    const store = await createMockStore(preset);
    expect(await store.listDives()).toHaveLength(preset);
  });

  it('is deterministic across repeated construction', async () => {
    const first = await createMockStore(15);
    const second = await createMockStore(15);

    expect((await first.exportData()).personal).toEqual(
      (await second.exportData()).personal,
    );
  });

  it('keeps smaller presets as prefixes of the larger history', async () => {
    const sparse = await createMockStore(3);
    const dense = await createMockStore(30);
    const denseIds = new Set((await dense.listDives()).map((dive) => dive.id));

    for (const dive of await sparse.listDives()) {
      expect(denseIds.has(dive.id)).toBe(true);
    }
  });

  it('resolves every seeded sighting through canonical content or an explicit user creature', async () => {
    const store = await createMockStore(30);
    const creatureById = new Map(
      (await store.listCreatures()).map((creature) => [creature.id, creature]),
    );

    for (const dive of await store.listDives()) {
      for (const sighting of dive.sightings) {
        expect(creatureById.has(sighting.creatureId)).toBe(true);
      }
      if (dive.highlightCreatureId) {
        expect(creatureById.has(dive.highlightCreatureId)).toBe(true);
      }
    }

    expect(
      [...creatureById.values()].some(
        (creature) =>
          creature.userCreated && creature.commonName === 'Tiny mystery nudibranch',
      ),
    ).toBe(true);
  });

  it('supports normal mutations in-session and reconstructs the canonical seed', async () => {
    const store = await createMockStore(3);
    const [latest] = await store.listDives();
    expect(latest).toBeDefined();

    await store.updateDive(latest!.id, { note: 'Temporary mock edit.' });
    expect((await store.getDive(latest!.id))?.note).toBe('Temporary mock edit.');

    await store.deleteDive(latest!.id);
    expect(await store.listDives()).toHaveLength(2);

    const creature = (await store.listCreatures())[0]!;
    await store.createDive({
      date: '2026-09-11',
      siteName: 'Temporary Test Reef',
      areaName: 'Cozumel',
      countryCode: 'MX',
      maxDepth: { value: 12, unit: 'm' },
      durationMinutes: 35,
      sightings: [{ creatureId: creature.id }],
    });
    expect(await store.listDives()).toHaveLength(3);

    const reconstructed = await createMockStore(3);
    expect(await reconstructed.listDives()).toHaveLength(3);
    expect(
      (await reconstructed.listDives()).some(
        (dive) => dive.siteName === 'Temporary Test Reef',
      ),
    ).toBe(false);
  });

  it('uses the 15-dive preset by default and rejects unsupported selectors safely', () => {
    expect(resolveMockPreset('')).toBe(DEFAULT_MOCK_PRESET);
    expect(resolveMockPreset('?mock=0')).toBe(0);
    expect(resolveMockPreset('?mock=30')).toBe(30);

    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveMockPreset('?mock=7')).toBe(DEFAULT_MOCK_PRESET);
    expect(warning).toHaveBeenCalledOnce();
  });

  it('cannot enable mock bootstrap in a production build', () => {
    expect(isMockMode(true, 'mock')).toBe(true);
    expect(isMockMode(true, 'development')).toBe(false);
    expect(isMockMode(false, 'mock')).toBe(false);
  });
});
