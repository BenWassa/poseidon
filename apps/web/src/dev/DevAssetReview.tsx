import {
  Bookmark,
  Check,
  ClipboardCopy,
  Play,
  Search,
  Undo2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
const UNDO_WINDOW_MS = 6000;

const VERDICTS: readonly {
  value: ReviewVerdict;
  key: '1' | '2' | '3';
  label: string;
  active: string;
  idle: string;
}[] = [
  {
    value: 'keep',
    key: '1',
    label: 'Keep',
    active: 'bg-success text-surface',
    idle: 'bg-success-soft text-success',
  },
  {
    value: 'provisional',
    key: '2',
    label: 'Maybe',
    active: 'bg-sun text-abyss',
    idle: 'bg-sun-soft text-abyss',
  },
  {
    value: 'remake',
    key: '3',
    label: 'Remake',
    active: 'bg-danger text-surface',
    idle: 'bg-danger-soft text-danger',
  },
];

/** What just happened, so a keystroke or the toast's Undo button can reverse it. */
interface LastAction {
  id: string;
  name: string;
  previous: ReviewVerdict | undefined;
  applied: ReviewVerdict | undefined;
  /** Index this asset held in the queue when the action fired, so undo can rewind to it. */
  queueIndex?: number | undefined;
}

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

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  );
}

