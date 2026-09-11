import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Creature, SightingQuantity } from '@poseidon/domain';
import { useCreatures, useDive, useDives } from '../../data/hooks';
import { useMutation, usePoseidon } from '../../data/provider';
import { usePreferences } from '../../lib/preferences';
import {
  sameDayContext,
  suggestAreas,
  suggestSites,
} from '../../lib/suggestions';
import {
  diveDraftFromDive,
  diveDraftToInput,
  emptyDiveDraft,
  isDiveStepValid,
  type DiveDraft,
  type LogDiveMode,
  type Selection,
} from './model';

export function useLogDiveController(mode: LogDiveMode) {
  const navigate = useNavigate();
  const { diveId } = useParams<{ diveId: string }>();
  const client = usePoseidon();
  const { run, pending, error } = useMutation();
  const [preferences, setPreferences] = usePreferences();
  const { data: dives } = useDives();
  const { data: existing } = useDive(mode === 'edit' ? diveId : undefined);
  const { data: allCreatures } = useCreatures();
  const [draft, setDraft] = useState<DiveDraft>(() =>
    emptyDiveDraft(preferences.depthUnit),
  );
  const [hydrated, setHydrated] = useState(mode === 'create');
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('');
  const [ranked, setRanked] = useState<Creature[]>([]);
  const [results, setResults] = useState<Creature[] | null>(null);

  useEffect(() => {
    if (mode === 'edit' && existing && !hydrated) {
      setDraft(diveDraftFromDive(existing));
      setHydrated(true);
    }
  }, [mode, existing, hydrated]);
  const patch = useCallback(
    (changes: Partial<DiveDraft>) =>
      setDraft((current) => ({ ...current, ...changes })),
    [],
  );
  const creatureIndex = useMemo(
    () =>
      new Map((allCreatures ?? []).map((creature) => [creature.id, creature])),
    [allCreatures],
  );

  useEffect(() => {
    let cancelled = false;
    void client.store
      .listSuggestedCreatures({
        ...(draft.areaName ? { areaName: draft.areaName } : {}),
        ...(draft.regionId ? { regionId: draft.regionId } : {}),
        ...(draft.countryCode ? { countryCode: draft.countryCode } : {}),
        ...(draft.siteName ? { siteName: draft.siteName } : {}),
        date: draft.date,
      })
      .then((value) => {
        if (!cancelled) setRanked(value);
      });
    return () => {
      cancelled = true;
    };
  }, [
    client,
    draft.areaName,
    draft.regionId,
    draft.countryCode,
    draft.siteName,
    draft.date,
    allCreatures,
  ]);

  const seenBefore = useMemo(() => {
    const ids = new Set<string>();
    for (const dive of dives ?? []) {
      if (mode === 'edit' && dive.id === diveId) continue;
      for (const sighting of dive.sightings) ids.add(sighting.creatureId);
    }
    return ids;
  }, [dives, mode, diveId]);
  const groups = useMemo(() => {
    const local: Creature[] = [];
    const familiar: Creature[] = [];
    const rest: Creature[] = [];
    for (const creature of ranked) {
      if (draft.regionId && (creature.regionIds ?? []).includes(draft.regionId))
        local.push(creature);
      else if (seenBefore.has(creature.id) || creature.userCreated)
        familiar.push(creature);
      else rest.push(creature);
    }
    return { local, familiar, rest };
  }, [ranked, draft.regionId, seenBefore]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      return;
    }
    let cancelled = false;
    void client.store.searchCreatures(trimmed).then((value) => {
      if (!cancelled) setResults(value);
    });
    return () => {
      cancelled = true;
    };
  }, [client, query, allCreatures]);

  const toggle = useCallback(
    (creatureId: string) =>
      setDraft((current) => {
        const already = current.selections.some(
          (item) => item.creatureId === creatureId,
        );
        const selections = already
          ? current.selections.filter((item) => item.creatureId !== creatureId)
          : [...current.selections, { creatureId }];
        const highlightStillValid =
          current.highlightCreatureId &&
          selections.some(
            (item) => item.creatureId === current.highlightCreatureId,
          );
        return {
          ...current,
          selections,
          highlightCreatureId: highlightStillValid
            ? current.highlightCreatureId
            : selections[0]?.creatureId,
        };
      }),
    [],
  );
  const addUnlisted = useCallback(async () => {
    const name = query.trim();
    if (!name) return;
    const creature = await run((store) => store.createUserCreature(name));
    if (creature) {
      toggle(creature.id);
      setQuery('');
    }
  }, [query, run, toggle]);
  const setQuantity = useCallback(
    (creatureId: string, quantity: SightingQuantity) =>
      setDraft((current) => ({
        ...current,
        selections: current.selections.map((item) =>
          item.creatureId === creatureId
            ? {
                creatureId,
                ...(item.quantity === quantity ? {} : { quantity }),
              }
            : item,
        ),
      })),
    [],
  );
  const close = useCallback(
    () =>
      navigate(mode === 'edit' && diveId ? `/journal/${diveId}` : '/', {
        replace: true,
      }),
    [navigate, mode, diveId],
  );
  const save = useCallback(async () => {
    const input = diveDraftToInput(draft);
    if (mode === 'edit' && diveId) {
      const updated = await run((store) => store.updateDive(diveId, input));
      if (updated) navigate(`/journal/${diveId}`, { replace: true });
      return;
    }
    const created = await run((store) => store.createDive(input));
    if (created) {
      setPreferences({ depthUnit: draft.depthUnit });
      navigate(`/journal/${created.id}`, { replace: true });
    }
  }, [draft, mode, diveId, run, navigate, setPreferences]);
  const selectedIds = useMemo(
    () => new Set(draft.selections.map((item) => item.creatureId)),
    [draft.selections],
  );
  const selectedCreatures = useMemo(
    () =>
      draft.selections
        .map((selection) => ({
          selection,
          creature: creatureIndex.get(selection.creatureId),
        }))
        .filter(
          (entry): entry is { selection: Selection; creature: Creature } =>
            entry.creature !== undefined,
        ),
    [draft.selections, creatureIndex],
  );

  return {
    mode,
    draft,
    patch,
    step,
    setStep,
    query,
    setQuery,
    groups,
    results,
    selectedIds,
    selectedCreatures,
    pending,
    error,
    sameDay: mode === 'create' ? sameDayContext(dives ?? [], draft.date) : null,
    areaOptions: suggestAreas(dives ?? [], draft.areaName).slice(0, 6),
    siteOptions: suggestSites(
      dives ?? [],
      draft.areaName,
      draft.siteName,
    ).slice(0, 8),
    stepValid: isDiveStepValid(draft, step),
    toggle,
    addUnlisted,
    setQuantity,
    close,
    save,
  };
}
export type LogDiveController = ReturnType<typeof useLogDiveController>;
