import type {
  CreateDiveInput,
  DepthUnit,
  Dive,
  SightingQuantity,
} from '@poseidon/domain';
import { todayIso } from '../../lib/format';

export const LOG_DIVE_STEPS = [
  'Where and when',
  'Dive basics',
  'What did you see?',
  'Memory',
] as const;
export type LogDiveMode = 'create' | 'edit';
export interface Selection {
  creatureId: string;
  quantity?: SightingQuantity;
}
export interface DiveDraft {
  date: string;
  areaName: string;
  regionId: string | undefined;
  countryCode: string | undefined;
  siteName: string;
  depth: string;
  depthUnit: DepthUnit;
  duration: string;
  operator: string;
  buddies: string;
  note: string;
  selections: Selection[];
  highlightCreatureId: string | undefined;
}

export function emptyDiveDraft(depthUnit: DepthUnit): DiveDraft {
  return {
    date: todayIso(),
    areaName: '',
    regionId: undefined,
    countryCode: undefined,
    siteName: '',
    depth: '',
    depthUnit,
    duration: '',
    operator: '',
    buddies: '',
    note: '',
    selections: [],
    highlightCreatureId: undefined,
  };
}

export function diveDraftFromDive(dive: Dive): DiveDraft {
  return {
    date: dive.date,
    areaName: dive.areaName,
    regionId: dive.regionId,
    countryCode: dive.countryCode,
    siteName: dive.siteName,
    depth: `${dive.maxDepth.value}`,
    depthUnit: dive.maxDepth.unit,
    duration: `${dive.durationMinutes}`,
    operator: dive.operator ?? '',
    buddies: dive.buddies?.join(', ') ?? '',
    note: dive.note ?? '',
    selections: dive.sightings.map((sighting) => ({
      creatureId: sighting.creatureId,
      ...(sighting.quantity ? { quantity: sighting.quantity } : {}),
    })),
    highlightCreatureId: dive.highlightCreatureId,
  };
}

export function diveDraftToInput(draft: DiveDraft): CreateDiveInput {
  const buddies = draft.buddies
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return {
    date: draft.date,
    siteName: draft.siteName.trim(),
    areaName: draft.areaName.trim(),
    ...(draft.countryCode ? { countryCode: draft.countryCode } : {}),
    ...(draft.regionId ? { regionId: draft.regionId } : {}),
    maxDepth: { value: Number(draft.depth), unit: draft.depthUnit },
    durationMinutes: Math.round(Number(draft.duration)),
    ...(draft.operator.trim() ? { operator: draft.operator.trim() } : {}),
    ...(buddies.length ? { buddies } : {}),
    ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
    sightings: draft.selections.map((selection) => ({
      creatureId: selection.creatureId,
      ...(selection.quantity ? { quantity: selection.quantity } : {}),
    })),
    ...(draft.highlightCreatureId
      ? { highlightCreatureId: draft.highlightCreatureId }
      : {}),
  };
}

export function isDiveStepValid(draft: DiveDraft, step: number): boolean {
  if (step === 0)
    return Boolean(
      draft.date && draft.areaName.trim() && draft.siteName.trim(),
    );
  if (step !== 1) return true;
  const depth = Number(draft.depth);
  const duration = Number(draft.duration);
  return (
    Number.isFinite(depth) &&
    depth > 0 &&
    Number.isFinite(duration) &&
    duration > 0
  );
}
