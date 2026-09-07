import type {
  CreateDiveInput,
  Creature,
  CreatureHistory,
  CreatureSuggestionContext,
  Dive,
  Id,
  LifetimeStats,
  Place,
  PlaceSummary,
  PoseidonContent,
  PoseidonExportV1,
  PoseidonStore,
  RecentDiscovery,
  Region,
  Sighting,
  SightingInput,
  UpdateDiveInput,
} from './domain.js';
import { PoseidonNotFoundError, PoseidonValidationError } from './errors.js';
import {
  CURRENT_SCHEMA_VERSION,
  type PersistedPersonalStateV2,
  type PersistenceAdapter,
  migratePersistedState,
} from './persistence.js';
import {
  buildCreatureCollection,
  getLifetimeStats,
  listPlaceSummaries,
  listRecentDiscoveries,
  rankSuggestedCreatures,
} from './selectors.js';
import {
  assertValidIsoDate,
  compareCreatureName,
  compareDiveNewestFirst,
  createDefaultId,
  deepClone,
  normalizeText,
  requireNonBlank,
} from './utils.js';

export interface PoseidonStoreOptions {
  persistence: PersistenceAdapter;
  content?: PoseidonContent;
  now?: () => string;
  idGenerator?: (prefix: 'dive' | 'sighting' | 'creature') => Id;
}

export function createPoseidonStore(options: PoseidonStoreOptions): PoseidonStore {
  return new DefaultPoseidonStore(options);
}

class DefaultPoseidonStore implements PoseidonStore {
  private readonly persistence: PersistenceAdapter;
  private readonly now: () => string;
  private readonly idGenerator: (prefix: 'dive' | 'sighting' | 'creature') => Id;
  private readonly curatedCreatures: Creature[];
  private readonly regions: Region[];
  private readonly places: Place[];
  private statePromise: Promise<PersistedPersonalStateV2> | null = null;
  private mutationQueue: Promise<void> = Promise.resolve();

  constructor(options: PoseidonStoreOptions) {
    this.persistence = options.persistence;
    this.now = options.now ?? (() => new Date().toISOString());
    this.idGenerator = options.idGenerator ?? ((prefix) => createDefaultId(prefix));
    this.curatedCreatures = deepClone(options.content?.creatures ?? []);
    this.regions = deepClone(options.content?.regions ?? []);
    this.places = deepClone(options.content?.places ?? []);
    assertUniqueIds(this.curatedCreatures, 'creature content');
    assertUniqueIds(this.regions, 'region content');
    assertUniqueIds(this.places, 'place content');
  }

  private async state(): Promise<PersistedPersonalStateV2> {
    if (!this.statePromise) {
      this.statePromise = (async () => {
        const raw = await this.persistence.read();
        const migrated = migratePersistedState(raw, this.now());
        if (migrated.migratedFromVersion !== null) {
          await this.persistence.write(migrated.state);
        }
        return migrated.state;
      })();
    }
    return this.statePromise;
  }

  private async enqueueMutation<T>(mutation: (state: PersistedPersonalStateV2) => T): Promise<T> {
    let result!: T;
    let failure: unknown;
    const run = async (): Promise<void> => {
      try {
        const current = await this.state();
        const next = deepClone(current);
        result = mutation(next);
        next.updatedAt = this.now();
        await this.persistence.write(next);
        this.statePromise = Promise.resolve(next);
      } catch (error) {
        failure = error;
      }
    };
    this.mutationQueue = this.mutationQueue.then(run, run);
    await this.mutationQueue;
    if (failure) throw failure;
    return deepClone(result);
  }

  private async snapshot(): Promise<PersistedPersonalStateV2> {
    await this.mutationQueue;
    return deepClone(await this.state());
  }

  private creatureMap(state: PersistedPersonalStateV2): Map<string, Creature> {
    const map = new Map<string, Creature>();
    for (const creature of this.curatedCreatures) map.set(creature.id, creature);
    for (const creature of state.userCreatures) map.set(creature.id, creature);
    return map;
  }

  async listDives(): Promise<Dive[]> {
    const state = await this.snapshot();
    return state.dives.sort(compareDiveNewestFirst);
  }

  async getDive(id: Id): Promise<Dive | null> {
    const state = await this.snapshot();
    const dive = state.dives.find((candidate) => candidate.id === id);
    return dive ? deepClone(dive) : null;
  }

