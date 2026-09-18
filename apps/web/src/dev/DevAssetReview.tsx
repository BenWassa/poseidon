import { Bookmark, Check, ClipboardCopy, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type EditorialStatus = 'keep' | 'provisional' | 'remake';

interface SourceAsset {
  id: string;
  name: string;
  path: string;
  score: number;
  status: EditorialStatus;
  identity: string;
  qaNote: string;
}

interface SourceCatalog {
  styleFamily: string;
  assets: SourceAsset[];
}

const REFERENCE_KEY = 'poseidon.dev.asset-design-references';
const MAX_REFERENCES = 4;

/**
 * Your own per-candidate verdict, distinct from `asset.status` in
 * `catalog.json`. The catalog's status is the generator's own self-assessment
 * at import time and is machine-validated pipeline authority; it is never
 * written from the browser. This is a personal review queue that sits next to
 * it, so working through the 56 candidates and deciding which deserve
 * promotion doesn't require opening JSON by hand.
 */
type ReviewVerdict = 'keep' | 'provisional' | 'remake';
type ReviewFilter = 'all' | 'undecided' | ReviewVerdict;

const QUALITY_KEY = 'poseidon.dev.asset-quality-review';

const VERDICTS: readonly {
  value: ReviewVerdict;
  label: string;
  active: string;
}[] = [
  { value: 'keep', label: 'Keep', active: 'bg-success-soft text-success' },
  {
    value: 'provisional',
    label: 'Maybe',
    active: 'bg-sun-soft text-abyss',
  },
  { value: 'remake', label: 'Remake', active: 'bg-danger-soft text-danger' },
];

function readReferences(): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(REFERENCE_KEY) ?? '[]',
    );
    return Array.isArray(value)
      ? value
          .filter((id): id is string => typeof id === 'string')
          .slice(0, MAX_REFERENCES)
      : [];
  } catch {
    return [];
  }
}

function readQuality(): Record<string, ReviewVerdict> {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(QUALITY_KEY) ?? '{}',
    );
    if (typeof value !== 'object' || value === null) return {};
    const entries = Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, ReviewVerdict] =>
        entry[1] === 'keep' ||
        entry[1] === 'provisional' ||
        entry[1] === 'remake',
    );
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

function sourceUrl(path: string): string {
  const prefix = 'assets/source/creatures/';
  return `/__poseidon-source-assets/${path.slice(prefix.length)}`;
}

