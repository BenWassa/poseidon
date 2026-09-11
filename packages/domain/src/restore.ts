import type {
  Creature,
  Dive,
  PoseidonExportV1,
  RestoreMode,
  RestorePreview,
  RestoreResult,
} from './domain.js';
import { PoseidonValidationError } from './errors.js';
import {
  CURRENT_SCHEMA_VERSION,
  migratePersistedState,
  type PersistedPersonalStateV2,
} from './persistence.js';
import { assertValidIsoDate, deepClone, normalizeText } from './utils.js';

export interface PreparedPoseidonRestore {
  exportData: PoseidonExportV1;
  state: PersistedPersonalStateV2;
}

/**
 * Parses and validates a Poseidon export without mutating persistence.
 *
 * The export envelope and every personal record are checked before the caller
 * is allowed to preview or commit a restore. Older persisted schema versions
 * may use the normal migration path; future/unknown export versions are
 * refused rather than guessed at.
 */
export function preparePoseidonRestore(
  raw: unknown,
  now: string,
  curatedCreatures: Creature[],
): PreparedPoseidonRestore {
  const exportData = assertExportEnvelope(raw);
  const migrated = migratePersistedState(
    {
      schemaVersion: exportData.schemaVersion,
      updatedAt: exportData.exportedAt,
      dives: exportData.personal.dives,
      userCreatures: exportData.personal.userCreatures,
    },
    now,
  ).state;

  validatePersonalState(migrated, curatedCreatures);
  validateCatalogSnapshots(exportData);
  return { exportData: deepClone(exportData), state: migrated };
}

export function buildRestorePreview(
  current: PersistedPersonalStateV2,
  prepared: PreparedPoseidonRestore,
): RestorePreview {
  const incoming = prepared.state;
  const currentDiveById = new Map(current.dives.map((dive) => [dive.id, dive]));
  const currentCreatureById = new Map(
    current.userCreatures.map((creature) => [creature.id, creature]),
  );
  const incomingDiveById = new Map(
    incoming.dives.map((dive) => [dive.id, dive]),
  );
  const incomingCreatureById = new Map(
    incoming.userCreatures.map((creature) => [creature.id, creature]),
  );
  const conflicts = findMergeConflicts(current, incoming);

  let mergeAddsDives = 0;
  let mergeUnchangedDives = 0;
  for (const dive of incoming.dives) {
    const existing = currentDiveById.get(dive.id);
    if (!existing) mergeAddsDives += 1;
    else if (sameJsonValue(existing, dive)) mergeUnchangedDives += 1;
  }

  let mergeAddsUserCreatures = 0;
  let mergeUnchangedUserCreatures = 0;
  for (const creature of incoming.userCreatures) {
    const existing = currentCreatureById.get(creature.id);
    if (!existing) mergeAddsUserCreatures += 1;
    else if (sameJsonValue(existing, creature))
      mergeUnchangedUserCreatures += 1;
  }

  const replaceWouldDiscardDives = current.dives.filter((dive) => {
    const incomingDive = incomingDiveById.get(dive.id);
    return !incomingDive || !sameJsonValue(dive, incomingDive);
  }).length;
  const replaceWouldDiscardUserCreatures = current.userCreatures.filter(
    (creature) => {
      const incomingCreature = incomingCreatureById.get(creature.id);
      return !incomingCreature || !sameJsonValue(creature, incomingCreature);
    },
  ).length;

  return {
    exportedAt: prepared.exportData.exportedAt,
    exportVersion: prepared.exportData.exportVersion,
    schemaVersion: prepared.exportData.schemaVersion,
    backupDives: incoming.dives.length,
    backupUserCreatures: incoming.userCreatures.length,
    currentDives: current.dives.length,
    currentUserCreatures: current.userCreatures.length,
    mergeAddsDives,
    mergeAddsUserCreatures,
    mergeUnchangedDives,
    mergeUnchangedUserCreatures,
    mergeConflicts: conflicts,
    replaceWouldDiscardDives,
    replaceWouldDiscardUserCreatures,
  };
}

