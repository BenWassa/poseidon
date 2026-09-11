import type { CreateDiveInput, Creature, UpdateDiveInput } from './domain.js';
import { PoseidonValidationError } from './errors.js';
import { assertValidIsoDate, requireNonBlank } from './utils.js';

export function mergeDiveInput(
  base: CreateDiveInput,
  update: UpdateDiveInput,
): CreateDiveInput {
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
    if (
      Object.prototype.hasOwnProperty.call(update, key) &&
      update[key] === undefined
    ) {
      delete (merged as unknown as Record<string, unknown>)[key];
    }
  }
  return merged;
}

export function validateAndNormalizeInput(
  input: CreateDiveInput,
  creatures: Map<string, Creature>,
): CreateDiveInput {
  assertValidIsoDate(input.date);
  const siteName = requireNonBlank(input.siteName, 'siteName');
  const areaName = requireNonBlank(input.areaName, 'areaName');
  if (!Number.isFinite(input.maxDepth.value) || input.maxDepth.value <= 0) {
    throw new PoseidonValidationError(
      'maxDepth.value must be a positive finite number.',
    );
  }
  if (input.maxDepth.unit !== 'm' && input.maxDepth.unit !== 'ft') {
    throw new PoseidonValidationError('maxDepth.unit must be m or ft.');
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new PoseidonValidationError(
      'durationMinutes must be a positive integer.',
    );
  }
  if (input.coordinates) {
    const { lat, lng } = input.coordinates;
    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      throw new PoseidonValidationError(
        'coordinates must contain valid latitude and longitude values.',
      );
    }
  }
  if (!Array.isArray(input.sightings)) {
    throw new PoseidonValidationError('sightings must be an array.');
  }
  const ids = new Set<string>();
  const sightings = input.sightings.map((sighting) => {
    if (!creatures.has(sighting.creatureId))
      throw new PoseidonValidationError(
        `Unknown creature reference: ${sighting.creatureId}.`,
      );
    if (ids.has(sighting.creatureId))
      throw new PoseidonValidationError(
        `Creature ${sighting.creatureId} appears more than once on the same dive.`,
      );
    ids.add(sighting.creatureId);
    return {
      creatureId: sighting.creatureId,
      ...(sighting.quantity ? { quantity: sighting.quantity } : {}),
      ...(sighting.note?.trim() ? { note: sighting.note.trim() } : {}),
    };
  });
  if (input.highlightCreatureId && !ids.has(input.highlightCreatureId)) {
    throw new PoseidonValidationError(
      'highlightCreatureId must reference a creature sighted on the dive.',
    );
  }
  const countryCode = input.countryCode?.trim().toUpperCase();
  if (countryCode && !/^[A-Z]{2}$/.test(countryCode))
    throw new PoseidonValidationError(
      'countryCode must be a two-letter code when provided.',
    );
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
    ...(buddies?.length ? { buddies } : {}),
    ...(note ? { note } : {}),
    sightings,
    ...(input.highlightCreatureId
      ? { highlightCreatureId: input.highlightCreatureId }
      : {}),
  };
}
