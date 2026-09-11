import type { Dive } from '@poseidon/domain';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AtlasMap } from '../src/components/AtlasMap';
import type { CuratedSite } from '../src/data/content';
import { buildAtlasMapModel, type AtlasSiteMarker } from '../src/lib/atlas';

function dive(
  siteName: string,
  areaName = 'Cozumel',
  date = '2026-09-01',
): Dive {
  return {
    id: `${areaName}-${siteName}-${date}`,
    date,
    siteName,
    areaName,
    maxDepth: { value: 20, unit: 'm' },
    durationMinutes: 45,
    sightings: [],
    createdAt: `${date}T12:00:00.000Z`,
    updatedAt: `${date}T12:00:00.000Z`,
  };
}

const sourced: CuratedSite = {
  id: 'cozumel-sourced',
  name: 'Sourced Reef',
  aliases: ['Old Reef Name'],
  regionId: 'mx-caribbean-cozumel',
  areaName: 'Cozumel',
  countryCode: 'MX',
  coordinates: {
    lat: 20.4,
    lng: -87.0,
    precision: 'approximate-site',
    sourceIds: ['source-a'],
    note: 'Published site position; not a mooring.',
  },
};

const unsourced: CuratedSite = {
  id: 'cozumel-unsourced',
  name: 'Unmapped Reef',
  aliases: [],
  regionId: 'mx-caribbean-cozumel',
  areaName: 'Cozumel',
  countryCode: 'MX',
  coordinates: undefined,
};

afterEach(() => {
  Reflect.deleteProperty(window, 'L');
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: true,
  });
});

describe('Atlas map model', () => {
  it('matches only exact normalized curated names or aliases and keeps unsourced history unplotted', () => {
    const model = buildAtlasMapModel(
      [
        dive('Old Reef Name', 'Cozumel', '2026-09-02'),
        dive('Unmapped Reef'),
        dive('Something similar to Sourced Reef'),
      ],
      [sourced, unsourced],
    );

    expect(model.sites).toHaveLength(1);
    expect(model.sites[0]).toMatchObject({
      id: sourced.id,
      diveCount: 1,
      lastDivedOn: '2026-09-02',
    });
    expect(model.mappedHistoryDiveCount).toBe(1);
    expect(model.unmappedHistoryDiveCount).toBe(2);
  });

  it('never invents a marker for a curated site with no coordinates', () => {
    const model = buildAtlasMapModel([dive('Unmapped Reef')], [unsourced]);
    expect(model.sites).toEqual([]);
    expect(model.unmappedHistoryDiveCount).toBe(1);
  });
});

describe('AtlasMap', () => {
  const markers: AtlasSiteMarker[] = [
    {
      id: 'one',
      name: 'One Reef',
      areaName: 'Cozumel',
      lat: 20.4,
      lng: -87.0,
      precision: 'approximate-site',
      provenanceNote: 'Approximate.',
      diveCount: 2,
      lastDivedOn: '2026-09-01',
    },
    {
      id: 'two',
      name: 'Two Reef',
      areaName: 'Playa del Carmen',
      lat: 20.6,
      lng: -87.1,
      precision: 'reef-area',
      provenanceNote: 'Area anchor.',
      diveCount: 0,
      lastDivedOn: null,
    },
  ];

  it('renders deterministically through Leaflet and requires an explicit gesture handoff', async () => {
    const handler = () => ({ enable: vi.fn(), disable: vi.fn() });
    const dragging = handler();
    const map = {
      dragging,
      touchZoom: handler(),
      scrollWheelZoom: handler(),
      doubleClickZoom: handler(),
      boxZoom: handler(),
      keyboard: handler(),
      fitBounds: vi.fn(),
      setView: vi.fn(),
      remove: vi.fn(),
    };
    map.fitBounds.mockReturnValue(map);
    map.setView.mockReturnValue(map);
    const markerLayer = { addTo: vi.fn(), bindPopup: vi.fn() };
    markerLayer.addTo.mockReturnValue(markerLayer);
    markerLayer.bindPopup.mockReturnValue(markerLayer);
    const tileLayer = { addTo: vi.fn() };
    tileLayer.addTo.mockReturnValue(tileLayer);
    const leaflet = {
      map: vi.fn(() => map),
      tileLayer: vi.fn(() => tileLayer),
      circleMarker: vi.fn(() => markerLayer),
      latLngBounds: vi.fn(() => ({ bounds: true })),
    };
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    Reflect.set(window, 'L', leaflet);

    const user = userEvent.setup();
    render(<AtlasMap sites={markers} />);

    await screen.findByRole('button', { name: 'Explore map' });
    expect(leaflet.map).toHaveBeenCalledTimes(1);
    expect(leaflet.circleMarker).toHaveBeenCalledTimes(2);
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    expect(dragging.disable).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Explore map' }));
    expect(dragging.enable).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Done' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(dragging.disable).toHaveBeenCalledTimes(2);
  });

  it('falls back without touching the map loader when offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    render(<AtlasMap sites={markers} />);
    expect(
      await screen.findByText(/basemap needs a connection/i),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Explore map' }),
      ).not.toBeInTheDocument(),
    );
  });
});
