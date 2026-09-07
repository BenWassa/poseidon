/**
 * The canonical four-step logging flow from the PRD:
 * where and when → dive basics → what did you see → memory.
 *
 * The external prototype collapsed this into two steps and dropped area,
 * duration, highlight selection, unlisted creatures and same-day reuse. Those
 * are product requirements, not decoration, so they are all here — while the
 * creature step keeps the prototype's coral-ring selection, which is the most
 * enjoyable moment in the app and the reason logging gets done at all.
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Plus, Search, Sparkles, Star, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import type { Creature, CreateDiveInput, DepthUnit, Dive, SightingQuantity } from '@poseidon/domain';

import { CreatureTile } from '../components/CreatureTile';
import { CreatureImage } from '../components/CreatureImage';
import {
  Card,
  Chip,
  CoralAction,
  Field,
  IconButton,
  PrimaryAction,
  QuietAction,
  TextArea,
  TextInput,
} from '../components/ui';
import { useCreatures, useDive, useDives } from '../data/hooks';
import { useMutation, usePoseidon } from '../data/provider';
import { QUANTITIES, formatDate, formatQuantity, pluralize, todayIso } from '../lib/format';
import { usePreferences } from '../lib/preferences';
import { sameDayContext, suggestAreas, suggestSites } from '../lib/suggestions';

const STEPS = ['Where and when', 'Dive basics', 'What did you see?', 'Memory'] as const;

interface Selection {
  creatureId: string;
  quantity?: SightingQuantity;
}

interface Draft {
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

function emptyDraft(depthUnit: DepthUnit): Draft {
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

function draftFromDive(dive: Dive): Draft {
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

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5" role="presentation">
      {STEPS.map((label, position) => (
        <span
          key={label}
          className={`h-2 rounded-full transition-all ${
            position === step ? 'w-6 bg-marine' : position < step ? 'w-2 bg-marine/45' : 'w-2 bg-shallows'
          }`}
        />
      ))}
    </div>
  );
}

/** Turns the raw text fields into a validated store input. */
function toInput(draft: Draft): CreateDiveInput {
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
    ...(buddies.length > 0 ? { buddies } : {}),
    ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
    sightings: draft.selections.map((selection) => ({
      creatureId: selection.creatureId,
      ...(selection.quantity ? { quantity: selection.quantity } : {}),
    })),
    ...(draft.highlightCreatureId ? { highlightCreatureId: draft.highlightCreatureId } : {}),
  };
}

