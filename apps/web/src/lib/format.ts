/**
 * Deterministic formatting. Dates are composed by hand rather than through
 * Intl so a dive reads identically on every device, in every test, offline.
 */
import type { Depth, SightingQuantity } from '@poseidon/domain';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface DateParts {
  year: number;
  month: number;
  day: number;
}

export function parseIsoDate(iso: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** `12 Oct 2026` */
export function formatDate(iso: string): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  return `${parts.day} ${MONTHS_SHORT[parts.month - 1] ?? '???'} ${parts.year}`;
}

/** `12 Oct` — for dense rails where the year is implied by context. */
export function formatDayMonth(iso: string): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  return `${parts.day} ${MONTHS_SHORT[parts.month - 1] ?? '???'}`;
}

/** `October 2026` — journal section headings. */
export function formatMonthYear(iso: string): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  return `${MONTHS_LONG[parts.month - 1] ?? '???'} ${parts.year}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function todayIso(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftIso(iso: string, days: number): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** `Today` / `Yesterday` / `12 Oct 2026`. */
export function formatRelativeDate(iso: string, today = todayIso()): string {
  if (iso === today) return 'Today';
  if (iso === shiftIso(today, -1)) return 'Yesterday';
  return formatDate(iso);
}

export function formatDepth(depth: Depth): string {
  const rounded = Math.round(depth.value * 10) / 10;
  const value = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
  return `${value} ${depth.unit}`;
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

/** `18 h 20 m` — lifetime bottom time, never framed as an achievement. */
export function formatBottomTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} m`;
}

const QUANTITY_LABELS: Record<SightingQuantity, string> = {
  one: 'One',
  few: 'A few',
  several: 'Several',
  many: 'Many',
};

export const QUANTITIES: SightingQuantity[] = ['one', 'few', 'several', 'many'];

export function formatQuantity(
  quantity: SightingQuantity | undefined,
): string | null {
  return quantity ? QUANTITY_LABELS[quantity] : null;
}

const CATEGORY_LABELS: Record<string, string> = {
  'reef-fish': 'Reef fish',
  shark: 'Shark',
  ray: 'Ray',
  'sea-turtle': 'Sea turtle',
  eel: 'Eel',
  cephalopod: 'Cephalopod',
  crustacean: 'Crustacean',
  seahorse: 'Seahorse',
};

export function formatCategory(category: string | undefined): string {
  if (!category) return 'Unlisted';
  return (
    CATEGORY_LABELS[category] ??
    category.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
  );
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** `Cozumel · Palancar Gardens` */
export function joinPlace(areaName: string, siteName: string): string {
  return `${areaName} · ${siteName}`;
}
