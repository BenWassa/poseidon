export type ReviewVerdict = 'keep' | 'provisional' | 'remake';

export interface CandidateCode {
  path: string;
  sha256: string;
  status: ReviewVerdict;
  previousCandidateMetadata?: CandidateCode;
}

export interface SourceAsset extends CandidateCode {
  id: string;
  creatureId: string;
  name: string;
  score: number;
  identity: string;
  qaNote: string;
}

export interface ReviewEvent {
  id: string;
  path: string | null;
  sha256: string | null;
  verdict: ReviewVerdict | null;
  origin: 'catalog' | 'prior-catalog' | 'local' | 'legacy';
  action: 'code' | 'review' | 'reset' | 'undo';
  recordedOn: string | null;
}

export interface ReviewHistory {
  schemaVersion: 2;
  events: ReviewEvent[];
}

export const LEGACY_QUALITY_KEY = 'poseidon.dev.asset-quality-review';
export const REVIEW_HISTORY_KEY = 'poseidon.dev.asset-review-history-v2';

function isVerdict(value: unknown): value is ReviewVerdict {
  return value === 'keep' || value === 'provisional' || value === 'remake';
}

function isEvent(value: unknown): value is ReviewEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<ReviewEvent>;
  return (
    typeof event.id === 'string' &&
    (event.path === null || typeof event.path === 'string') &&
    (event.sha256 === null || typeof event.sha256 === 'string') &&
    (event.verdict === null || isVerdict(event.verdict)) &&
    ['catalog', 'prior-catalog', 'local', 'legacy'].includes(
      event.origin ?? '',
    ) &&
    ['code', 'review', 'reset', 'undo'].includes(event.action ?? '') &&
    (event.recordedOn === null || typeof event.recordedOn === 'string')
  );
}

/** Legacy calls have no revision identity. Preserve them without applying them to new art. */
export function parseReviewHistory(
  stored: string | null,
  legacy: string | null,
): ReviewHistory {
  if (stored) {
    try {
      const value = JSON.parse(stored) as Partial<ReviewHistory>;
      if (value.schemaVersion === 2 && Array.isArray(value.events)) {
        return { schemaVersion: 2, events: value.events.filter(isEvent) };
      }
    } catch {
      // The untouched legacy key remains available for recovery.
    }
  }
  const events: ReviewEvent[] = [];
  try {
    const value: unknown = JSON.parse(legacy ?? '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [id, verdict] of Object.entries(value)) {
        if (isVerdict(verdict)) {
          events.push({
            id,
            verdict,
            path: null,
            sha256: null,
            recordedOn: null,
            origin: 'legacy',
            action: 'code',
          });
        }
      }
    }
  } catch {
    // Invalid legacy storage cannot be attributed to a candidate.
  }
  return { schemaVersion: 2, events };
}

/** Capture catalog transitions, including available prior revision codes, only once. */
export function observeCatalog(
  history: ReviewHistory,
  assets: SourceAsset[],
  observedOn: string,
): ReviewHistory {
  const events = [...history.events];
  for (const asset of assets) {
    const previous = events
      .slice()
      .reverse()
      .find((event) => event.id === asset.id && event.origin === 'catalog');
    if (!previous) {
      const revisions: CandidateCode[] = [];
      let candidate = asset.previousCandidateMetadata;
      while (candidate && revisions.length < 32) {
        if (
          !candidate.path ||
          !candidate.sha256 ||
          !isVerdict(candidate.status)
        )
          break;
        revisions.unshift(candidate);
        candidate = candidate.previousCandidateMetadata;
      }
      for (const revision of revisions) {
        events.push({
          id: asset.id,
          path: revision.path,
          sha256: revision.sha256,
          verdict: revision.status,
          origin: 'prior-catalog',
          action: 'code',
          recordedOn: null,
        });
      }
    }
    if (
      previous?.path === asset.path &&
      previous.sha256 === asset.sha256 &&
      previous.verdict === asset.status
    )
      continue;
    events.push({
      id: asset.id,
      path: asset.path,
      sha256: asset.sha256,
      verdict: asset.status,
      origin: 'catalog',
      action: 'code',
      recordedOn: observedOn,
    });
  }
  return events.length === history.events.length
    ? history
    : { schemaVersion: 2, events };
}

export function currentReview(
  history: ReviewHistory,
  asset: SourceAsset,
): ReviewVerdict | undefined {
  const event = history.events
    .slice()
    .reverse()
    .find(
      (event) =>
        event.id === asset.id &&
        event.origin === 'local' &&
        event.path === asset.path &&
        event.sha256 === asset.sha256,
    );
  return event?.verdict ?? undefined;
}

export function recordReview(
  history: ReviewHistory,
  asset: SourceAsset,
  verdict: ReviewVerdict | undefined,
  action: 'review' | 'reset' | 'undo',
  recordedOn: string,
): ReviewHistory {
  return {
    schemaVersion: 2,
    events: [
      ...history.events,
      {
        id: asset.id,
        path: asset.path,
        sha256: asset.sha256,
        verdict: verdict ?? null,
        origin: 'local',
        action,
        recordedOn,
      },
    ],
  };
}

export function effectiveVerdict(
  history: ReviewHistory,
  asset: SourceAsset,
): ReviewVerdict {
  return currentReview(history, asset) ?? asset.status;
}