export function applyPreparedRestore(
  current: PersistedPersonalStateV2,
  prepared: PreparedPoseidonRestore,
  mode: RestoreMode,
): { state: PersistedPersonalStateV2; result: RestoreResult } {
  if (mode !== 'merge' && mode !== 'replace') {
    throw new PoseidonValidationError('Restore mode must be merge or replace.');
  }

  const incoming = prepared.state;
  if (mode === 'replace') {
    return {
      state: deepClone(incoming),
      result: {
        mode,
        totalDives: incoming.dives.length,
        totalUserCreatures: incoming.userCreatures.length,
        addedDives: incoming.dives.length,
        addedUserCreatures: incoming.userCreatures.length,
      },
    };
  }

  const conflicts = findMergeConflicts(current, incoming);
  if (conflicts.length > 0) {
    const details = conflicts.slice(0, 3).join('; ');
    const suffix =
      conflicts.length > 3 ? `; plus ${conflicts.length - 3} more` : '';
    throw new PoseidonValidationError(
      `Merge refused because the backup conflicts with the current record: ${details}${suffix}. Replace remains available only as an explicit destructive action.`,
    );
  }

  const currentDiveIds = new Set(current.dives.map((dive) => dive.id));
  const currentCreatureIds = new Set(
    current.userCreatures.map((creature) => creature.id),
  );
  const addedDives = incoming.dives.filter(
    (dive) => !currentDiveIds.has(dive.id),
  );
  const addedUserCreatures = incoming.userCreatures.filter(
    (creature) => !currentCreatureIds.has(creature.id),
  );
  const next: PersistedPersonalStateV2 = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: current.updatedAt,
    dives: [...deepClone(current.dives), ...deepClone(addedDives)],
    userCreatures: [
      ...deepClone(current.userCreatures),
      ...deepClone(addedUserCreatures),
    ],
  };

  return {
    state: next,
    result: {
      mode,
      totalDives: next.dives.length,
      totalUserCreatures: next.userCreatures.length,
      addedDives: addedDives.length,
      addedUserCreatures: addedUserCreatures.length,
    },
  };
}

function assertExportEnvelope(raw: unknown): PoseidonExportV1 {
  if (!isRecord(raw))
    throw new PoseidonValidationError('Backup is not a Poseidon JSON object.');
  if (raw.format !== 'poseidon-personal-export') {
    throw new PoseidonValidationError(
      'Backup format is not poseidon-personal-export.',
    );
  }
  if (raw.exportVersion !== 1) {
    const value = printable(raw.exportVersion);
    throw new PoseidonValidationError(
      `Backup export version ${value} is unsupported; this app supports version 1.`,
    );
  }
  const schemaVersion = raw.schemaVersion;
  if (
    typeof schemaVersion !== 'number' ||
    !Number.isInteger(schemaVersion) ||
    schemaVersion < 1
  ) {
    throw new PoseidonValidationError(
      'Backup has no supported personal-data schema version.',
    );
  }
  if (schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new PoseidonValidationError(
      `Backup schema version ${schemaVersion} is newer than this app supports (${CURRENT_SCHEMA_VERSION}). Update Poseidon before restoring it.`,
    );
  }
  assertIsoTimestamp(raw.exportedAt, 'Backup export timestamp');
  if (
    !isRecord(raw.personal) ||
    !Array.isArray(raw.personal.dives) ||
    !Array.isArray(raw.personal.userCreatures)
  ) {
    throw new PoseidonValidationError('Backup personal data is malformed.');
  }
  if (
    !isRecord(raw.catalogSnapshots) ||
    !Array.isArray(raw.catalogSnapshots.creatures) ||
    !Array.isArray(raw.catalogSnapshots.regions) ||
    !Array.isArray(raw.catalogSnapshots.places)
  ) {
    throw new PoseidonValidationError(
      'Backup catalogue snapshot is malformed.',
    );
  }
  return raw as unknown as PoseidonExportV1;
}

function validatePersonalState(
  state: PersistedPersonalStateV2,
  curatedCreatures: Creature[],
): void {
  assertUniqueIds(state.userCreatures, 'backup custom creatures');
  assertUniqueIds(state.dives, 'backup dives');
  const curatedIds = new Set(curatedCreatures.map((creature) => creature.id));
  const availableCreatureIds = new Set(curatedIds);
  const normalizedUserNames = new Set<string>();

  for (const creature of state.userCreatures) {
    validateUserCreature(creature);
    if (curatedIds.has(creature.id)) {
      throw new PoseidonValidationError(
        `Backup custom creature ${creature.id} collides with the built-in catalogue.`,
      );
    }
    const normalizedName = normalizeText(creature.commonName);
    if (normalizedUserNames.has(normalizedName)) {
      throw new PoseidonValidationError(
        `Backup contains duplicate custom creature name: ${creature.commonName}.`,
      );
    }
    normalizedUserNames.add(normalizedName);
    availableCreatureIds.add(creature.id);
  }

  for (const dive of state.dives) validateDive(dive, availableCreatureIds);
}

