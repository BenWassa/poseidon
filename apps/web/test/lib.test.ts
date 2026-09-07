/**
 * Deterministic helpers: formatting a diver reads, and the ranking that
 * decides which places and creatures are offered first.
 */
import { describe, expect, it } from 'vitest';

import type { Dive } from '@poseidon/domain';

import {
  formatBottomTime,
  formatCategory,
  formatDate,
  formatDepth,
  formatMonthYear,
  formatQuantity,
  formatRelativeDate,
  pluralize,
} from '../src/lib/format';
import { mostRecentDive, sameDayContext, suggestAreas, suggestSites } from '../src/lib/suggestions';

function dive(overrides: Partial<Dive> & Pick<Dive, 'id' | 'date' | 'siteName' | 'areaName'>): Dive {
  return {
    countryCode: 'MX',
    maxDepth: { value: 18, unit: 'm' },
    durationMinutes: 45,
    sightings: [],
    createdAt: `${overrides.date}T08:00:00.000Z`,
    updatedAt: `${overrides.date}T08:00:00.000Z`,
    ...overrides,
  };
}

describe('formatting', () => {
  it('renders dates the same way on every device', () => {
    expect(formatDate('2026-10-12')).toBe('12 Oct 2026');
    expect(formatMonthYear('2026-02-01')).toBe('February 2026');
    expect(formatRelativeDate('2026-09-07', '2026-09-07')).toBe('Today');
    expect(formatRelativeDate('2026-09-06', '2026-09-07')).toBe('Yesterday');
    expect(formatRelativeDate('2026-09-01', '2026-09-07')).toBe('1 Sep 2026');
    // Month and leap-year boundaries must land on the right day.
    expect(formatRelativeDate('2026-02-28', '2026-03-01')).toBe('Yesterday');
    expect(formatRelativeDate('2024-02-29', '2024-03-01')).toBe('Yesterday');
    expect(formatRelativeDate('2024-02-28', '2024-03-01')).toBe('28 Feb 2024');
    expect(formatRelativeDate('2025-12-31', '2026-01-01')).toBe('Yesterday');
  });

  it('renders depth, duration and accumulated bottom time without judgement', () => {
    expect(formatDepth({ value: 18, unit: 'm' })).toBe('18 m');
    expect(formatDepth({ value: 18.5, unit: 'ft' })).toBe('18.5 ft');
    expect(formatBottomTime(45)).toBe('45 min');
    expect(formatBottomTime(60)).toBe('1 h');
    expect(formatBottomTime(430)).toBe('7 h 10 m');
  });

  it('uses low-friction quantity buckets rather than false precision', () => {
    expect(formatQuantity('few')).toBe('A few');
    expect(formatQuantity(undefined)).toBeNull();
  });

  it('labels categories in diver language', () => {
    expect(formatCategory('reef-fish')).toBe('Reef fish');
    expect(formatCategory('sea-turtle')).toBe('Sea turtle');
    expect(formatCategory(undefined)).toBe('Unlisted');
    expect(pluralize(1, 'dive')).toBe('1 dive');
    expect(pluralize(2, 'dive')).toBe('2 dives');
    expect(pluralize(3, 'country', 'countries')).toBe('3 countries');
  });
});

describe('place suggestions', () => {
  const history = [
    dive({ id: 'a', date: '2026-02-14', siteName: 'Palancar Gardens', areaName: 'Cozumel' }),
    dive({ id: 'b', date: '2026-02-17', siteName: 'Palancar Gardens', areaName: 'Cozumel' }),
    dive({ id: 'c', date: '2026-06-02', siteName: 'Mama Viña Wreck', areaName: 'Playa del Carmen' }),
  ];

  it('offers places the diver actually dives before curated content', () => {
    const areas = suggestAreas(history);
    expect(areas[0]?.fromHistory).toBe(true);
    expect(areas.map((area) => area.areaName)).toContain('Cozumel');
    // Curated areas still appear, just behind lived history.
    expect(areas.some((area) => !area.fromHistory)).toBe(false);
  });

  it('brings unvisited curated areas in when there is no history at all', () => {
    const areas = suggestAreas([]);
    expect(areas.map((area) => area.areaName)).toEqual(
      expect.arrayContaining(['Cozumel', 'Playa del Carmen']),
    );
    expect(areas.every((area) => !area.fromHistory)).toBe(true);
  });

  it('puts sites in the chosen area first, visited ones ahead of curated', () => {
    const sites = suggestSites(history, 'Cozumel');
    expect(sites[0]?.siteName).toBe('Palancar Gardens');
    expect(sites[0]?.fromHistory).toBe(true);
    expect(sites[0]?.diveCount).toBe(2);

    const cozumelBlock = sites.slice(0, 8);
    expect(cozumelBlock.every((site) => site.areaName === 'Cozumel')).toBe(true);
  });

  it('matches curated sites through their aliases', () => {
    const byAlias = suggestSites([], 'Cozumel', 'Paradise Reef');
    expect(byAlias.map((site) => site.siteName)).toContain('Paraíso');

    const byAccentlessName = suggestSites([], 'Cozumel', 'Paraiso');
    expect(byAccentlessName.map((site) => site.siteName)).toContain('Paraíso');
  });

  it('finds the trip context to reuse for a second dive the same day', () => {
    expect(sameDayContext(history, '2026-02-14')?.siteName).toBe('Palancar Gardens');
    expect(sameDayContext(history, '2026-03-01')).toBeNull();
    expect(mostRecentDive(history)?.id).toBe('c');
    expect(mostRecentDive([])).toBeNull();
  });
});
