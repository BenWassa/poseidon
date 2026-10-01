import {
  Bookmark,
  Check,
  ClipboardCopy,
  Play,
  RefreshCw,
  Search,
  Undo2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { creatures } from '../data/content';
import {
  currentReview,
  effectiveVerdict,
  observeCatalog,
  parseReviewHistory,
  recordReview,
  LEGACY_QUALITY_KEY,
  REVIEW_HISTORY_KEY,
  type ReviewHistory,
  type ReviewVerdict,
  type SourceAsset,
} from './assetReviewHistory';

interface SourceCatalog {
  styleFamily: string;
  updatedOn?: string;
  assets: SourceAsset[];
}

const REFERENCE_KEY = 'poseidon.dev.asset-design-references';
const MAX_REFERENCES = 4;

type ReviewFilter = 'all' | 'undecided' | ReviewVerdict;

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
  asset: SourceAsset;
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

function readHistory(): ReviewHistory {
  try {
    return parseReviewHistory(
      localStorage.getItem(REVIEW_HISTORY_KEY),
      localStorage.getItem(LEGACY_QUALITY_KEY),
    );
  } catch {
    return { schemaVersion: 2, events: [] };
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
  const [history, setHistory] = useState<ReviewHistory>(readHistory);
  const [refreshToken, setRefreshToken] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const quality = useMemo(
    () =>
      Object.fromEntries(
        (catalog?.assets ?? []).flatMap((asset) => {
          const verdict = currentReview(history, asset);
          return verdict === undefined ? [] : [[asset.id, verdict]];
        }),
      ) as Record<string, ReviewVerdict>,
    [catalog, history],
  );
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
  const historyRef = useRef(history);
  historyRef.current = history;
  const lastActionRef = useRef(lastAction);
  lastActionRef.current = lastAction;
  const queueRef = useRef({ assets: queueAssets, index: queueIndex });
  queueRef.current = { assets: queueAssets, index: queueIndex };

  useEffect(() => {
    let controller: AbortController | undefined;
    async function refreshCatalog(): Promise<void> {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      setRefreshing(true);
      try {
        const response = await fetch('/__poseidon-source-assets/catalog.json', {
          cache: 'no-store',
          signal: request.signal,
        });
        if (!response.ok) throw new Error('Source catalog is unavailable.');
        const latest = (await response.json()) as SourceCatalog;
        if (!Array.isArray(latest.assets))
          throw new Error('Invalid source catalog.');
        if (request.signal.aborted) return;
        const next = observeCatalog(
          historyRef.current,
          latest.assets,
          new Date().toISOString(),
        );
        historyRef.current = next;
        setHistory(next);
        setCatalog(latest);
        setCatalogError(false);
      } catch {
        if (!request.signal.aborted) setCatalogError(true);
      } finally {
        if (!request.signal.aborted) setRefreshing(false);
      }
    }
    function refreshWhenVisible(): void {
      if (!document.hidden) void refreshCatalog();
    }
    void refreshCatalog();
    const interval = setInterval(refreshWhenVisible, 15000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      controller?.abort();
      clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshToken]);

  useEffect(() => {
    try {
      localStorage.setItem(REFERENCE_KEY, JSON.stringify(references));
      localStorage.setItem(REVIEW_HISTORY_KEY, JSON.stringify(history));
    } catch {
      queueMicrotask(() => setStorageFailed(true));
    }
  }, [references, history]);

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

  function applyVerdict(
    asset: SourceAsset,
    verdict: ReviewVerdict,
    queueIndexAtAction?: number,
  ): void {
    const previous = currentReview(historyRef.current, asset);
    const applied = previous === verdict ? undefined : verdict;
    const next = recordReview(
      historyRef.current,
      asset,
      applied,
      applied === undefined ? 'reset' : 'review',
      new Date().toISOString(),
    );
    historyRef.current = next;
    setHistory(next);
    setLastAction({
      asset,
      name: asset.name,
      previous,
      applied,
      queueIndex: queueIndexAtAction,
    });
  }

  function undo(): void {
    const action = lastActionRef.current;
    if (!action) return;
    const next = recordReview(
      historyRef.current,
      action.asset,
      action.previous,
      'undo',
      new Date().toISOString(),
    );
    historyRef.current = next;
    setHistory(next);
    if (action.queueIndex !== undefined) setQueueIndex(action.queueIndex);
    setLastAction(null);
  }

  function startQueue(pool: SourceAsset[]): void {
    const pending = pool.filter(
      (asset) => currentReview(historyRef.current, asset) === undefined,
    );
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
    applyVerdict(asset, verdict, index);
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
    return searched.filter(
      (asset) => effectiveVerdict(history, asset) === reviewFilter,
    );
  }, [searched, reviewFilter, quality, history]);

  const counts = useMemo(() => {
    const live = { keep: 0, provisional: 0, remake: 0 };
    const effective = { keep: 0, provisional: 0, remake: 0 };
    let undecided = 0;
    let overrides = 0;
    for (const asset of catalog?.assets ?? []) {
      live[asset.status] += 1;
      effective[effectiveVerdict(history, asset)] += 1;
      const review = currentReview(history, asset);
      if (review === undefined) undecided += 1;
      else if (review !== asset.status) overrides += 1;
    }
    return {
      ...effective,
      live,
      overrides,
      undecided,
      total: catalog?.assets.length ?? 0,
    };
  }, [catalog, history]);
  const pendingCount = searched.filter(
    (asset) => quality[asset.id] === undefined,
  ).length;

  const toggleReference = (asset: SourceAsset) => {
    const id = asset.id;
    if (
      !references.includes(id) &&
      references.length < MAX_REFERENCES &&
      currentReview(historyRef.current, asset) !== 'keep'
    ) {
      applyVerdict(asset, 'keep');
    }
    setReferences((current) => {
      if (current.includes(id))
        return current.filter((reference) => reference !== id);
      return current.length === MAX_REFERENCES ? current : [...current, id];
    });
  };

  async function exportReviewSnapshot(): Promise<void> {
    const verdicts = (catalog?.assets ?? []).map((asset) => ({
      id: asset.id,
      path: asset.path,
      sha256: asset.sha256,
      verdict: effectiveVerdict(history, asset),
      liveVerdict: asset.status,
      localVerdict: currentReview(history, asset) ?? null,
    }));
    const snapshot = {
      schemaVersion: 2,
      exportedOn: new Date().toISOString(),
      designReferences: [...references],
      liveCatalog: catalog,
      verdicts,
      history: history.events,
    };
    const json = JSON.stringify(snapshot, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setToast(
        `Copied review snapshot · ${references.length} reference${references.length === 1 ? '' : 's'} · ${verdicts.length} verdict${verdicts.length === 1 ? '' : 's'}`,
      );
    } catch {
      console.log('[poseidon] asset review snapshot:', json);
      setToast('Clipboard blocked — logged review snapshot to the console');
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
              Review the current source artwork, override its quality code, and
              keep earlier decisions alongside each revision.
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
                Current catalog codes are the default. Your calls apply only to
                the exact image reviewed and stay in this browser with their
                history. Export a snapshot to apply approved changes later.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startQueue(searched)}
                disabled={pendingCount === 0}
                className="flex items-center gap-1.5 rounded-full bg-marine px-3 py-2 text-xs font-bold text-surface disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Play size={14} aria-hidden="true" />
                Review queue · {pendingCount}
              </button>
              <button
                type="button"
                onClick={() => void exportReviewSnapshot()}
                disabled={counts.total === 0 && history.events.length === 0}
                className="flex items-center gap-1.5 rounded-full border border-marine/40 bg-aqua-soft px-3 py-2 text-xs font-bold text-marine disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ClipboardCopy size={14} aria-hidden="true" />
                Export review snapshot
              </button>
            </div>
          </div>
          <div
            className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-abyss/70"
            aria-label="Current catalog coding"
          >
            <span>
              Current catalog: {counts.live.keep} Keep ·{' '}
              {counts.live.provisional} Maybe · {counts.live.remake} Remake
            </span>
            <span>{counts.overrides} local overrides</span>
            <button
              type="button"
              onClick={() => setRefreshToken((value) => value + 1)}
              disabled={refreshing}
              className="flex min-h-10 items-center gap-1.5 text-marine disabled:opacity-50"
            >
              <RefreshCw size={14} aria-hidden="true" />
              {refreshing ? 'Refreshing catalog' : 'Refresh catalog'}
            </button>
          </div>
          <p className="mt-1 text-xs text-abyss/60">
            Refreshes every 15 seconds and when you return to this tab. Filters
            below include your current-image overrides.
          </p>
          {catalogError ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              Could not refresh the catalog.{' '}
              {catalog
                ? 'Showing the last loaded state.'
                : 'Use Refresh catalog to try again.'}
            </p>
          ) : null}
          {storageFailed ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              This browser could not save review history. Export a snapshot
              before closing.
            </p>
          ) : null}
          <div
            className="mt-4 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter current quality codes"
          >
            <ReviewFilterChip
              label="All"
              count={counts.total}
              active={reviewFilter === 'all'}
              onClick={() => setReviewFilter('all')}
            />
            <ReviewFilterChip
              label="Not reviewed here"
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
                Stored locally in this browser and included in the exported
                review snapshot. Pinning one confirms Keep for this exact image;
                design references do not otherwise alter editorial status or
                runtime promotion.
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
                  onRemove={() => toggleReference(asset)}
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
                onSelect={() => toggleReference(asset)}
                verdict={quality[asset.id]}
                history={history}
                onVerdict={(verdict) => applyVerdict(asset, verdict)}
              />
            );
          })}
        </div>
      </div>

      {queueOpen ? (
        <ReviewQueue
          assets={queueAssets}
          index={queueIndex}
          history={history}
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
  history,
  onCommit,
  onNavigate,
  onClose,
}: {
  assets: SourceAsset[];
  index: number;
  history: ReviewHistory;
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
              Recorded score {asset.score.toFixed(1)}. {asset.qaNote}
            </p>
          </div>

          <div className="w-full max-w-md">
            <CandidateCoding asset={asset} history={history} />
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
  history,
  onVerdict,
}: {
  asset: SourceAsset;
  selected: boolean;
  disableSelect: boolean;
  onSelect: () => void;
  verdict: ReviewVerdict | undefined;
  history: ReviewHistory;
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
          <span
            title="Recorded editorial score"
            className="shrink-0 rounded-full bg-aqua-soft px-2 py-1 text-[0.625rem] font-bold text-abyss/70"
          >
            {asset.score.toFixed(1)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-4 text-abyss/65">
          {asset.qaNote}
        </p>

        <CandidateCoding asset={asset} history={history} inverse />
        <div
          className="mt-3 grid grid-cols-3 gap-1"
          role="group"
          aria-label={`Your quality call for ${asset.name}`}
        >
          {VERDICTS.map((option) => {
            const isActive = (verdict ?? asset.status) === option.value;
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

        {verdict !== undefined ? (
          <button
            type="button"
            onClick={() => onVerdict(verdict)}
            className="mt-1 min-h-10 text-xs font-bold text-marine"
          >
            Use catalog code
          </button>
        ) : null}
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

function verdictLabel(verdict: ReviewVerdict): string {
  return VERDICTS.find((option) => option.value === verdict)!.label;
}

function revisionLabel(path: string | null): string {
  return path?.match(/candidate-(v\d+)\.webp$/)?.[1] ?? 'Revision unknown';
}

function CandidateCoding({
  asset,
  history,
  inverse = false,
}: {
  asset: SourceAsset;
  history: ReviewHistory;
  inverse?: boolean;
}) {
  const review = currentReview(history, asset);
  const events = history.events.filter((event) => event.id === asset.id);
  const currentArtwork = creatures.find(
    (creature) => creature.id === asset.creatureId,
  )?.artwork;
  return (
    <div className="mt-3 text-xs leading-5">
      <p className="font-bold">
        Catalog: {verdictLabel(asset.status)} · {revisionLabel(asset.path)}
      </p>
      <p className="opacity-70">
        In app: {currentArtwork?.status === 'curated' ? 'artwork' : 'fallback'}
      </p>
      {review !== undefined ? (
        <p
          className={
            inverse ? 'font-semibold text-surface' : 'font-semibold text-marine'
          }
        >
          Your call: {verdictLabel(review)}
          {review === asset.status ? ' (confirmed)' : ' (override)'}
        </p>
      ) : null}
      <details className="mt-1">
        <summary
          className={`min-h-10 cursor-pointer py-2 font-semibold ${inverse ? 'text-surface' : 'text-marine'}`}
        >
          Coding history · {events.length}
        </summary>
        <ol className="space-y-3 border-t border-border pt-2">
          {[...events].reverse().map((event, index) => (
            <li key={index}>
              <p className="font-semibold">
                {event.verdict
                  ? verdictLabel(event.verdict)
                  : 'Use catalog code'}{' '}
                ·{' '}
                {event.origin === 'local'
                  ? 'Your call'
                  : event.origin === 'legacy'
                    ? 'Earlier browser call'
                    : 'Catalog'}
              </p>
              <p className="opacity-70">
                {revisionLabel(event.path)}
                {event.sha256 ? ` · ${event.sha256.slice(0, 8)}` : ''}
                {event.action === 'undo' ? ' · Undo' : ''}
              </p>
              {event.recordedOn ? (
                <time className="block opacity-60" dateTime={event.recordedOn}>
                  {new Date(event.recordedOn).toLocaleString()}
                </time>
              ) : (
                <p className="opacity-60">Date not recorded</p>
              )}
              {event.path ? (
                <a
                  href={sourceUrl(event.path)}
                  target="_blank"
                  rel="noreferrer"
                  className={`font-semibold underline underline-offset-2 ${inverse ? 'text-surface' : 'text-marine'}`}
                >
                  View source {revisionLabel(event.path)}
                  {event.sha256 ? ` · ${event.sha256.slice(0, 8)}` : ''}
                </a>
              ) : null}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