  async createDive(input: CreateDiveInput): Promise<Dive> {
    return this.enqueueMutation((state) => {
      const creatureById = this.creatureMap(state);
      const normalized = validateAndNormalizeInput(input, creatureById);
      const timestamp = this.now();
      const dive: Dive = {
        id: this.idGenerator('dive'),
        date: normalized.date,
        siteName: normalized.siteName,
        areaName: normalized.areaName,
        ...(normalized.countryCode ? { countryCode: normalized.countryCode } : {}),
        ...(normalized.regionId ? { regionId: normalized.regionId } : {}),
        ...(normalized.coordinates ? { coordinates: normalized.coordinates } : {}),
        maxDepth: normalized.maxDepth,
        durationMinutes: normalized.durationMinutes,
        ...(normalized.operator ? { operator: normalized.operator } : {}),
        ...(normalized.buddies ? { buddies: normalized.buddies } : {}),
        ...(normalized.note ? { note: normalized.note } : {}),
        sightings: normalized.sightings.map((sighting) => this.newSighting(sighting)),
        ...(normalized.highlightCreatureId ? { highlightCreatureId: normalized.highlightCreatureId } : {}),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      state.dives.push(dive);
      return dive;
    });
  }

  async updateDive(id: Id, input: UpdateDiveInput): Promise<Dive> {
    return this.enqueueMutation((state) => {
      const index = state.dives.findIndex((dive) => dive.id === id);
      if (index === -1) throw new PoseidonNotFoundError(`Dive ${id} was not found.`);
      const existing = state.dives[index]!;
      const baseInput: CreateDiveInput = {
        date: existing.date,
        siteName: existing.siteName,
        areaName: existing.areaName,
        ...(existing.countryCode ? { countryCode: existing.countryCode } : {}),
        ...(existing.regionId ? { regionId: existing.regionId } : {}),
        ...(existing.coordinates ? { coordinates: existing.coordinates } : {}),
        maxDepth: existing.maxDepth,
        durationMinutes: existing.durationMinutes,
        ...(existing.operator ? { operator: existing.operator } : {}),
        ...(existing.buddies ? { buddies: existing.buddies } : {}),
        ...(existing.note ? { note: existing.note } : {}),
        sightings: existing.sightings.map(({ creatureId, quantity, note }) => ({
          creatureId,
          ...(quantity ? { quantity } : {}),
          ...(note ? { note } : {}),
        })),
        ...(existing.highlightCreatureId ? { highlightCreatureId: existing.highlightCreatureId } : {}),
      };

      const merged = mergeDiveInput(baseInput, input);
      if (
        input.sightings !== undefined &&
        input.highlightCreatureId === undefined &&
        existing.highlightCreatureId &&
        !input.sightings.some((sighting) => sighting.creatureId === existing.highlightCreatureId)
      ) {
        delete merged.highlightCreatureId;
      }
      const normalized = validateAndNormalizeInput(merged, this.creatureMap(state));
      const updated: Dive = {
        id: existing.id,
        date: normalized.date,
        siteName: normalized.siteName,
        areaName: normalized.areaName,
        ...(normalized.countryCode ? { countryCode: normalized.countryCode } : {}),
        ...(normalized.regionId ? { regionId: normalized.regionId } : {}),
        ...(normalized.coordinates ? { coordinates: normalized.coordinates } : {}),
        maxDepth: normalized.maxDepth,
        durationMinutes: normalized.durationMinutes,
        ...(normalized.operator ? { operator: normalized.operator } : {}),
        ...(normalized.buddies ? { buddies: normalized.buddies } : {}),
        ...(normalized.note ? { note: normalized.note } : {}),
        sightings: this.reconcileSightings(existing.sightings, normalized.sightings),
        ...(normalized.highlightCreatureId ? { highlightCreatureId: normalized.highlightCreatureId } : {}),
        createdAt: existing.createdAt,
        updatedAt: this.now(),
      };
      state.dives[index] = updated;
      return updated;
    });
  }

  async deleteDive(id: Id): Promise<void> {
    await this.enqueueMutation((state) => {
      const index = state.dives.findIndex((dive) => dive.id === id);
      if (index === -1) throw new PoseidonNotFoundError(`Dive ${id} was not found.`);
      state.dives.splice(index, 1);
    });
  }

  async listCreatures(): Promise<Creature[]> {
    const state = await this.snapshot();
    return [...this.creatureMap(state).values()].map(deepClone).sort(compareCreatureName);
  }

  async searchCreatures(query: string): Promise<Creature[]> {
    const needle = normalizeText(query);
    if (!needle) return this.listCreatures();
    const creatures = await this.listCreatures();
    return creatures.filter((creature) => {
      const fields = [creature.commonName, ...(creature.aliases ?? []), creature.scientificName ?? ''];
      return fields.some((field) => normalizeText(field).includes(needle));
    });
  }

  async listSuggestedCreatures(context: CreatureSuggestionContext): Promise<Creature[]> {
    const state = await this.snapshot();
    return rankSuggestedCreatures(
      [...this.creatureMap(state).values()].map(deepClone),
      state.dives,
      this.regions,
      context,
    );
  }

  async createUserCreature(name: string): Promise<Creature> {
    const commonName = requireNonBlank(name, 'Creature name');
    return this.enqueueMutation((state) => {
      const normalized = normalizeText(commonName);
      const existing = state.userCreatures.find((creature) => normalizeText(creature.commonName) === normalized);
      if (existing) return existing;
      const creature: Creature = {
        id: this.idGenerator('creature'),
        commonName,
        curated: false,
        userCreated: true,
        artwork: { status: 'missing' },
      };
      state.userCreatures.push(creature);
      return creature;
    });
  }

  async getCreatureHistory(creatureId: Id): Promise<CreatureHistory | null> {
    const collection = await this.listCreatureCollection();
    return collection.find((entry) => entry.creature.id === creatureId) ?? null;
  }

  async getLifetimeStats(): Promise<LifetimeStats> {
    const state = await this.snapshot();
    return getLifetimeStats(state.dives);
  }

  async listRecentDiscoveries(limit = 6): Promise<RecentDiscovery[]> {
    if (!Number.isInteger(limit) || limit < 0) {
      throw new PoseidonValidationError('Recent discovery limit must be a non-negative integer.');
    }
    const state = await this.snapshot();
    return listRecentDiscoveries(state.dives, this.creatureMap(state), limit);
  }

  async listCreatureCollection(): Promise<CreatureHistory[]> {
    const state = await this.snapshot();
    return buildCreatureCollection(state.dives, this.creatureMap(state));
  }

  async listPlaceSummaries(): Promise<PlaceSummary[]> {
    const state = await this.snapshot();
    return listPlaceSummaries(state.dives);
  }

  async exportData(): Promise<PoseidonExportV1> {
    const state = await this.snapshot();
    const creatureById = this.creatureMap(state);
    const userCreatureIds = new Set(state.userCreatures.map((creature) => creature.id));
    const referencedCreatureIds = new Set(state.dives.flatMap((dive) => dive.sightings.map((sighting) => sighting.creatureId)));
    const creatures = [...referencedCreatureIds]
      .filter((id) => !userCreatureIds.has(id))
      .map((id) => creatureById.get(id))
      .filter((creature): creature is Creature => creature !== undefined)
      .map(deepClone)
      .sort(compareCreatureName);

    const regionIds = new Set<string>();
    for (const dive of state.dives) if (dive.regionId) regionIds.add(dive.regionId);
    for (const creature of creatures) for (const regionId of creature.regionIds ?? []) regionIds.add(regionId);
    const regions = includeRegionAncestors(this.regions, regionIds);
    const placeNames = new Set(
      state.dives.flatMap((dive) => [normalizeText(dive.areaName), normalizeText(dive.siteName)]),
    );
    const places = this.places.filter(
      (place) => (place.regionId && regionIds.has(place.regionId)) || placeNames.has(normalizeText(place.name)),
    );

    return {
      format: 'poseidon-personal-export',
      exportVersion: 1,
      exportedAt: this.now(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      personal: {
        dives: deepClone(state.dives).sort(compareDiveNewestFirst),
        userCreatures: deepClone(state.userCreatures).sort(compareCreatureName),
      },
      catalogSnapshots: {
        creatures,
        regions: deepClone(regions),
        places: deepClone(places),
      },
    };
  }

  private newSighting(input: SightingInput): Sighting {
    return {
      id: this.idGenerator('sighting'),
      creatureId: input.creatureId,
      ...(input.quantity ? { quantity: input.quantity } : {}),
      ...(input.note ? { note: input.note } : {}),
    };
  }

  private reconcileSightings(existing: Sighting[], next: SightingInput[]): Sighting[] {
    const byCreature = new Map(existing.map((sighting) => [sighting.creatureId, sighting]));
    return next.map((input) => {
      const old = byCreature.get(input.creatureId);
      return {
        id: old?.id ?? this.idGenerator('sighting'),
        creatureId: input.creatureId,
        ...(input.quantity ? { quantity: input.quantity } : {}),
        ...(input.note ? { note: input.note } : {}),
      };
    });
  }
}

function mergeDiveInput(base: CreateDiveInput, update: UpdateDiveInput): CreateDiveInput {
  const merged = { ...base, ...update } as CreateDiveInput;
  const optionalKeys: Array<keyof CreateDiveInput> = [
    'countryCode',
    'regionId',
    'coordinates',
    'operator',
    'buddies',
    'note',
    'highlightCreatureId',
  ];
  for (const key of optionalKeys) {
    if (Object.prototype.hasOwnProperty.call(update, key) && update[key] === undefined) {
      delete (merged as unknown as Record<string, unknown>)[key];
    }
  }
  return merged;
}

function validateAndNormalizeInput(input: CreateDiveInput, creatures: Map<string, Creature>): CreateDiveInput {
  assertValidIsoDate(input.date);
  const siteName = requireNonBlank(input.siteName, 'siteName');
  const areaName = requireNonBlank(input.areaName, 'areaName');
  if (!Number.isFinite(input.maxDepth.value) || input.maxDepth.value <= 0) {
    throw new PoseidonValidationError('maxDepth.value must be a positive finite number.');
  }
  if (input.maxDepth.unit !== 'm' && input.maxDepth.unit !== 'ft') {
    throw new PoseidonValidationError('maxDepth.unit must be m or ft.');
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new PoseidonValidationError('durationMinutes must be a positive integer.');
  }
  if (input.coordinates) {
    const { lat, lng } = input.coordinates;
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      throw new PoseidonValidationError('coordinates must contain valid latitude and longitude values.');
    }
  }
  if (!Array.isArray(input.sightings)) {
    throw new PoseidonValidationError('sightings must be an array.');
  }
  const sightingCreatureIds = new Set<string>();
  const sightings = input.sightings.map((sighting) => {
    if (!creatures.has(sighting.creatureId)) {
      throw new PoseidonValidationError(`Unknown creature reference: ${sighting.creatureId}.`);
    }
    if (sightingCreatureIds.has(sighting.creatureId)) {
      throw new PoseidonValidationError(`Creature ${sighting.creatureId} appears more than once on the same dive.`);
    }
    sightingCreatureIds.add(sighting.creatureId);
    return {
      creatureId: sighting.creatureId,
      ...(sighting.quantity ? { quantity: sighting.quantity } : {}),
      ...(sighting.note?.trim() ? { note: sighting.note.trim() } : {}),
    };
  });
  if (input.highlightCreatureId && !sightingCreatureIds.has(input.highlightCreatureId)) {
    throw new PoseidonValidationError('highlightCreatureId must reference a creature sighted on the dive.');
  }

  const countryCode = input.countryCode?.trim().toUpperCase();
  if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) {
    throw new PoseidonValidationError('countryCode must be a two-letter code when provided.');
  }
  const operator = input.operator?.trim();
  const note = input.note?.trim();
  const buddies = input.buddies?.map((buddy) => buddy.trim()).filter(Boolean);

