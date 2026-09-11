import { ArrowRight, Plus, Search, Sparkles, Star, X } from 'lucide-react';
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
          <Sparkles
            size={20}
            className="shrink-0 text-lagoon"
            aria-hidden="true"
          />
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
                className="flex w-full items-center justify-between gap-3 rounded-field border border-shallows bg-surface px-4 py-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-ocean">
                    {site.siteName}
                  </span>
                  <span className="block text-xs font-medium text-ocean/50">
                    {site.areaName}
                    {site.fromHistory
                      ? ` · ${pluralize(site.diveCount, 'dive')} logged`
                      : ' · curated'}
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-ocean/30"
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
  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-ocean/60">
        Tap everything you remember meeting.
      </p>
      <div className="relative mt-5">
        <Search
          size={18}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ocean/40"
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
          <Card className="mt-4 flex items-center gap-3 bg-foam p-4">
            <p className="flex-1 text-sm font-medium text-ocean/70">
              Not in the gallery? Add it anyway — Poseidon never blocks a
              sighting.
            </p>
            <button
              type="button"
              onClick={() => void flow.addUnlisted()}
              disabled={flow.pending}
              className="flex min-h-[2.75rem] shrink-0 items-center gap-1.5 rounded-full bg-coral px-4 text-sm font-black text-white"
            >
              <Plus size={16} aria-hidden="true" />
              Add “{flow.query.trim()}”
            </button>
          </Card>
        </section>
      ) : (
        (
          [
            ['Likely here', flow.groups.local],
            ['You have seen before', flow.groups.familiar],
            ['More from the reef', flow.groups.rest],
          ] as Array<[string, Creature[]]>
        )
          .filter(([, list]) => list.length)
          .map(([title, list]) => (
            <section
              key={title}
              className="mt-6"
              aria-labelledby={`group-${title}`}
            >
              <h2
                id={`group-${title}`}
                className="mb-3 text-[11px] font-bold tracking-[0.14em] text-lagoon uppercase"
              >
                {title}
              </h2>
              <CreatureGrid creatures={list} flow={flow} priority />
            </section>
          ))
      )}
    </div>
  );
}

export function MemoryStep({ flow }: { flow: LogDiveController }) {
  return (
    <div className="mt-6 space-y-6">
      <section aria-labelledby="review-creatures">
        <h2
          id="review-creatures"
          className="mb-3 text-[11px] font-bold tracking-[0.14em] text-lagoon uppercase"
        >
          {flow.selectedCreatures.length
            ? `${pluralize(flow.selectedCreatures.length, 'creature')} · tap a star to choose the highlight`
            : 'No creatures selected'}
        </h2>
        {!flow.selectedCreatures.length ? (
          <Card className="p-5">
            <p className="text-sm font-medium text-ocean/60">
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
                      className="w-14 rounded-2xl"
                    />
                    <p className="min-w-0 flex-1 truncate text-sm font-bold text-ocean">
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
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${flow.draft.highlightCreatureId === creature.id ? 'bg-sand text-white' : 'bg-shallows text-ocean/40'}`}
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
        <Card className="border-coral/40 bg-coral-soft p-4">
          <p className="text-sm font-bold text-ocean">{flow.error.message}</p>
        </Card>
      ) : null}
    </div>
  );
}