export function LogDive({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const { diveId } = useParams<{ diveId: string }>();
  const client = usePoseidon();
  const { run, pending, error } = useMutation();
  const [preferences, setPreferences] = usePreferences();
  const { data: dives } = useDives();
  const { data: existing } = useDive(mode === 'edit' ? diveId : undefined);
  const { data: allCreatures } = useCreatures();

  const [draft, setDraft] = useState<Draft>(() => emptyDraft(preferences.depthUnit));
  const [hydrated, setHydrated] = useState(mode === 'create');
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('');
  const [ranked, setRanked] = useState<Creature[]>([]);

  // Edit mode fills the same flow from the saved dive, so there is one code
  // path for creating and correcting a record.
  useEffect(() => {
    if (mode === 'edit' && existing && !hydrated) {
      setDraft(draftFromDive(existing));
      setHydrated(true);
    }
  }, [mode, existing, hydrated]);

  const patch = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));

  const creatureIndex = useMemo(
    () => new Map((allCreatures ?? []).map((creature) => [creature.id, creature])),
    [allCreatures],
  );

  // Ordering is the domain's (region tags + personal recency); the grouping
  // below is presentation only.
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
      .then((result) => {
        if (!cancelled) setRanked(result);
      });
    return () => {
      cancelled = true;
    };
  }, [client, draft.areaName, draft.regionId, draft.countryCode, draft.siteName, draft.date, allCreatures]);

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
      if (draft.regionId && (creature.regionIds ?? []).includes(draft.regionId)) local.push(creature);
      else if (seenBefore.has(creature.id) || creature.userCreated) familiar.push(creature);
      else rest.push(creature);
    }
    return { local, familiar, rest };
  }, [ranked, draft.regionId, seenBefore]);

  const [results, setResults] = useState<Creature[] | null>(null);
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      return;
    }
    let cancelled = false;
    void client.store.searchCreatures(trimmed).then((found) => {
      if (!cancelled) setResults(found);
    });
    return () => {
      cancelled = true;
    };
  }, [client, query, allCreatures]);

  const selectedIds = new Set(draft.selections.map((selection) => selection.creatureId));

  const toggle = (creatureId: string) => {
    setDraft((current) => {
      const already = current.selections.some((selection) => selection.creatureId === creatureId);
      const selections = already
        ? current.selections.filter((selection) => selection.creatureId !== creatureId)
        : [...current.selections, { creatureId }];
      const highlightStillValid =
        current.highlightCreatureId &&
        selections.some((selection) => selection.creatureId === current.highlightCreatureId);
      return {
        ...current,
        selections,
        // Poseidon suggests the first creature added and never overrules a
        // choice the diver has made themselves.
        highlightCreatureId: highlightStillValid
          ? current.highlightCreatureId
          : (selections[0]?.creatureId ?? undefined),
      };
    });
  };

  const addUnlisted = async () => {
    const name = query.trim();
    if (!name) return;
    const creature = await run((store) => store.createUserCreature(name));
    if (!creature) return;
    toggle(creature.id);
    setQuery('');
  };

  const setQuantity = (creatureId: string, quantity: SightingQuantity) => {
    setDraft((current) => ({
      ...current,
      selections: current.selections.map((selection) =>
        selection.creatureId === creatureId
          ? { creatureId, ...(selection.quantity === quantity ? {} : { quantity }) }
          : selection,
      ),
    }));
  };

  const depthValue = Number(draft.depth);
  const durationValue = Number(draft.duration);
  const stepValid = [
    Boolean(draft.date && draft.areaName.trim() && draft.siteName.trim()),
    Number.isFinite(depthValue) && depthValue > 0 && Number.isFinite(durationValue) && durationValue > 0,
    true,
    true,
  ];

  const close = () => navigate(mode === 'edit' && diveId ? `/journal/${diveId}` : '/', { replace: true });

  const save = async () => {
    const input = toInput(draft);
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
  };

  const sameDay = mode === 'create' ? sameDayContext(dives ?? [], draft.date) : null;
  const areaOptions = suggestAreas(dives ?? [], draft.areaName).slice(0, 6);
  const siteOptions = suggestSites(dives ?? [], draft.areaName, draft.siteName).slice(0, 8);

  const selectedCreatures = draft.selections
    .map((selection) => ({ selection, creature: creatureIndex.get(selection.creatureId) }))
    .filter(
      (entry): entry is { selection: Selection; creature: Creature } => entry.creature !== undefined,
    );

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="safe-top sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-shallows bg-surface/85 px-5 pb-3 backdrop-blur-xl">
        <IconButton label="Close without saving" tone="coral" onClick={close}>
          <X size={22} aria-hidden="true" />
        </IconButton>
        <div className="flex flex-col items-center gap-1.5">
          <StepDots step={step} />
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ocean/45">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
        <div className="w-11" />
      </header>

      <div className="rail flex-1 overflow-y-auto px-5 pb-40 pt-6">
        <h1 className="text-[1.75rem] font-black leading-tight text-ocean">
          {mode === 'edit' ? 'Edit this dive' : STEPS[step]}
        </h1>
        {mode === 'edit' ? (
          <p className="mt-1 text-sm font-semibold text-lagoon">{STEPS[step]}</p>
        ) : null}

        {step === 0 ? (
          <div className="mt-6 space-y-5">
            <Field label="Date" htmlFor="dive-date">
              <TextInput
                id="dive-date"
                type="date"
                value={draft.date}
                onChange={(event) => patch({ date: event.target.value })}
              />
            </Field>

            {sameDay ? (
              <Card className="flex items-center gap-3 bg-foam p-4">
                <Sparkles size={20} className="shrink-0 text-lagoon" aria-hidden="true" />
                <p className="flex-1 text-sm font-medium text-ocean/75">
                  You already logged {sameDay.siteName} on {formatDate(sameDay.date)}.
                </p>
                <Chip
                  onClick={() =>
                    patch({
                      areaName: sameDay.areaName,
                      regionId: sameDay.regionId,
                      countryCode: sameDay.countryCode,
                    })
                  }
                >
                  Same trip
                </Chip>
              </Card>
            ) : null}

            <Field label="Area" htmlFor="dive-area" hint="Where in the world — a town, island or region.">
              <TextInput
                id="dive-area"
                value={draft.areaName}
                onChange={(event) => patch({ areaName: event.target.value, regionId: undefined })}
                placeholder="Cozumel"
                autoComplete="off"
              />
            </Field>
            {areaOptions.length > 0 ? (
              <div className="rail -mt-2 flex gap-2 overflow-x-auto pb-1">
                {areaOptions.map((area) => (
                  <Chip
                    key={`${area.areaName}-${area.regionId ?? 'free'}`}
                    selected={draft.areaName === area.areaName}
                    onClick={() =>
                      patch({
                        areaName: area.areaName,
                        regionId: area.regionId,
                        countryCode: area.countryCode,
                      })
                    }
                  >
                    {area.areaName}
                  </Chip>
                ))}
              </div>
            ) : null}

            <Field label="Dive site" htmlFor="dive-site" hint="Anything you like — curated or your own name for it.">
              <TextInput
                id="dive-site"
                value={draft.siteName}
                onChange={(event) => patch({ siteName: event.target.value })}
                placeholder="Palancar Gardens"
                autoComplete="off"
              />
            </Field>
            {siteOptions.length > 0 ? (
              <ul className="-mt-2 space-y-2">
                {siteOptions.map((site) => (
                  <li key={`${site.areaName}-${site.siteName}`}>
                    <button
                      type="button"
                      onClick={() =>
                        patch({
                          siteName: site.siteName,
                          areaName: site.areaName,
                          regionId: site.regionId,
                          countryCode: site.countryCode,
                        })
                      }
                      className="flex w-full items-center justify-between gap-3 rounded-field border border-shallows bg-surface px-4 py-3 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-ocean">{site.siteName}</span>
                        <span className="block text-xs font-medium text-ocean/50">
                          {site.areaName}
                          {site.fromHistory ? ` · ${pluralize(site.diveCount, 'dive')} logged` : ' · curated'}
                        </span>
                      </span>
                      <ArrowRight size={16} className="shrink-0 text-ocean/30" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-6 space-y-5">
            <Field label="Max depth" htmlFor="dive-depth">
              <div className="flex gap-3">
                <TextInput
                  id="dive-depth"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  value={draft.depth}
                  onChange={(event) => patch({ depth: event.target.value })}
                  placeholder="18"
                  className="flex-1"
                />
                <div className="flex shrink-0 gap-2">
                  {(['m', 'ft'] as DepthUnit[]).map((unit) => (
                    <Chip
                      key={unit}
                      selected={draft.depthUnit === unit}
                      onClick={() => patch({ depthUnit: unit })}
                      className="min-w-[3.25rem]"
                    >
                      {unit}
                    </Chip>
                  ))}
                </div>
              </div>
            </Field>

            <Field label="Duration" htmlFor="dive-duration" hint="Minutes in the water.">
              <TextInput
                id="dive-duration"
                type="number"
                inputMode="numeric"
                min={1}
                value={draft.duration}
                onChange={(event) => patch({ duration: event.target.value })}
                placeholder="47"
              />
            </Field>

            <Field label="Operator" htmlFor="dive-operator" hint="Optional.">
              <TextInput
                id="dive-operator"
                value={draft.operator}
                onChange={(event) => patch({ operator: event.target.value })}
                placeholder="Dive shop or boat"
                autoComplete="off"
              />
            </Field>

            <Field label="Buddies" htmlFor="dive-buddies" hint="Optional, separated by commas.">
              <TextInput
                id="dive-buddies"
                value={draft.buddies}
                onChange={(event) => patch({ buddies: event.target.value })}
                placeholder="Sam, Alex"
                autoComplete="off"
              />
            </Field>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-ocean/60">Tap everything you remember meeting.</p>

            <div className="relative mt-5">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ocean/40"
                aria-hidden="true"
              />
              <TextInput
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search creatures"
                aria-label="Search creatures"
                className="pl-11"
              />
            </div>

            {results ? (
              <section className="mt-6" aria-label="Search results">
                {results.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-3">
                    {results.map((creature) => (
                      <li key={creature.id}>
                        <CreatureTile
                          creature={creature}
                          selected={selectedIds.has(creature.id)}
                          onClick={() => toggle(creature.id)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Card className="mt-4 flex items-center gap-3 bg-foam p-4">
                  <p className="flex-1 text-sm font-medium text-ocean/70">
                    Not in the gallery? Add it anyway — Poseidon never blocks a sighting.
                  </p>
                  <button
                    type="button"
                    onClick={addUnlisted}
                    disabled={pending}
                    className="flex min-h-[2.75rem] shrink-0 items-center gap-1.5 rounded-full bg-coral px-4 text-sm font-black text-white"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Add “{query.trim()}”
                  </button>
                </Card>
              </section>
            ) : (
              <>
                {(
                  [
                    ['Likely here', groups.local],
                    ['You have seen before', groups.familiar],
                    ['More from the reef', groups.rest],
                  ] as Array<[string, Creature[]]>
                )
                  .filter(([, list]) => list.length > 0)
                  .map(([title, list]) => (
                    <section key={title} className="mt-6" aria-labelledby={`group-${title}`}>
                      <h2
                        id={`group-${title}`}
                        className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-lagoon"
                      >
                        {title}
                      </h2>
                      <ul className="grid grid-cols-2 gap-3">
                        {list.map((creature, position) => (
                          <li key={creature.id}>
                            <CreatureTile
                              creature={creature}
                              selected={selectedIds.has(creature.id)}
                              onClick={() => toggle(creature.id)}
                              priority={position < 4}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
              </>
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-6 space-y-6">
            <section aria-labelledby="review-creatures">
              <h2 id="review-creatures" className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-lagoon">
                {selectedCreatures.length > 0
                  ? `${pluralize(selectedCreatures.length, 'creature')} · tap a star to choose the highlight`
                  : 'No creatures selected'}
              </h2>
              {selectedCreatures.length === 0 ? (
                <Card className="p-5">
                  <p className="text-sm font-medium text-ocean/60">
                    That is fine — the dive still belongs in your record.
                  </p>
                </Card>
              ) : (
                <ul className="space-y-2.5">
                  {selectedCreatures.map(({ selection, creature }) => (
                    <li key={creature.id}>
                      <Card className="p-3">
                        <div className="flex items-center gap-3">
                          <CreatureImage creature={creature} variant="thumb" className="w-14 rounded-2xl" />
                          <p className="min-w-0 flex-1 truncate text-sm font-bold text-ocean">
                            {creature.commonName}
                          </p>
                          <button
                            type="button"
                            onClick={() => patch({ highlightCreatureId: creature.id })}
                            aria-pressed={draft.highlightCreatureId === creature.id}
                            aria-label={`Make ${creature.commonName} the highlight of this dive`}
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                              draft.highlightCreatureId === creature.id
                                ? 'bg-sand text-white'
                                : 'bg-shallows text-ocean/40'
                            }`}
                          >
                            <Star
                              size={19}
                              fill={draft.highlightCreatureId === creature.id ? 'currentColor' : 'none'}
                              aria-hidden="true"
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggle(creature.id)}
                            aria-label={`Remove ${creature.commonName} from this dive`}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-soft text-coral"
                          >
                            <X size={18} aria-hidden="true" />
                          </button>
                        </div>
                        <div className="rail mt-2.5 flex gap-2 overflow-x-auto">
                          {QUANTITIES.map((quantity) => (
                            <Chip
                              key={quantity}
                              selected={selection.quantity === quantity}
                              onClick={() => setQuantity(creature.id, quantity)}
                              className="text-xs"
                            >
                              {formatQuantity(quantity)}
                            </Chip>
                          ))}
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Field label="Note" htmlFor="dive-note" hint="Optional. What made this dive itself?">
              <TextArea
                id="dive-note"
                rows={5}
                value={draft.note}
                onChange={(event) => patch({ note: event.target.value })}
                placeholder="The current carried us along the wall and a turtle surfaced beside the group."
              />
            </Field>

            {error ? (
              <Card className="border-coral/40 bg-coral-soft p-4">
                <p className="text-sm font-bold text-ocean">{error.message}</p>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="safe-bottom absolute inset-x-0 bottom-0 z-20 flex gap-3 bg-gradient-to-t from-canvas via-canvas to-transparent px-5 pt-8">
        {step > 0 ? (
          <QuietAction type="button" onClick={() => setStep((current) => current - 1)} className="flex-1">
            Back
          </QuietAction>
        ) : null}
        {step < STEPS.length - 1 ? (
          <PrimaryAction
            type="button"
            onClick={() => setStep((current) => current + 1)}
            disabled={!stepValid[step]}
            className="flex-[2]"
          >
            {step === 1 ? 'Choose creatures' : 'Continue'}
            <ArrowRight size={20} aria-hidden="true" />
          </PrimaryAction>
        ) : (
          <CoralAction type="button" onClick={save} disabled={pending} className="flex-[2]">
            {mode === 'edit' ? 'Save changes' : 'Save this memory'}
            <Check size={20} strokeWidth={3} aria-hidden="true" />
          </CoralAction>
        )}
      </div>
    </div>
  );
}
