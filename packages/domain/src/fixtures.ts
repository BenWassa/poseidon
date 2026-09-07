import type { CreateDiveInput, Creature, PoseidonContent, Region } from './domain.js';
import type { PersistedPersonalStateV2, PersistenceAdapter } from './persistence.js';
import { deepClone } from './utils.js';

/**
 * Synthetic fixtures for development and contract testing only.
 * They are intentionally not sourced marine content and must not be shipped as the production catalogue.
 */
export const fixtureRegions: Region[] = [
  { id: 'region-mx-caribbean', name: 'Mexican Caribbean', countryCode: 'MX' },
  { id: 'region-cozumel', name: 'Cozumel', countryCode: 'MX', parentRegionId: 'region-mx-caribbean' },
  { id: 'region-playa', name: 'Playa del Carmen', countryCode: 'MX', parentRegionId: 'region-mx-caribbean' },
];

export const fixtureCreatures: Creature[] = [
  'Green sea turtle',
  'Hawksbill turtle',
  'Spotted eagle ray',
  'Southern stingray',
  'Nurse shark',
  'Barracuda',
  'Moray eel',
  'Pufferfish',
  'Porcupinefish',
  'French angelfish',
  'Queen angelfish',
  'Parrotfish',
  'Sergeant major',
  'Trumpetfish',
  'Grouper',
  'Caribbean reef squid',
].map((commonName, index) => ({
  id: `fixture-creature-${index + 1}`,
  commonName,
  curated: true,
  regionIds: index < 12 ? ['region-cozumel', 'region-mx-caribbean'] : ['region-mx-caribbean'],
  artwork: { status: index % 3 === 0 ? 'placeholder' : 'missing' },
}));

export const fixtureContent: PoseidonContent = {
  creatures: fixtureCreatures,
  regions: fixtureRegions,
  places: [],
};

export const fixtureDiveInputs: CreateDiveInput[] = [
  ['2026-09-01', 'Fixture Reef A', 'Cozumel', 18, 47, [0, 5, 9]],
  ['2026-09-01', 'Fixture Reef B', 'Cozumel', 14, 51, [1, 6]],
  ['2026-09-02', 'Fixture Reef A', 'Cozumel', 21, 44, [0, 2, 5, 11]],
  ['2026-09-03', 'Fixture Wall', 'Cozumel', 24, 42, [1]],
  ['2026-09-04', 'Fixture Garden', 'Playa del Carmen', 16, 49, [3, 8, 10]],
  ['2026-09-04', 'Fixture Ledge', 'Playa del Carmen', 19, 45, [4, 7]],
  ['2026-09-05', 'Fixture Garden', 'Playa del Carmen', 15, 52, [3, 12, 13]],
  ['2026-09-06', 'Fixture Reef C', 'Cozumel', 20, 48, [0, 14, 15]],
].map(([date, siteName, areaName, depth, duration, creatureIndexes]) => {
  const regionId = areaName === 'Cozumel' ? 'region-cozumel' : 'region-playa';
  return {
    date: date as string,
    siteName: siteName as string,
    areaName: areaName as string,
    countryCode: 'MX',
    regionId,
    maxDepth: { value: depth as number, unit: 'm' },
    durationMinutes: duration as number,
    sightings: (creatureIndexes as number[]).map((index) => ({ creatureId: fixtureCreatures[index]!.id })),
  } satisfies CreateDiveInput;
});

export class MemoryPersistence implements PersistenceAdapter {
  private value: unknown | null;

  constructor(seed: unknown | null = null) {
    this.value = deepClone(seed);
  }

  async read(): Promise<unknown | null> {
    return deepClone(this.value);
  }

  async write(state: PersistedPersonalStateV2): Promise<void> {
    this.value = deepClone(state);
  }

  async remove(): Promise<void> {
    this.value = null;
  }

  inspect(): unknown | null {
    return deepClone(this.value);
  }
}
