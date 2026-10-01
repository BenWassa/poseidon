import { describe, expect, it } from 'vitest';
import {
  currentReview,
  effectiveVerdict,
  observeCatalog,
  parseReviewHistory,
  recordReview,
  type SourceAsset,
} from '../src/dev/assetReviewHistory';

const asset: SourceAsset = {
  id: 'ray',
  creatureId: 'ray',
  name: 'Ray',
  path: 'ray/candidate-v3.webp',
  sha256: 'new',
  status: 'keep',
  score: 8,
  identity: 'ray',
  qaNote: '',
  previousCandidateMetadata: {
    path: 'ray/candidate-v1.webp',
    sha256: 'old',
    status: 'remake',
  },
};
const time = '2026-10-01T12:00:00Z';

describe('artwork coding history', () => {
  it('preserves legacy calls without attaching them to replacement artwork', () => {
    const history = observeCatalog(
      parseReviewHistory(null, '{"ray":"remake"}'),
      [asset],
      time,
    );
    expect(
      history.events.map((event) => [event.origin, event.verdict]),
    ).toEqual([
      ['legacy', 'remake'],
      ['prior-catalog', 'remake'],
      ['catalog', 'keep'],
    ]);
    expect(history.events[0]?.path).toBeNull();
    expect(effectiveVerdict(history, asset)).toBe('keep');
    expect(observeCatalog(history, [asset], time)).toBe(history);
    expect(
      parseReviewHistory(JSON.stringify(history), '{"ray":"remake"}'),
    ).toEqual(history);
  });
  it('scopes overrides to exact bytes and keeps reset and undo events', () => {
    let history = observeCatalog(parseReviewHistory(null, null), [asset], time);
    history = recordReview(history, asset, 'remake', 'review', time);
    expect(effectiveVerdict(history, asset)).toBe('remake');
    expect(effectiveVerdict(history, { ...asset, sha256: 'replacement' })).toBe(
      'keep',
    );
    expect(
      effectiveVerdict(history, { ...asset, path: 'ray/candidate-v4.webp' }),
    ).toBe('keep');
    history = recordReview(history, asset, undefined, 'reset', time);
    expect(currentReview(history, asset)).toBeUndefined();
    history = recordReview(history, asset, 'remake', 'undo', time);
    expect(currentReview(history, asset)).toBe('remake');
    expect(history.events.slice(-3).map((event) => event.action)).toEqual([
      'review',
      'reset',
      'undo',
    ]);
  });
  it('records catalog code transitions without erasing earlier codes', () => {
    let history = observeCatalog(parseReviewHistory(null, null), [asset], time);
    history = observeCatalog(history, [{ ...asset, status: 'remake' }], time);
    history = observeCatalog(history, [asset], time);
    expect(
      history.events
        .filter((event) => event.origin === 'catalog')
        .map((event) => event.verdict),
    ).toEqual(['keep', 'remake', 'keep']);
    expect(observeCatalog(history, [asset], time)).toBe(history);
  });
});