  return {
    date: input.date,
    siteName,
    areaName,
    ...(countryCode ? { countryCode } : {}),
    ...(input.regionId?.trim() ? { regionId: input.regionId.trim() } : {}),
    ...(input.coordinates ? { coordinates: { ...input.coordinates } } : {}),
    maxDepth: { ...input.maxDepth },
    durationMinutes: input.durationMinutes,
    ...(operator ? { operator } : {}),
    ...(buddies && buddies.length > 0 ? { buddies } : {}),
    ...(note ? { note } : {}),
    sightings,
    ...(input.highlightCreatureId ? { highlightCreatureId: input.highlightCreatureId } : {}),
  };
}

function assertUniqueIds(records: Array<{ id: string }>, label: string): void {
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) throw new PoseidonValidationError(`Duplicate id ${record.id} in ${label}.`);
    ids.add(record.id);
  }
}

function includeRegionAncestors(regions: Region[], initialIds: Set<string>): Region[] {
  const byId = new Map(regions.map((region) => [region.id, region]));
  const ids = new Set(initialIds);
  const stack = [...initialIds];
  while (stack.length > 0) {
    const id = stack.pop()!;
    const region = byId.get(id);
    if (region?.parentRegionId && !ids.has(region.parentRegionId)) {
      ids.add(region.parentRegionId);
      stack.push(region.parentRegionId);
    }
  }
  return regions.filter((region) => ids.has(region.id));
}
