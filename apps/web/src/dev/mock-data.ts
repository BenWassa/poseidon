import {
  MemoryPersistence,
  createPoseidonStore,
  type PoseidonStore,
} from '@poseidon/domain';

import { PoseidonClient } from '../data/client';
import { contentPack, creatures, curatedSites } from '../data/content';

export const MOCK_PRESETS = [0, 3, 5, 15, 30] as const;
export type MockPreset = (typeof MOCK_PRESETS)[number];

export const DEFAULT_MOCK_PRESET: MockPreset = 15;
const CUSTOM_CREATURE_NAME = 'Tiny mystery nudibranch';

interface MockDiveSeed {
  date: string;
  site: string;
  depth: number;
  duration: number;
  creatures: string[];
  highlight?: string;
  note?: string;
  operator?: string;
  buddies?: string[];
}

/**
 * One deterministic 30-dive history. Smaller presets are prefixes of this
 * sequence so screen differences reflect added history rather than random data.
 */
export const MOCK_DIVE_SEQUENCE: readonly MockDiveSeed[] = [
  {
    date: '2026-05-18',
    site: 'Palancar Gardens',
    depth: 18,
    duration: 52,
    creatures: [
      'Hawksbill sea turtle',
      'Queen angelfish',
      'Stoplight parrotfish',
    ],
    highlight: 'Hawksbill sea turtle',
    note: 'Clear water and an unhurried first drift through the coral heads.',
    operator: 'Poseidon Demo Diving',
    buddies: ['Alex'],
  },
  {
    date: '2026-05-18',
    site: 'Santa Rosa Wall',
    depth: 24,
    duration: 46,
    creatures: ['Green sea turtle', 'Great barracuda', 'Spotted eagle ray'],
    highlight: 'Spotted eagle ray',
    operator: 'Poseidon Demo Diving',
    buddies: ['Alex'],
  },
  {
    date: '2026-05-19',
    site: 'Paso del Cedral',
    depth: 20,
    duration: 49,
    creatures: ['Splendid toadfish', 'French angelfish', 'Green moray'],
    highlight: 'Splendid toadfish',
    note: 'Found the toadfish tucked well back under a ledge.',
    operator: 'Poseidon Demo Diving',
  },
  {
    date: '2026-06-12',
    site: 'Tortugas',
    depth: 16,
    duration: 51,
    creatures: ['Green sea turtle', 'Southern stingray', 'Nurse shark'],
    highlight: 'Nurse shark',
    buddies: ['Maya'],
  },
  {
    date: '2026-06-12',
    site: 'Moc-Che',
    depth: 14,
    duration: 54,
    creatures: ['Blue tang', 'Queen angelfish', 'Trumpetfish'],
    highlight: 'Trumpetfish',
    note: 'Long shallow finish with schools moving over the reef.',
    buddies: ['Maya'],
  },
  {
    date: '2026-06-13',
    site: 'Pared Verde',
    depth: 25,
    duration: 43,
    creatures: ['Nurse shark', 'Black grouper', 'Southern stingray'],
    highlight: 'Black grouper',
  },
  {
    date: '2026-06-13',
    site: 'Sabalos Reef',
    depth: 13,
    duration: 56,
    creatures: ['French grunt', 'Sergeant major', 'Yellowtail snapper'],
    highlight: 'French grunt',
    note: 'Dense fish life across the shallower section.',
  },
  {
    date: '2026-07-04',
    site: 'Colombia Reef',
    depth: 27,
    duration: 44,
    creatures: ['Spotted eagle ray', 'Hawksbill sea turtle', 'Great barracuda'],
    highlight: 'Spotted eagle ray',
    buddies: ['Alex', 'Maya'],
  },
  {
    date: '2026-07-04',
    site: 'Palancar Caves',
    depth: 23,
    duration: 48,
    creatures: ['Spotted trunkfish', 'Queen angelfish', 'Blue chromis'],
    highlight: 'Spotted trunkfish',
    buddies: ['Alex', 'Maya'],
  },
  {
    date: '2026-07-05',
    site: 'La Francesa',
    depth: 17,
    duration: 53,
    creatures: ['Porcupinefish', 'Green sea turtle', 'Schoolmaster snapper'],
    highlight: 'Porcupinefish',
    note: 'A very calm drift with the turtle staying nearby for several minutes.',
  },
  {
    date: '2026-07-05',
    site: 'Tormentos',
    depth: 19,
    duration: 50,
    creatures: ['Spanish hogfish', 'Porkfish', 'Yellowhead wrasse'],
    highlight: 'Spanish hogfish',
  },
  {
    date: '2026-07-06',
    site: 'Yucab Reef',
    depth: 15,
    duration: 55,
    creatures: ['Caribbean reef squid', 'Blue tang', 'Queen parrotfish'],
    highlight: 'Caribbean reef squid',
    note: 'Squid held position in a loose group above the reef.',
  },
  {
    date: '2026-08-10',
    site: 'Mama Viña Wreck',
    depth: 26,
    duration: 42,
    creatures: ['Great barracuda', 'Nurse shark', 'Ocean surgeonfish'],
    highlight: 'Great barracuda',
    operator: 'Poseidon Demo Diving',
  },
  {
    date: '2026-08-10',
    site: 'Paradise Deep',
    depth: 28,
    duration: 41,
    creatures: ['Nassau grouper', 'Southern stingray', 'Blue tang'],
    highlight: 'Nassau grouper',
    operator: 'Poseidon Demo Diving',
  },
  {
    date: '2026-08-11',
    site: 'Cerebros',
    depth: 18,
    duration: 50,
    creatures: ['Spotted trunkfish', CUSTOM_CREATURE_NAME, 'Foureye butterflyfish'],
    highlight: CUSTOM_CREATURE_NAME,
    note: 'Tiny unfamiliar nudibranch on a shaded patch of reef — logged for later identification.',
  },
  {
    date: '2026-08-11',
    site: 'Chunzumblul',
    depth: 12,
    duration: 58,
    creatures: ['Sharpnose puffer', 'Banded butterflyfish', 'French angelfish'],
    highlight: 'Sharpnose puffer',
  },
  {
    date: '2026-08-12',
    site: 'Barracuda Reef',
    depth: 21,
    duration: 47,
    creatures: ['Great barracuda', 'Hogfish', 'Queen angelfish'],
    highlight: 'Great barracuda',
    buddies: ['Maya'],
  },
  {
    date: '2026-08-12',
    site: 'Moc-Che Deep',
    depth: 29,
    duration: 40,
    creatures: ['Nurse shark', 'Black grouper', 'Spotted eagle ray'],
    highlight: 'Nurse shark',
    buddies: ['Maya'],
  },
  {
    date: '2026-09-01',
    site: 'Punta Tunich',
    depth: 22,
    duration: 48,
    creatures: ['Hawksbill sea turtle', 'Blue tang', 'Great barracuda'],
    highlight: 'Hawksbill sea turtle',
  },
  {
    date: '2026-09-01',
    site: 'San Francisco Wall',
    depth: 26,
    duration: 44,
    creatures: ['Spotted eagle ray', 'Queen angelfish', 'Bar jack'],
    highlight: 'Spotted eagle ray',
    note: 'Strong but steady drift along the wall.',
  },
  {
    date: '2026-09-02',
    site: 'Dalila',
    depth: 16,
    duration: 54,
    creatures: ['Caribbean reef squid', 'Spotted moray', 'Princess parrotfish'],
    highlight: 'Caribbean reef squid',
  },
  {
    date: '2026-09-02',
    site: 'Paraíso',
    depth: 12,
    duration: 59,
    creatures: ['Honeycomb cowfish', 'Sergeant major', 'Yellowtail damselfish'],
    highlight: 'Honeycomb cowfish',
  },
  {
    date: '2026-09-03',
    site: 'C-53 Felipe Xicoténcatl',
    depth: 25,
    duration: 43,
    creatures: ['Great barracuda', 'Green moray', 'French grunt'],
    highlight: 'Green moray',
    buddies: ['Alex'],
  },
  {
    date: '2026-09-03',
    site: 'Palancar Horseshoe',
    depth: 24,
    duration: 45,
    creatures: ['Splendid toadfish', 'Hawksbill sea turtle', 'Rock beauty'],
    highlight: 'Splendid toadfish',
    buddies: ['Alex'],
  },
  {
    date: '2026-09-08',
    site: 'Tortugas',
    depth: 15,
    duration: 55,
    creatures: ['Green sea turtle', 'Southern stingray', 'Queen angelfish'],
    highlight: 'Green sea turtle',
    note: 'Several turtles spread across the reef during the second half.',
  },
  {
    date: '2026-09-08',
    site: 'Pared Verde',
    depth: 24,
    duration: 46,
    creatures: ['Nurse shark', CUSTOM_CREATURE_NAME, 'Trumpetfish'],
    highlight: 'Nurse shark',
  },
  {
    date: '2026-09-09',
    site: 'Moc-Che',
    depth: 14,
    duration: 57,
    creatures: ['Blue tang', 'Foureye butterflyfish', 'Yellowtail snapper'],
    highlight: 'Blue tang',
  },
  {
    date: '2026-09-09',
    site: 'Sabalos Reef',
    depth: 13,
    duration: 58,
    creatures: ['Spanish hogfish', 'French grunt', 'Southern stingray'],
    highlight: 'Spanish hogfish',
  },
  {
    date: '2026-09-10',
    site: 'Mama Viña Wreck',
    depth: 27,
    duration: 42,
    creatures: ['Great barracuda', 'Nassau grouper', 'Ocean surgeonfish'],
    highlight: 'Nassau grouper',
    buddies: ['Maya'],
  },
  {
    date: '2026-09-10',
    site: 'Paradise Deep',
    depth: 28,
    duration: 41,
    creatures: ['Spotted eagle ray', 'Nurse shark', 'Black grouper'],
    highlight: 'Spotted eagle ray',
    note: 'Final dive of the trip; eagle ray passed above the sand at the edge of the reef.',
    buddies: ['Maya'],
  },
] as const;