function validateUserCreature(creature: Creature): void {
  const record = creature as unknown as Record<string, unknown>;
  assertNonBlankString(record.id, 'Custom creature id');
  assertNonBlankString(record.commonName, 'Custom creature name');
  if (record.curated !== false || record.userCreated !== true) {
    throw new PoseidonValidationError(
      `Custom creature ${String(record.id)} has invalid ownership metadata.`,
    );
  }
  assertOptionalStringArray(
    record.aliases,
    `Custom creature ${String(record.id)} aliases`,
  );
  assertOptionalString(
    record.scientificName,
    `Custom creature ${String(record.id)} scientificName`,
  );
  assertOptionalString(
    record.category,
    `Custom creature ${String(record.id)} category`,
  );
  assertOptionalStringArray(
    record.regionIds,
    `Custom creature ${String(record.id)} regionIds`,
  );
  if (record.artwork !== undefined) {
    if (
      !isRecord(record.artwork) ||
      !['curated', 'placeholder', 'missing'].includes(
        String(record.artwork.status),
      )
    ) {
      throw new PoseidonValidationError(
        `Custom creature ${String(record.id)} artwork metadata is malformed.`,
      );
    }
  }
}

function validateDive(dive: Dive, availableCreatureIds: Set<string>): void {
  const record = dive as unknown as Record<string, unknown>;
  assertNonBlankString(record.id, 'Dive id');
  if (typeof record.date !== 'string')
    throw new PoseidonValidationError(
      `Dive ${String(record.id)} date is malformed.`,
    );
  assertValidIsoDate(record.date);
  assertNonBlankString(record.siteName, `Dive ${String(record.id)} siteName`);
  assertNonBlankString(record.areaName, `Dive ${String(record.id)} areaName`);
  assertOptionalString(record.regionId, `Dive ${String(record.id)} regionId`);
  assertOptionalString(record.operator, `Dive ${String(record.id)} operator`);
  assertOptionalString(record.note, `Dive ${String(record.id)} note`);
  assertOptionalStringArray(
    record.buddies,
    `Dive ${String(record.id)} buddies`,
  );

  if (record.countryCode !== undefined) {
    if (
      typeof record.countryCode !== 'string' ||
      !/^[A-Za-z]{2}$/.test(record.countryCode)
    ) {
      throw new PoseidonValidationError(
        `Dive ${String(record.id)} countryCode is malformed.`,
      );
    }
  }

  if (!isRecord(record.maxDepth)) {
    throw new PoseidonValidationError(
      `Dive ${String(record.id)} maxDepth is malformed.`,
    );
  }
  const depthValue = record.maxDepth.value;
  if (
    typeof depthValue !== 'number' ||
    !Number.isFinite(depthValue) ||
    depthValue <= 0
  ) {
    throw new PoseidonValidationError(
      `Dive ${String(record.id)} maxDepth is malformed.`,
    );
  }
  if (record.maxDepth.unit !== 'm' && record.maxDepth.unit !== 'ft') {
    throw new PoseidonValidationError(
      `Dive ${String(record.id)} depth unit is unsupported.`,
    );
  }

  const durationMinutes = record.durationMinutes;
  if (
    typeof durationMinutes !== 'number' ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  ) {
    throw new PoseidonValidationError(
      `Dive ${String(record.id)} durationMinutes is malformed.`,
    );
  }

  if (record.coordinates !== undefined) {
    if (!isRecord(record.coordinates)) {
      throw new PoseidonValidationError(
        `Dive ${String(record.id)} coordinates are malformed.`,
      );
    }
    const lat = record.coordinates.lat;
    const lng = record.coordinates.lng;
    if (
      typeof lat !== 'number' ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      typeof lng !== 'number' ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      throw new PoseidonValidationError(
        `Dive ${String(record.id)} coordinates are malformed.`,
      );
    }
  }
  assertIsoTimestamp(record.createdAt, `Dive ${String(record.id)} createdAt`);
  assertIsoTimestamp(record.updatedAt, `Dive ${String(record.id)} updatedAt`);

  if (!Array.isArray(record.sightings)) {
    throw new PoseidonValidationError(
      `Dive ${String(record.id)} sightings are malformed.`,
    );
  }
  const sightingIds = new Set<string>();
  const creatureIds = new Set<string>();
  for (const sighting of record.sightings) {
    if (!isRecord(sighting))
      throw new PoseidonValidationError(
        `Dive ${String(record.id)} has a malformed sighting.`,
      );
    const sightingId = assertNonBlankString(
      sighting.id,
      `Dive ${String(record.id)} sighting id`,
    );
    const creatureId = assertNonBlankString(
      sighting.creatureId,
      `Dive ${String(record.id)} sighting creatureId`,
    );
    if (sightingIds.has(sightingId)) {
      throw new PoseidonValidationError(
        `Dive ${String(record.id)} contains duplicate sighting id ${sightingId}.`,
      );
    }
    if (creatureIds.has(creatureId)) {
      throw new PoseidonValidationError(
        `Dive ${String(record.id)} contains creature ${creatureId} more than once.`,
      );
    }
    if (!availableCreatureIds.has(creatureId)) {
      throw new PoseidonValidationError(
        `Dive ${String(record.id)} references creature ${creatureId}, which is not available in this Poseidon build. Restore was refused to avoid dangling history.`,
      );
    }
    if (
      sighting.quantity !== undefined &&
      (typeof sighting.quantity !== 'string' ||
        !['one', 'few', 'several', 'many'].includes(sighting.quantity))
    ) {
      throw new PoseidonValidationError(
        `Dive ${String(record.id)} has an unsupported sighting quantity.`,
      );
    }
    assertOptionalString(
      sighting.note,
      `Dive ${String(record.id)} sighting note`,
    );
    sightingIds.add(sightingId);
    creatureIds.add(creatureId);
  }
  if (record.highlightCreatureId !== undefined) {
    const highlight = assertNonBlankString(
      record.highlightCreatureId,
      `Dive ${String(record.id)} highlightCreatureId`,
    );
    if (!creatureIds.has(highlight)) {
      throw new PoseidonValidationError(
        `Dive ${String(record.id)} highlightCreatureId is not one of its sightings.`,
      );
    }
  }
}

