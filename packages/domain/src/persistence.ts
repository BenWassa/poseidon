import type { Creature, Dive } from './domain.js';
import { PoseidonMigrationError, PoseidonPersistenceError } from './errors.js';
import { deepClone } from './utils.js';

export const CURRENT_SCHEMA_VERSION = 2;
export const DEFAULT_STORAGE_KEY = 'poseidon.personal';

export interface PersistedPersonalStateV2 {
  schemaVersion: 2;
  updatedAt: string;
  dives: Dive[];
  userCreatures: Creature[];
}

interface PersistedPersonalStateV1 {
  schemaVersion: 1;
  dives: Dive[];
  userCreatures: Array<{
    id: string;
    commonName: string;
    aliases?: string[];
  }>;
}

export interface MigrationResult {
  state: PersistedPersonalStateV2;
  migratedFromVersion: number | null;
}

export interface PersistenceAdapter {
  read(): Promise<unknown | null>;
  write(state: PersistedPersonalStateV2): Promise<void>;
  remove?(): Promise<void>;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalStoragePersistence implements PersistenceAdapter {
  constructor(
    private readonly storage: StorageLike,
    private readonly key: string = DEFAULT_STORAGE_KEY,
  ) {}

  async read(): Promise<unknown | null> {
    try {
      const raw = this.storage.getItem(this.key);
      if (raw === null) return null;
      return JSON.parse(raw) as unknown;
    } catch (error) {
      throw new PoseidonPersistenceError(
        'Unable to read Poseidon local data.',
        error,
      );
    }
  }

  async write(state: PersistedPersonalStateV2): Promise<void> {
    try {
      this.storage.setItem(this.key, JSON.stringify(state));
    } catch (error) {
      throw new PoseidonPersistenceError(
        'Unable to persist Poseidon local data.',
        error,
      );
    }
  }

  async remove(): Promise<void> {
    try {
      this.storage.removeItem(this.key);
    } catch (error) {
      throw new PoseidonPersistenceError(
        'Unable to remove Poseidon local data.',
        error,
      );
    }
  }
}

/**
 * Disposable in-memory persistence for tests and development tooling.
 * Nothing is written to browser storage or a remote service.
 */
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

export function createEmptyPersonalState(
  now: string,
): PersistedPersonalStateV2 {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: now,
    dives: [],
    userCreatures: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function migrateV1ToV2(
  value: PersistedPersonalStateV1,
  now: string,
): PersistedPersonalStateV2 {
  return {
    schemaVersion: 2,
    updatedAt: now,
    dives: deepClone(value.dives),
    userCreatures: value.userCreatures.map((creature) => ({
      id: creature.id,
      commonName: creature.commonName,
      ...(creature.aliases ? { aliases: [...creature.aliases] } : {}),
      curated: false,
      userCreated: true,
      artwork: { status: 'missing' },
    })),
  };
}

function assertV2Shape(
  value: Record<string, unknown>,
): asserts value is Record<string, unknown> & PersistedPersonalStateV2 {
  if (
    value.schemaVersion !== 2 ||
    !Array.isArray(value.dives) ||
    !Array.isArray(value.userCreatures)
  ) {
    throw new PoseidonMigrationError(
      'Stored Poseidon data does not match schema version 2.',
    );
  }
  if (typeof value.updatedAt !== 'string') {
    throw new PoseidonMigrationError(
      'Stored Poseidon data is missing its schema update timestamp.',
    );
  }
}

export function migratePersistedState(
  raw: unknown,
  now: string,
): MigrationResult {
  if (raw === null || raw === undefined) {
    return { state: createEmptyPersonalState(now), migratedFromVersion: null };
  }
  if (!isRecord(raw)) {
    throw new PoseidonMigrationError('Stored Poseidon data is not an object.');
  }

  const version = raw.schemaVersion;
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    throw new PoseidonMigrationError(
      'Stored Poseidon data has no supported schema version.',
    );
  }
  if (version > CURRENT_SCHEMA_VERSION) {
    throw new PoseidonMigrationError(
      `Stored Poseidon data uses schema version ${version}, newer than supported version ${CURRENT_SCHEMA_VERSION}.`,
    );
  }

  if (version === 1) {
    if (!Array.isArray(raw.dives) || !Array.isArray(raw.userCreatures)) {
      throw new PoseidonMigrationError(
        'Stored Poseidon schema version 1 is malformed.',
      );
    }
    const migrated = migrateV1ToV2(
      raw as unknown as PersistedPersonalStateV1,
      now,
    );
    return { state: migrated, migratedFromVersion: 1 };
  }

  assertV2Shape(raw);
  return { state: deepClone(raw), migratedFromVersion: null };
}
