import { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Plus,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import type { Creature, DepthUnit } from '@poseidon/domain';
import { CreatureImage } from '../../components/CreatureImage';
import { CreatureTile } from '../../components/CreatureTile';
import { Card, Chip, Field, TextArea, TextInput } from '../../components/ui';
import {
  QUANTITIES,
  formatDate,
  formatQuantity,
  pluralize,
} from '../../lib/format';
import type { LogDiveController } from './useLogDiveController';

export function WhereStep({ flow }: { flow: LogDiveController }) {
  const { draft, patch, sameDay, areaOptions, siteOptions } = flow;
  return (
    <div className="mt-6 space-y-5">
      <Field
        label="Date"
        htmlFor="dive-date"
        {...(draft.date ? { hint: formatDate(draft.date) } : {})}
      >
        <TextInput
          id="dive-date"
          type="date"
          value={draft.date}
          onChange={(event) => patch({ date: event.target.value })}
        />
      </Field>
      {sameDay ? (
        <Card className="flex items-center gap-3 bg-canvas p-4">
          <Sparkles
            size={20}
            className="shrink-0 text-abyss"
            aria-hidden="true"
          />
          <p className="flex-1 text-sm font-medium text-abyss/75">
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
      <Field
        label="Area"
        htmlFor="dive-area"
        hint="Where in the world — a town, island or region."
      >
        <TextInput
          id="dive-area"
          value={draft.areaName}
          onChange={(event) =>
            patch({ areaName: event.target.value, regionId: undefined })
          }
          placeholder="Cozumel"
          autoComplete="off"
        />
      </Field>
      {areaOptions.length ? (
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
      <Field
        label="Dive site"
        htmlFor="dive-site"
        hint="Anything you like — curated or your own name for it."
      >
        <TextInput
          id="dive-site"
          value={draft.siteName}
          onChange={(event) => patch({ siteName: event.target.value })}
          placeholder="Palancar Gardens"
          autoComplete="off"
        />
      </Field>
      {siteOptions.length ? (
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
                className="flex w-full items-center justify-between gap-3 rounded-field border border-border bg-surface px-4 py-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-abyss">
                    {site.siteName}
                  </span>
                  <span className="block text-xs font-medium text-abyss/50">
                    {site.areaName}
                    {site.fromHistory
                      ? ` · ${pluralize(site.diveCount, 'dive')} logged`
                      : ' · curated'}
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-abyss/30"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function BasicsStep({ flow }: { flow: LogDiveController }) {
  const { draft, patch } = flow;
  return (
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
      <Field
        label="Duration"
        htmlFor="dive-duration"
        hint="Minutes in the water."
      >
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
      <Field
        label="Buddies"
        htmlFor="dive-buddies"
        hint="Optional, separated by commas."
      >
        <TextInput
          id="dive-buddies"
          value={draft.buddies}
          onChange={(event) => patch({ buddies: event.target.value })}
          placeholder="Sam, Alex"
          autoComplete="off"
        />
      </Field>
    </div>
  );
}

function CreatureGrid({
  creatures,
  flow,
  priority = false,
}: {
  creatures: Creature[];
  flow: LogDiveController;
  priority?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {creatures.map((creature, position) => (
        <li key={creature.id}>
          <CreatureTile
            creature={creature}
            selected={flow.selectedIds.has(creature.id)}
            onClick={() => flow.toggle(creature.id)}
            priority={priority && position < 4}
          />
        </li>
      ))}
    </ul>
  );
}

export function CreaturesStep({ flow }: { flow: LogDiveController }) {
  const [showAll, setShowAll] = useState(false);
  const primaryGroups: Array<[string, Creature[]]> = [
    ['Likely here', flow.groups.local],
    ['You have seen before', flow.groups.familiar.slice(0, 6)],
  ];
  const moreCreatures = [...flow.groups.familiar.slice(6), ...flow.groups.rest];

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-abyss/70">
        Tap everything you remember meeting.
      </p>
      <div className="relative mt-5">
        <Search
          size={18}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-abyss/40"
          aria-hidden="true"
        />
        <TextInput
          type="search"
          value={flow.query}
          onChange={(event) => flow.setQuery(event.target.value)}
          placeholder="Search creatures"
          aria-label="Search creatures"
          className="pl-11"
        />
      </div>
      {flow.results ? (
        <section className="mt-6" aria-label="Search results">
          {flow.results.length ? (
            <CreatureGrid creatures={flow.results} flow={flow} />
          ) : null}
          <Card className="mt-4 flex flex-col items-start gap-3 bg-canvas p-4 min-[360px]:flex-row min-[360px]:items-center">
            <p className="min-w-0 flex-1 text-sm font-medium text-abyss/70">
              Not in the gallery? Add it anyway — Poseidon never blocks a
              sighting.
            </p>
            <button
              type="button"
              onClick={() => void flow.addUnlisted()}
              disabled={flow.pending}
              className="tap-lift flex min-h-[2.75rem] max-w-full items-center gap-1.5 rounded-full bg-coral px-4 text-sm font-black text-abyss"
            >
              <Plus size={16} aria-hidden="true" />
              <span className="truncate">Add “{flow.query.trim()}”</span>
            </button>
          </Card>
        </section>
      ) : (
        primaryGroups
          .filter(([, list]) => list.length)
          .map(([title, list], groupIndex) => (
            <section
              key={title}
              className="mt-6"
              aria-labelledby={`creature-group-${groupIndex}`}
            >
              <h2
                id={`creature-group-${groupIndex}`}
                className="mb-3 text-[11px] font-bold tracking-[0.14em] text-abyss uppercase"
              >
                {title}
              </h2>
              <CreatureGrid creatures={list} flow={flow} priority />
            </section>
          ))
      )}
      {!flow.results && moreCreatures.length ? (
        <section className="mt-7" aria-labelledby="more-creatures-heading">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="more-creatures-heading"
              className="text-xs font-bold tracking-[0.1em] text-abyss/75 uppercase"
            >
              Browse the reef
            </h2>
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              aria-expanded={showAll}
              className="tap-lift flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-marine"
            >
              {showAll ? 'Show less' : `Browse all ${moreCreatures.length}`}
              <ChevronDown
                size={17}
                aria-hidden="true"
                className={`transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          {showAll ? (
            <div className="animate-step-in mt-3">
              <CreatureGrid creatures={moreCreatures} flow={flow} />
            </div>
          ) : (
            <p className="mt-1 text-sm font-medium text-abyss/70">
              Search or open the full catalogue when the shortlist is not
              enough.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}

export function MemoryStep({ flow }: { flow: LogDiveController }) {
  return (
    <div className="mt-6 space-y-6">
      <section aria-labelledby="review-creatures">
        <h2
          id="review-creatures"
          className="mb-3 text-[11px] font-bold tracking-[0.14em] text-abyss uppercase"
        >
          {flow.selectedCreatures.length
            ? `${pluralize(flow.selectedCreatures.length, 'creature')} · tap a star to choose the highlight`
            : 'No creatures selected'}
        </h2>
        {!flow.selectedCreatures.length ? (
          <Card className="p-5">
            <p className="text-sm font-medium text-abyss/70">
              That is fine — the dive still belongs in your record.
            </p>
          </Card>
        ) : (
          <ul className="space-y-2.5">
            {flow.selectedCreatures.map(({ selection, creature }) => (
              <li key={creature.id}>
                <Card className="p-3">
                  <div className="flex items-center gap-3">
                    <CreatureImage
                      creature={creature}
                      variant="thumb"
                      className="w-14"
                    />
                    <p className="min-w-0 flex-1 truncate text-sm font-bold text-abyss">
                      {creature.commonName}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        flow.patch({ highlightCreatureId: creature.id })
                      }
                      aria-pressed={
                        flow.draft.highlightCreatureId === creature.id
                      }
                      aria-label={`Make ${creature.commonName} the highlight of this dive`}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${flow.draft.highlightCreatureId === creature.id ? 'bg-sun text-abyss' : 'bg-aqua-soft text-abyss/40'}`}
                    >
                      <Star
                        size={19}
                        fill={
                          flow.draft.highlightCreatureId === creature.id
                            ? 'currentColor'
                            : 'none'
                        }
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => flow.toggle(creature.id)}
                      aria-label={`Remove ${creature.commonName} from this dive`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-soft text-abyss"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="rail mt-2.5 flex gap-2 overflow-x-auto">
                    {QUANTITIES.map((quantity) => (
                      <Chip
                        key={quantity}
                        selected={selection.quantity === quantity}
                        onClick={() => flow.setQuantity(creature.id, quantity)}
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
      <Field
        label="Note"
        htmlFor="dive-note"
        hint="Optional. What made this dive itself?"
      >
        <TextArea
          id="dive-note"
          rows={5}
          value={flow.draft.note}
          onChange={(event) => flow.patch({ note: event.target.value })}
          placeholder="The current carried us along the wall and a turtle surfaced beside the group."
        />
      </Field>
      {flow.error ? (
        <Card className="border-danger/25 bg-danger-soft p-4">
          <p className="text-sm font-bold text-abyss">{flow.error.message}</p>
        </Card>
      ) : null}
    </div>
  );
}