function isMockPreset(value: number): value is MockPreset {
  return (MOCK_PRESETS as readonly number[]).includes(value);
}

export function resolveMockPreset(search: string): MockPreset {
  const raw = new URLSearchParams(search).get('mock');
  if (raw === null || raw === '') return DEFAULT_MOCK_PRESET;
  const parsed = Number(raw);
  if (Number.isInteger(parsed) && isMockPreset(parsed)) return parsed;
  console.warn(
    `[poseidon] unsupported mock preset "${raw}"; using ${DEFAULT_MOCK_PRESET}. Expected one of ${MOCK_PRESETS.join(', ')}.`,
  );
  return DEFAULT_MOCK_PRESET;
}

function requiredSite(name: string) {
  const site = curatedSites.find((candidate) => candidate.name === name);
  if (!site) throw new Error(`Mock seed requires missing canonical site: ${name}`);
  return site;
}

function requiredCreatureId(name: string): string {
  const creature = creatures.find((candidate) => candidate.commonName === name);
  if (!creature) {
    throw new Error(`Mock seed requires missing canonical creature: ${name}`);
  }
  return creature.id;
}

function deterministicNow() {
  let tick = 0;
  const base = Date.parse('2026-09-11T12:00:00.000Z');
  return () => new Date(base + tick++ * 1000).toISOString();
}

