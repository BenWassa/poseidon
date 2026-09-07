import type { Creature, Dive, Id } from './domain.js';
import { PoseidonValidationError } from './errors.js';

export const ISO_LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function deepClone<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('en');
}

export function compareDiveNewestFirst(a: Dive, b: Dive): number {
  return (
    b.date.localeCompare(a.date) ||
    b.updatedAt.localeCompare(a.updatedAt) ||
    b.createdAt.localeCompare(a.createdAt) ||
    b.id.localeCompare(a.id)
  );
}

export function compareCreatureName(a: Creature, b: Creature): number {
  return a.commonName.localeCompare(b.commonName, undefined, { sensitivity: 'base' }) || a.id.localeCompare(b.id);
}

export function requireNonBlank(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new PoseidonValidationError(`${field} must not be blank.`);
  return trimmed;
}

export function assertValidIsoDate(value: string): void {
  if (!ISO_LOCAL_DATE.test(value)) {
    throw new PoseidonValidationError('date must be an ISO local date in YYYY-MM-DD format.');
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new PoseidonValidationError('date is not a valid calendar date.');
  }
}

export function uniqueStable(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      output.push(value);
    }
  }
  return output;
}

export function createDefaultId(prefix: string): Id {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
