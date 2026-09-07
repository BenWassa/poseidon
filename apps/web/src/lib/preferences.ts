/**
 * Small local preferences. Units are asked once and then inferred, so logging a
 * dive never starts with a settings question.
 */
import { useCallback, useEffect, useState } from 'react';

import type { DepthUnit } from '@poseidon/domain';

export const PREFERENCES_KEY = 'poseidon.preferences';

export interface Preferences {
  depthUnit: DepthUnit;
}

export const DEFAULT_PREFERENCES: Preferences = { depthUnit: 'm' };

export function readPreferences(): Preferences {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return { depthUnit: parsed.depthUnit === 'ft' ? 'ft' : 'm' };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function writePreferences(preferences: Preferences): void {
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // A full or blocked store must never stop someone logging a dive.
  }
}

const listeners = new Set<(preferences: Preferences) => void>();

export function usePreferences(): [Preferences, (next: Partial<Preferences>) => void] {
  const [preferences, setPreferences] = useState<Preferences>(() => readPreferences());

  useEffect(() => {
    const listener = (next: Preferences) => setPreferences(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const update = useCallback((next: Partial<Preferences>) => {
    const merged = { ...readPreferences(), ...next };
    writePreferences(merged);
    for (const listener of [...listeners]) listener(merged);
  }, []);

  return [preferences, update];
}