function validateCatalogSnapshots(exportData: PoseidonExportV1): void {
  assertUniqueIds(
    exportData.catalogSnapshots.creatures,
    'backup catalogue creatures',
  );
  assertUniqueIds(
    exportData.catalogSnapshots.regions,
    'backup catalogue regions',
  );
  assertUniqueIds(
    exportData.catalogSnapshots.places,
    'backup catalogue places',
  );
  for (const creature of exportData.catalogSnapshots.creatures) {
    assertNonBlankString(
      (creature as unknown as Record<string, unknown>).commonName,
      `Catalogue creature ${creature.id} name`,
    );
  }
  for (const region of exportData.catalogSnapshots.regions) {
    assertNonBlankString(
      (region as unknown as Record<string, unknown>).name,
      `Catalogue region ${region.id} name`,
    );
  }
  for (const place of exportData.catalogSnapshots.places) {
    const record = place as unknown as Record<string, unknown>;
    assertNonBlankString(record.name, `Catalogue place ${place.id} name`);
    if (!['country', 'region', 'area', 'site'].includes(String(record.kind))) {
      throw new PoseidonValidationError(
        `Catalogue place ${place.id} kind is malformed.`,
      );
    }
  }
}

function findMergeConflicts(
  current: PersistedPersonalStateV2,
  incoming: PersistedPersonalStateV2,
): string[] {
  const conflicts: string[] = [];
  const currentDiveById = new Map(current.dives.map((dive) => [dive.id, dive]));
  const currentCreatureById = new Map(
    current.userCreatures.map((creature) => [creature.id, creature]),
  );
  const currentCreatureByName = new Map(
    current.userCreatures.map((creature) => [
      normalizeText(creature.commonName),
      creature,
    ]),
  );

  for (const dive of incoming.dives) {
    const existing = currentDiveById.get(dive.id);
    if (existing && !sameJsonValue(existing, dive))
      conflicts.push(`dive ${dive.id} has different data`);
  }
  for (const creature of incoming.userCreatures) {
    const existing = currentCreatureById.get(creature.id);
    if (existing && !sameJsonValue(existing, creature)) {
      conflicts.push(`custom creature ${creature.id} has different data`);
      continue;
    }
    const sameName = currentCreatureByName.get(
      normalizeText(creature.commonName),
    );
    if (sameName && sameName.id !== creature.id) {
      conflicts.push(
        `custom creature name ${creature.commonName} already belongs to ${sameName.id}`,
      );
    }
  }
  return conflicts;
}

function sameJsonValue(left: unknown, right: unknown): boolean {
  return stableJson(left) === stableJson(right);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function assertUniqueIds(records: Array<{ id: string }>, label: string): void {
  const ids = new Set<string>();
  for (const raw of records) {
    const id = assertNonBlankString(
      (raw as unknown as Record<string, unknown>).id,
      `${label} id`,
    );
    if (ids.has(id))
      throw new PoseidonValidationError(`Duplicate id ${id} in ${label}.`);
    ids.add(id);
  }
}

function assertNonBlankString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim())
    throw new PoseidonValidationError(`${label} must be a non-blank string.`);
  return value.trim();
}

function assertOptionalString(value: unknown, label: string): void {
  if (value !== undefined && typeof value !== 'string')
    throw new PoseidonValidationError(`${label} must be a string.`);
}

function assertOptionalStringArray(value: unknown, label: string): void {
  if (value === undefined) return;
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== 'string')
  ) {
    throw new PoseidonValidationError(`${label} must be an array of strings.`);
  }
}

function assertIsoTimestamp(value: unknown, label: string): void {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new PoseidonValidationError(`${label} must be an ISO timestamp.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function printable(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number')
    return String(value);
  return 'unknown';
}