export function DevAssetReview() {
  const [catalog, setCatalog] = useState<SourceCatalog | null>(null);
  const [query, setQuery] = useState('');
  const [references, setReferences] = useState<string[]>(readReferences);
  const [quality, setQuality] =
    useState<Record<string, ReviewVerdict>>(readQuality);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/__poseidon-source-assets/catalog.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Source catalog is unavailable.');
        return response.json() as Promise<SourceCatalog>;
      })
      .then(setCatalog)
      .catch(() => setCatalog({ styleFamily: '', assets: [] }));
  }, []);

  useEffect(() => {
    localStorage.setItem(REFERENCE_KEY, JSON.stringify(references));
  }, [references]);

  useEffect(() => {
    localStorage.setItem(QUALITY_KEY, JSON.stringify(quality));
  }, [quality]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const searched = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!catalog || !normalized) return catalog?.assets ?? [];
    return catalog.assets.filter((asset) =>
      `${asset.name} ${asset.id} ${asset.qaNote}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [catalog, query]);

  const assets = useMemo(() => {
    if (reviewFilter === 'all') return searched;
    if (reviewFilter === 'undecided')
      return searched.filter((asset) => !quality[asset.id]);
    return searched.filter((asset) => quality[asset.id] === reviewFilter);
  }, [searched, reviewFilter, quality]);

  const counts = useMemo(() => {
    const total = catalog?.assets.length ?? 0;
    const byVerdict = { keep: 0, provisional: 0, remake: 0 };
    for (const verdict of Object.values(quality)) byVerdict[verdict] += 1;
    const decided = byVerdict.keep + byVerdict.provisional + byVerdict.remake;
    return { ...byVerdict, undecided: total - decided, total };
  }, [catalog, quality]);

  const toggleReference = (id: string) => {
    setReferences((current) => {
      if (current.includes(id))
        return current.filter((reference) => reference !== id);
      return current.length === MAX_REFERENCES ? current : [...current, id];
    });
  };

  const setVerdict = (id: string, verdict: ReviewVerdict) => {
    setQuality((current) => {
      if (current[id] === verdict) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: verdict };
    });
  };

  async function exportQuality(): Promise<void> {
    const rows = Object.entries(quality)
      .map(([id, verdict]) => ({ id, verdict }))
      .sort((a, b) => a.id.localeCompare(b.id));
    const json = JSON.stringify(rows, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setToast(
        `Copied ${rows.length} review verdict${rows.length === 1 ? '' : 's'} as JSON`,
      );
    } catch {
      console.log('[poseidon] asset quality review:', json);
      setToast('Clipboard blocked — logged JSON to the console instead');
    }
  }

  const referenceAssets =
    catalog?.assets.filter((asset) => references.includes(asset.id)) ?? [];
  const atLimit = references.length === MAX_REFERENCES;

  return (
    <section className="min-h-full bg-canvas px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[82rem]">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-marine uppercase">
              Development only
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-abyss">
              Source art review
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-abyss/70">
              Compare immutable source candidates, decide keep / maybe / remake
              on each, and pin up to {MAX_REFERENCES} visual references for
              future creature-art work.
            </p>
          </div>
          <label className="relative block w-full sm:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-abyss/55"
              size={18}
              aria-hidden="true"
            />
            <span className="sr-only">Search source art</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search candidates"
              className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-11 text-sm outline-none placeholder:text-abyss/45 focus:border-marine"
            />
          </label>
        </header>

        <section
          className="border-b border-border py-5"
          aria-labelledby="quality-review"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                id="quality-review"
                className="text-sm font-extrabold text-abyss"
              >
                Your quality review
              </h2>
              <p className="mt-1 text-xs text-abyss/65">
                Your own call per candidate, stored locally in this browser. It
                never edits <code>catalog.json</code> or promotes anything —
                export it and apply changes by hand when you're ready.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void exportQuality()}
              disabled={counts.total - counts.undecided === 0}
              className="flex items-center gap-1.5 rounded-full border border-marine/40 bg-aqua-soft px-3 py-2 text-xs font-bold text-marine disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ClipboardCopy size={14} aria-hidden="true" />
              Export review
            </button>
          </div>
          <div
            className="mt-4 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by your review"
          >
            <ReviewFilterChip
              label="All"
              count={counts.total}
              active={reviewFilter === 'all'}
              onClick={() => setReviewFilter('all')}
            />
            <ReviewFilterChip
              label="Needs review"
              count={counts.undecided}
              active={reviewFilter === 'undecided'}
              onClick={() => setReviewFilter('undecided')}
            />
            <ReviewFilterChip
              label="Keep"
              count={counts.keep}
              active={reviewFilter === 'keep'}
              onClick={() => setReviewFilter('keep')}
              tone="bg-success-soft text-success"
            />
            <ReviewFilterChip
              label="Maybe"
              count={counts.provisional}
              active={reviewFilter === 'provisional'}
              onClick={() => setReviewFilter('provisional')}
              tone="bg-sun-soft text-abyss"
            />
            <ReviewFilterChip
              label="Remake"
              count={counts.remake}
              active={reviewFilter === 'remake'}
              onClick={() => setReviewFilter('remake')}
              tone="bg-danger-soft text-danger"
            />
          </div>
        </section>

        <section
          className="border-b border-border py-5"
          aria-labelledby="design-references"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2
                id="design-references"
                className="text-sm font-extrabold text-abyss"
              >
                Design references
              </h2>
              <p className="mt-1 text-xs text-abyss/65">
                Stored locally in this browser. These do not alter editorial
                status or runtime promotion.
              </p>
            </div>
            {references.length ? (
              <button
                type="button"
                onClick={() => setReferences([])}
                className="text-xs font-bold text-marine underline underline-offset-4"
              >
                Clear all
              </button>
            ) : null}
          </div>
          {referenceAssets.length ? (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {referenceAssets.map((asset) => (
                <ReferenceThumb
                  key={asset.id}
                  asset={asset}
                  onRemove={() => toggleReference(asset.id)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-abyss/60">
              Choose the strongest examples below to establish the visual bar.
            </p>
          )}
        </section>

        {catalog && catalog.assets.length === 0 ? (
          <p className="py-12 text-sm text-danger">
            The development server could not load the source catalog.
          </p>
        ) : null}
        <p className="pt-5 text-xs font-semibold text-abyss/60">
          {assets.length} candidates{' '}
          {catalog?.styleFamily ? `· ${catalog.styleFamily}` : ''}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((asset) => {
            const selected = references.includes(asset.id);
            return (
              <AssetCard
                key={asset.id}
                asset={asset}
                selected={selected}
                disableSelect={atLimit && !selected}
                onSelect={() => toggleReference(asset.id)}
                verdict={quality[asset.id]}
                onVerdict={(verdict) => setVerdict(asset.id, verdict)}
              />
            );
          })}
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-abyss px-4 py-2 text-xs font-bold text-surface shadow-card">
          {toast}
        </div>
      ) : null}
    </section>
  );
}

function ReviewFilterChip({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
        active
          ? `border-transparent ${tone ?? 'bg-marine text-surface'}`
          : 'border-border bg-surface text-abyss/70'
      }`}
    >
      {label} · {count}
    </button>
  );
}

