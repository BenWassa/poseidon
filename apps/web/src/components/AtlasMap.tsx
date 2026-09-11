import { useEffect, useRef, useState } from 'react';

import type { AtlasSiteMarker } from '../lib/atlas';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS_INTEGRITY =
  'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
const LEAFLET_JS_INTEGRITY =
  'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';

interface LeafletHandler {
  enable(): void;
  disable(): void;
}

interface LeafletMapInstance {
  dragging: LeafletHandler;
  touchZoom: LeafletHandler;
  scrollWheelZoom: LeafletHandler;
  doubleClickZoom: LeafletHandler;
  boxZoom: LeafletHandler;
  keyboard: LeafletHandler;
  fitBounds(
    bounds: unknown,
    options: { padding: [number, number]; maxZoom: number },
  ): LeafletMapInstance;
  setView(center: [number, number], zoom: number): LeafletMapInstance;
  remove(): void;
}

interface LeafletLayer {
  addTo(map: LeafletMapInstance): LeafletLayer;
  bindPopup?(html: string): LeafletLayer;
}

interface LeafletApi {
  map(
    element: HTMLElement,
    options: Record<string, unknown>,
  ): LeafletMapInstance;
  tileLayer(url: string, options: Record<string, unknown>): LeafletLayer;
  circleMarker(
    position: [number, number],
    options: Record<string, unknown>,
  ): LeafletLayer;
  latLngBounds(points: Array<[number, number]>): unknown;
}

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

let leafletPromise: Promise<LeafletApi> | null = null;

function loadLeaflet(): Promise<LeafletApi> {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  const promise = new Promise<LeafletApi>((resolve, reject) => {
    if (!document.getElementById('poseidon-leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'poseidon-leaflet-css';
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      link.integrity = LEAFLET_CSS_INTEGRITY;
      link.crossOrigin = '';
      document.head.append(link);
    }

    const staleScript = document.getElementById('poseidon-leaflet-js');
    if (staleScript && !window.L) staleScript.remove();

    const script = document.createElement('script');
    script.id = 'poseidon-leaflet-js';
    script.src = LEAFLET_JS;
    script.integrity = LEAFLET_JS_INTEGRITY;
    script.crossOrigin = '';
    script.async = true;
    script.addEventListener(
      'load',
      () =>
        window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable')),
      { once: true },
    );
    script.addEventListener(
      'error',
      () => reject(new Error('Leaflet failed to load')),
      { once: true },
    );
    document.head.append(script);
  }).catch((error: unknown) => {
    document.getElementById('poseidon-leaflet-js')?.remove();
    leafletPromise = null;
    throw error;
  });

  leafletPromise = promise;
  return promise;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character] ?? character,
  );
}

function precisionLabel(site: AtlasSiteMarker): string {
  if (site.precision === 'exact-site') return 'Exact published site position';
  if (site.precision === 'reef-area') return 'Approximate reef / area position';
  return 'Approximate site position';
}

function setInteraction(map: LeafletMapInstance, enabled: boolean) {
  for (const handler of [
    map.dragging,
    map.touchZoom,
    map.scrollWheelZoom,
    map.doubleClickZoom,
    map.boxZoom,
    map.keyboard,
  ]) {
    if (enabled) handler.enable();
    else handler.disable();
  }
}

export function AtlasMap({ sites }: { sites: AtlasSiteMarker[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading',
  );
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (!containerRef.current || sites.length === 0) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus('unavailable');
      return;
    }

    let cancelled = false;
    let map: LeafletMapInstance | null = null;
    setStatus('loading');

    void loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        map = L.map(containerRef.current, {
          attributionControl: true,
          zoomControl: true,
          dragging: false,
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
        });
        mapRef.current = map;

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        for (const site of sites) {
          const visited = site.diveCount > 0;
          const marker = L.circleMarker([site.lat, site.lng], {
            radius: visited ? 8 : 6,
            weight: 2,
            color: '#075E70',
            fillColor: visited ? '#075E70' : '#FFFFFF',
            fillOpacity: 1,
          }).addTo(map);
          marker.bindPopup?.(
            `<strong>${escapeHtml(site.name)}</strong><br>${escapeHtml(site.areaName)}<br>` +
              `${escapeHtml(precisionLabel(site))}` +
              (visited
                ? `<br><strong>${site.diveCount} ${site.diveCount === 1 ? 'dive' : 'dives'} in your history</strong>`
                : ''),
          );
        }

        const points = sites.map(
          (site) => [site.lat, site.lng] as [number, number],
        );
        const firstPoint = points[0];
        if (!firstPoint) return;
        if (points.length === 1) map.setView(firstPoint, 13);
        else
          map.fitBounds(L.latLngBounds(points), {
            padding: [24, 24],
            maxZoom: 12,
          });
        setInteraction(map, false);
        if (!cancelled) setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });

    return () => {
      cancelled = true;
      map?.remove();
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [sites]);

  useEffect(() => {
    if (mapRef.current) setInteraction(mapRef.current, interactive);
  }, [interactive]);

  if (sites.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-ocean/10 bg-shallows shadow-sm">
      <div
        ref={containerRef}
        role="region"
        aria-label="Map of sourced Mexican Caribbean dive sites"
        className="h-[310px] w-full bg-gradient-to-br from-shallows to-surface"
        style={{ touchAction: interactive ? 'none' : 'pan-y' }}
      />

      {status === 'loading' ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-shallows/70 text-sm font-bold text-ocean/65">
          Loading map…
        </div>
      ) : null}

      {status === 'unavailable' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-shallows px-8 text-center">
          <p className="max-w-xs text-sm leading-relaxed font-semibold text-ocean/65">
            The basemap needs a connection. Your dive history and place pages
            remain available offline.
          </p>
        </div>
      ) : null}

      {status === 'ready' ? (
        <button
          type="button"
          onClick={() => setInteractive((value) => !value)}
          className="absolute top-3 left-3 min-h-11 rounded-full bg-white/95 px-4 text-xs font-black text-ocean shadow-md active:scale-[0.98]"
          aria-pressed={interactive}
        >
          {interactive ? 'Done' : 'Explore map'}
        </button>
      ) : null}
    </div>
  );
}
