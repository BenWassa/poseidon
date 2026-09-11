/**
 * A representative personal history for rendered review.
 *
 * This is developer tooling, not application code: nothing here is bundled or
 * reachable from the product. It writes the same persisted schema the real
 * store writes, so a screenshot run exercises the genuine load path — content
 * pack, derived stats, collection and asset variants included.
 *
 * The shape deliberately covers the awkward cases: two dives on one day, a
 * repeated site, a dive with no note, a dive with a single creature, a dive
 * with many, a creature with no curated artwork, and one the diver typed in.
 */

/** @typedef {{ site: string, area: string, region: string, depth: number, minutes: number, creatures: string[], highlight?: string, note?: string, operator?: string, buddies?: string[] }} DemoDive */

const COZUMEL = 'mx-caribbean-cozumel';
const PLAYA = 'mx-caribbean-playa-del-carmen';

/** @type {Array<[string, DemoDive]>} */
export const DEMO_DIVES = [
  [
    '2026-02-14',
    {
      site: 'Palancar Gardens',
      area: 'Cozumel',
      region: COZUMEL,
      depth: 21,
      minutes: 48,
      creatures: [
        'green-sea-turtle',
        'queen-angelfish',
        'stoplight-parrotfish',
        'french-grunt',
      ],
      highlight: 'green-sea-turtle',
      note: 'First dive of the trip. A green turtle was grazing at the top of the coral heads and stayed with us most of the way along.',
      operator: 'Blue Angel',
      buddies: ['Sam'],
    },
  ],
  [
    '2026-02-14',
    {
      site: 'Paraíso',
      area: 'Cozumel',
      region: COZUMEL,
      depth: 12,
      minutes: 54,
      creatures: ['sergeant-major', 'blue-tang', 'porcupinefish'],
      highlight: 'porcupinefish',
      operator: 'Blue Angel',
      buddies: ['Sam'],
    },
  ],
  [
    '2026-02-15',
    {
      site: 'Santa Rosa Wall',
      area: 'Cozumel',
      region: COZUMEL,
      depth: 27,
      minutes: 42,
      creatures: [
        'spotted-eagle-ray',
        'great-barracuda',
        'nurse-shark',
        'french-angelfish',
        'green-moray',
      ],
      highlight: 'spotted-eagle-ray',
      note: 'Drifting along the wall when an eagle ray came up out of the blue and flew past below us. The whole group turned at once.',
      operator: 'Blue Angel',
    },
  ],
  [
    '2026-02-16',
    {
      site: 'Palancar Caves',
      area: 'Cozumel',
      region: COZUMEL,
      depth: 24,
      minutes: 45,
      creatures: [
        'caribbean-spiny-lobster',
        'spotted-moray',
        'queen-angelfish',
      ],
      highlight: 'caribbean-spiny-lobster',
      note: 'Swim-throughs full of lobster antennae poking out of every crack.',
    },
  ],
  [
    '2026-02-17',
    {
      site: 'Palancar Gardens',
      area: 'Cozumel',
      region: COZUMEL,
      depth: 18,
      minutes: 51,
      creatures: [
        'green-sea-turtle',
        'hawksbill-sea-turtle',
        'stoplight-parrotfish',
      ],
      highlight: 'hawksbill-sea-turtle',
      note: 'Back to the gardens. A hawksbill this time, working at a sponge and completely unbothered by us.',
    },
  ],
  [
    '2026-06-02',
    {
      site: 'Mama Viña Wreck',
      area: 'Playa del Carmen',
      region: PLAYA,
      depth: 29,
      minutes: 38,
      creatures: ['great-barracuda', 'lionfish'],
      highlight: 'great-barracuda',
      note: 'The wreck was hazy but a big barracuda held station over the stern the whole dive.',
      operator: 'Phocea Mexico',
    },
  ],
  [
    '2026-06-03',
    {
      site: 'Tortugas',
      area: 'Playa del Carmen',
      region: PLAYA,
      depth: 16,
      minutes: 56,
      creatures: [
        'green-sea-turtle',
        'southern-stingray',
        'longsnout-seahorse',
        'caribbean-reef-squid',
      ],
      highlight: 'longsnout-seahorse',
      note: 'The guide found a seahorse in the sea grass. Took a minute to see it even with a finger pointing at it.',
    },
  ],
  [
    '2026-06-04',
    {
      site: 'Barracuda Reef',
      area: 'Playa del Carmen',
      region: PLAYA,
      depth: 19,
      minutes: 47,
      creatures: ['splendid-toadfish'],
      highlight: 'splendid-toadfish',
      note: 'Short dive, one very good fish. No artwork for it in Poseidon yet, which is fine.',
    },
  ],
  [
    '2026-09-01',
    {
      site: 'Yucab Reef',
      area: 'Cozumel',
      region: COZUMEL,
      depth: 17,
      minutes: 49,
      creatures: [
        'user:Goliath grouper',
        'nurse-shark',
        'blue-tang',
        'french-grunt',
        'porcupinefish',
      ],
      highlight: 'user:Goliath grouper',
      note: 'Something enormous under the ledge that nobody could agree on. Logged it as I saw it.',
      buddies: ['Sam', 'Alex'],
    },
  ],
];

/**
 * Builds the persisted v2 state the application reads on start.
 * @returns {{ state: object, storageKey: string }}
 */
export function buildDemoState() {
  /** @type {Map<string, string>} */
  const userCreatureIds = new Map();
  /** @type {Array<object>} */
  const userCreatures = [];
  /** @type {Array<object>} */
  const dives = [];

  DEMO_DIVES.forEach(([date, entry], diveIndex) => {
    const stamp = `${date}T0${(diveIndex % 9) + 1}:00:00.000Z`;
    const sightings = entry.creatures.map((reference, index) => {
      let creatureId = reference;
      if (reference.startsWith('user:')) {
        const name = reference.slice('user:'.length);
        let id = userCreatureIds.get(name);
        if (!id) {
          id = `creature_demo_${userCreatures.length + 1}`;
          userCreatureIds.set(name, id);
          userCreatures.push({
            id,
            commonName: name,
            curated: false,
            userCreated: true,
            artwork: { status: 'missing' },
          });
        }
        creatureId = id;
      }
      return { id: `sighting_demo_${diveIndex}_${index}`, creatureId };
    });

    const highlightReference = entry.highlight;
    const highlightId = highlightReference?.startsWith('user:')
      ? userCreatureIds.get(highlightReference.slice('user:'.length))
      : highlightReference;

    dives.push({
      id: `dive_demo_${diveIndex + 1}`,
      date,
      siteName: entry.site,
      areaName: entry.area,
      countryCode: 'MX',
      regionId: entry.region,
      maxDepth: { value: entry.depth, unit: 'm' },
      durationMinutes: entry.minutes,
      ...(entry.operator ? { operator: entry.operator } : {}),
      ...(entry.buddies ? { buddies: entry.buddies } : {}),
      ...(entry.note ? { note: entry.note } : {}),
      sightings,
      ...(highlightId ? { highlightCreatureId: highlightId } : {}),
      createdAt: stamp,
      updatedAt: stamp,
    });
  });

  return {
    storageKey: 'poseidon.personal',
    state: {
      schemaVersion: 2,
      updatedAt: '2026-09-01T09:00:00.000Z',
      dives,
      userCreatures,
    },
  };
}