export function DevAssetReview() {
  const [catalog, setCatalog] = useState<SourceCatalog | null>(null);
  const [query, setQuery] = useState('');
  const [references, setReferences] = useState<string[]>(readReferences);
  const [quality, setQuality] =
    useState<Record<string, ReviewVerdict>>(readQuality);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  const [queueAssets, setQueueAssets] = useState<SourceAsset[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const queueOpen = queueAssets.length > 0;

  // Event handlers read through refs rather than closed-over state so a single
  // window keydown listener (registered once) never acts on stale data —
  // important here because keys fire faster than React re-renders while
  // flying through a queue.
  const qualityRef = useRef(quality);
  qualityRef.current = quality;
  const lastActionRef = useRef(lastAction);
  lastActionRef.current = lastAction;
  const queueRef = useRef({ assets: queueAssets, index: queueIndex });
  queueRef.current = { assets: queueAssets, index: queueIndex };

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

  useEffect(() => {
    if (!lastAction) return;
    const timer = setTimeout(() => setLastAction(null), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [lastAction]);

  // A design reference is, by definition, already a keeper — pinning one
  // shouldn't leave it sitting in "needs review". Backfills existing browsers
  // that picked references before this existed, too.
  useEffect(() => {
    if (references.length === 0) return;
    setQuality((current) => {
      let changed = false;
      const next = { ...current };
      for (const id of references) {
        if (!next[id]) {
          next[id] = 'keep';
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [references]);

  function applyVerdict(
    id: string,
    name: string,
    verdict: ReviewVerdict,
    queueIndexAtAction?: number,
  ): void {
    const previous = qualityRef.current[id];
    const cleared = previous === verdict;
    setQuality((current) => {
      const next = { ...current };
      if (cleared) delete next[id];
      else next[id] = verdict;
      return next;
    });
    setLastAction({
      id,
      name,
      previous,
      applied: cleared ? undefined : verdict,
      queueIndex: queueIndexAtAction,
    });
  }

  function undo(): void {
    const action = lastActionRef.current;
    if (!action) return;
    setQuality((current) => {
      const next = { ...current };
      if (action.previous === undefined) delete next[action.id];
      else next[action.id] = action.previous;
      return next;
    });
    if (action.queueIndex !== undefined) setQueueIndex(action.queueIndex);
    setLastAction(null);
  }

  function startQueue(pool: SourceAsset[]): void {
    const pending = pool.filter((asset) => !qualityRef.current[asset.id]);
    if (pending.length === 0) return;
    setQueueAssets(pending);
    setQueueIndex(0);
  }

  function closeQueue(): void {
    setQueueAssets([]);
    setQueueIndex(0);
  }

  function queueCommit(verdict: ReviewVerdict): void {
    const { assets: pool, index } = queueRef.current;
    const asset = pool[index];
    if (!asset) return;
    applyVerdict(asset.id, asset.name, verdict, index);
    setQueueIndex(index + 1);
  }

  // One listener for the whole component's lifetime — queue navigation/undo
  // read current state through refs, so this never needs to be re-registered.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (isTypingTarget(event.target)) return;
      const { assets: pool } = queueRef.current;
      const inQueue = pool.length > 0;

      if (inQueue) {
        if (event.key === 'Escape') {
          closeQueue();
          return;
        }
        const verdictKey = VERDICTS.find((option) => option.key === event.key);
        if (verdictKey) {
          event.preventDefault();
          queueCommit(verdictKey.value);
          return;
        }
        if (event.key === 'ArrowRight') {
          setQueueIndex((current) => Math.min(current + 1, pool.length));
          return;
        }
        if (event.key === 'ArrowLeft') {
          setQueueIndex((current) => Math.max(current - 1, 0));
          return;
        }
      }

      if (
        (event.key === 'Backspace' || event.key.toLowerCase() === 'z') &&
        lastActionRef.current
      ) {
        event.preventDefault();
        undo();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // Registered once for the component's lifetime. Every value it needs —
    // queue state, the last action, quality — is read at call time through a
    // ref, so a stale closure over `queueCommit`/`closeQueue`/`undo` is safe:
    // those functions only ever touch refs and stable state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startQueue(searched)}
                disabled={counts.undecided === 0}
                className="flex items-center gap-1.5 rounded-full bg-marine px-3 py-2 text-xs font-bold text-surface disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Play size={14} aria-hidden="true" />
                Review queue · {counts.undecided}
              </button>
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
                Stored locally in this browser. Pinning one also counts it as a
                Keep above.
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
                onVerdict={(verdict) =>
                  applyVerdict(asset.id, asset.name, verdict)
                }
              />
            );
          })}
        </div>
      </div>

      {queueOpen ? (
        <ReviewQueue
          assets={queueAssets}
          index={queueIndex}
          onCommit={queueCommit}
          onNavigate={(delta) =>
            setQueueIndex((current) =>
              Math.max(0, Math.min(current + delta, queueAssets.length)),
            )
          }
          onClose={closeQueue}
        />
      ) : null}

      {lastAction ? (
        <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-abyss py-2 pr-2 pl-4 text-xs font-bold text-surface shadow-card">
          <span>
            {lastAction.applied
              ? `${lastAction.name} → ${lastAction.applied}`
              : `Cleared ${lastAction.name}`}
          </span>
          <button
            type="button"
            onClick={undo}
            className="flex items-center gap-1 rounded-full bg-surface/15 px-2.5 py-1.5 hover:bg-surface/25"
          >
            <Undo2 size={12} aria-hidden="true" />
            Undo
          </button>
        </div>
      ) : toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-abyss px-4 py-2 text-xs font-bold text-surface shadow-card">
          {toast}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Full-screen one-at-a-time reviewer. `assets` is a fixed snapshot taken when
 * the queue opened; deciding an item doesn't remove it from this array, it
 * just advances `index`, so undo can step back to the exact item.
 */
function ReviewQueue({
  assets,
  index,
  onCommit,
  onNavigate,
  onClose,
}: {
  assets: SourceAsset[];
  index: number;
  onCommit: (verdict: ReviewVerdict) => void;
  onNavigate: (delta: 1 | -1) => void;
  onClose: () => void;
}) {
  const asset = assets[index];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-abyss/95 text-surface">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-xs font-bold tracking-[0.14em] uppercase opacity-70">
          {asset ? `${index + 1} of ${assets.length}` : 'Queue'}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review queue"
          className="rounded-full bg-surface/10 p-2 hover:bg-surface/20"
        >
          <X size={18} />
        </button>
      </div>

      {!asset ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-2xl font-extrabold">All caught up 🎉</p>
          <p className="max-w-sm text-sm opacity-70">
            Every candidate in this queue has a verdict now.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-full bg-surface px-5 py-2.5 text-sm font-extrabold text-abyss"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 pb-8">
          <img
            src={sourceUrl(asset.path)}
            alt={asset.name}
            className="max-h-[46vh] w-full max-w-md rounded-3xl bg-surface/5 object-contain"
          />
          <div className="max-w-md text-center">
            <h2 className="text-xl font-extrabold">{asset.name}</h2>
            <p className="mt-1 text-sm opacity-70">
              Generator score {asset.score.toFixed(1)} — {asset.qaNote}
            </p>
          </div>

          <div className="grid w-full max-w-md grid-cols-3 gap-3">
            {VERDICTS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onCommit(option.value)}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-sm font-extrabold ${option.idle} hover:brightness-95`}
              >
                <span className="text-lg leading-none">{option.key}</span>
                {option.label}
              </button>
            ))}
          </div>

          <p className="text-xs opacity-50">
            Press 1 / 2 / 3 · ← → to skip · Backspace to undo · Esc to close
          </p>
        </div>
      )}

      {asset ? (
        <div className="flex justify-center gap-6 pb-6 opacity-60">
          <button
            type="button"
            onClick={() => onNavigate(-1)}
            disabled={index === 0}
            className="text-xs font-bold disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => onNavigate(1)}
            className="text-xs font-bold"
          >
            Skip →
          </button>
        </div>
      ) : null}
    </div>
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