function deterministicIdGenerator() {
  const counts = { dive: 0, sighting: 0, creature: 0 };
  return (prefix: 'dive' | 'sighting' | 'creature') => {
    counts[prefix] += 1;
    return `${prefix}-mock-${String(counts[prefix]).padStart(3, '0')}`;
  };
}

async function creatureIdForSeed(
  store: PoseidonStore,
  name: string,
): Promise<string> {
  if (name !== CUSTOM_CREATURE_NAME) return requiredCreatureId(name);
  return (await store.createUserCreature(CUSTOM_CREATURE_NAME)).id;
}

export async function createMockStore(preset: MockPreset): Promise<PoseidonStore> {
  const store = createPoseidonStore({
    persistence: new MemoryPersistence(),
    content: contentPack,
    now: deterministicNow(),
    idGenerator: deterministicIdGenerator(),
  });

  for (const seed of MOCK_DIVE_SEQUENCE.slice(0, preset)) {
    const site = requiredSite(seed.site);
    const creatureIds = await Promise.all(
      seed.creatures.map((name) => creatureIdForSeed(store, name)),
    );
    const highlightCreatureId = seed.highlight
      ? await creatureIdForSeed(store, seed.highlight)
      : undefined;

    await store.createDive({
      date: seed.date,
      siteName: site.name,
      areaName: site.areaName,
      ...(site.countryCode ? { countryCode: site.countryCode } : {}),
      regionId: site.regionId,
      ...(site.coordinates
        ? {
            coordinates: {
              lat: site.coordinates.lat,
              lng: site.coordinates.lng,
            },
          }
        : {}),
      maxDepth: { value: seed.depth, unit: 'm' },
      durationMinutes: seed.duration,
      ...(seed.operator ? { operator: seed.operator } : {}),
      ...(seed.buddies ? { buddies: [...seed.buddies] } : {}),
      ...(seed.note ? { note: seed.note } : {}),
      sightings: creatureIds.map((creatureId) => ({ creatureId })),
      ...(highlightCreatureId ? { highlightCreatureId } : {}),
    });
  }

  return store;
}

export async function createMockPoseidonClient(
  preset: MockPreset,
): Promise<PoseidonClient> {
  return new PoseidonClient(await createMockStore(preset));
}