function ReferenceThumb({
  asset,
  onRemove,
}: {
  asset: SourceAsset;
  onRemove: () => void;
}) {
  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-sun bg-surface">
      <img
        src={sourceUrl(asset.path)}
        alt={asset.name}
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-abyss/80 p-1 text-surface"
        aria-label={`Remove ${asset.name} from design references`}
      >
        <X size={12} />
      </button>
    </div>
  );
}

function AssetCard({
  asset,
  selected,
  disableSelect,
  onSelect,
  verdict,
  onVerdict,
}: {
  asset: SourceAsset;
  selected: boolean;
  disableSelect: boolean;
  onSelect: () => void;
  verdict: ReviewVerdict | undefined;
  onVerdict: (verdict: ReviewVerdict) => void;
}) {
  return (
    <article
      className={`overflow-hidden rounded-[1.4rem] border bg-surface shadow-card ${selected ? 'border-sun ring-2 ring-sun/45' : 'border-border'}`}
    >
      <img
        src={sourceUrl(asset.path)}
        alt={asset.name}
        loading="lazy"
        className="aspect-square w-full bg-aqua-soft object-cover"
      />
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm leading-5 font-extrabold text-abyss">
            {asset.name}
          </h2>
          <span className="shrink-0 rounded-full bg-success-soft px-2 py-1 text-[0.625rem] font-bold text-success">
            {asset.score.toFixed(1)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-4 text-abyss/65">
          {asset.qaNote}
        </p>

        <div
          className="mt-3 grid grid-cols-3 gap-1"
          role="group"
          aria-label={`Your quality call for ${asset.name}`}
        >
          {VERDICTS.map((option) => {
            const isActive = verdict === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onVerdict(option.value)}
                className={`min-h-9 rounded-lg text-[0.7rem] font-extrabold ${
                  isActive ? option.active : 'bg-aqua-soft text-abyss/55'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onSelect}
          disabled={disableSelect}
          aria-pressed={selected}
          className={`mt-2 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-extrabold ${selected ? 'bg-sun-soft text-abyss' : 'bg-aqua-soft text-marine'} disabled:cursor-not-allowed disabled:opacity-45`}
        >
          {selected ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <Bookmark size={15} aria-hidden="true" />
          )}
          {selected ? 'Design reference' : 'Set as reference'}
        </button>
      </div>
    </article>
  );
}
