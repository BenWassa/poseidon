/**
 * FirestorePersistence carries the two constraints that make Firestore safe
 * behind PoseidonStore's synchronous-feeling write contract: `write()` must
 * resolve without waiting for a server ack (or offline logging hangs), and
 * migration must never trigger off an unconfirmed/offline read (or a flaky
 * first load on a new device could overwrite real remote history).
 */
import type { PersistedPersonalStateV2 } from '@poseidon/domain';
import type { DocumentSnapshot } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/firebase/config', () => ({
  db: {},
  auth: {},
  googleProvider: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: unknown, _collection: string, id: string) => ({ id })),
  getDocFromServer: vi.fn(),
  getDocFromCache: vi.fn(),
  setDoc: vi.fn(),
}));

const { doc, getDocFromServer, getDocFromCache, setDoc } =
  await import('firebase/firestore');
const { FirestorePersistence } =
  await import('../src/firebase/FirestorePersistence');

function state(
  overrides: Partial<PersistedPersonalStateV2> = {},
): PersistedPersonalStateV2 {
  return {
    schemaVersion: 2,
    updatedAt: '2026-01-01T00:00:00.000Z',
    dives: [],
    userCreatures: [],
    ...overrides,
  };
}

function dive(id: string, updatedAt: string) {
  return {
    id,
    date: '2026-01-01',
    siteName: 'Site',
    areaName: 'Area',
    maxDepth: { value: 20, unit: 'm' as const },
    durationMinutes: 40,
    sightings: [],
    createdAt: updatedAt,
    updatedAt,
  };
}

function missingSnapshot(): DocumentSnapshot {
  return { exists: () => false as const } as unknown as DocumentSnapshot;
}

function existingSnapshot(data: unknown): DocumentSnapshot {
  return {
    exists: () => true as const,
    data: () => data,
  } as unknown as DocumentSnapshot;
}

describe('FirestorePersistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(getDocFromServer).mockReset();
    vi.mocked(getDocFromCache).mockReset();
    vi.mocked(setDoc).mockReset().mockResolvedValue(undefined);
  });

  it('resolves write() without waiting for the server to acknowledge it', async () => {
    vi.mocked(setDoc).mockReturnValue(new Promise(() => {})); // never settles
    const persistence = new FirestorePersistence('uid-1');

    await expect(persistence.write(state())).resolves.toBeUndefined();
    expect(doc).toHaveBeenCalledWith({}, 'users', 'uid-1');
  });

  it('shadows every write to localStorage so a rejected remote write cannot lose data', async () => {
    vi.mocked(setDoc).mockRejectedValue(new Error('permission-denied'));
    const persistence = new FirestorePersistence('uid-1');

    await persistence.write(
      state({ dives: [dive('d1', '2026-01-01T00:00:00.000Z')] }),
    );

    expect(
      JSON.parse(window.localStorage.getItem('poseidon.personal') ?? 'null'),
    ).toMatchObject({
      dives: [{ id: 'd1' }],
    });
  });

  it('rejects a write approaching the 1 MiB Firestore document limit', async () => {
    const persistence = new FirestorePersistence('uid-1');
    const huge = state({
      dives: [dive('d1', '2026-01-01T00:00:00.000Z')].map((d) => ({
        ...d,
        note: 'x'.repeat(800_000),
      })),
    });

    await expect(persistence.write(huge)).rejects.toThrow(/1 MB/);
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('does not attempt migration when the server is unreachable, and falls back to the local shadow', async () => {
    window.localStorage.setItem(
      'poseidon.personal',
      JSON.stringify(
        state({ dives: [dive('local-only', '2026-01-01T00:00:00.000Z')] }),
      ),
    );
    vi.mocked(getDocFromServer).mockRejectedValue(new Error('unavailable'));
    vi.mocked(getDocFromCache).mockRejectedValue(new Error('no cache'));

    const persistence = new FirestorePersistence('uid-1');
    const result = await persistence.read();

    expect(setDoc).not.toHaveBeenCalled();
    expect(result).toMatchObject({ dives: [{ id: 'local-only' }] });
  });

  it('migrates local history up once the server confirms no remote document exists', async () => {
    const local = state({
      dives: [dive('legacy', '2026-01-01T00:00:00.000Z')],
    });
    window.localStorage.setItem('poseidon.personal', JSON.stringify(local));
    vi.mocked(getDocFromServer).mockResolvedValue(missingSnapshot());

    const persistence = new FirestorePersistence('uid-1');
    const result = await persistence.read();

    expect(result).toMatchObject({ dives: [{ id: 'legacy' }] });
    expect(setDoc).toHaveBeenCalledWith(
      { id: 'uid-1' },
      expect.objectContaining({
        dives: [expect.objectContaining({ id: 'legacy' })],
      }),
    );
    const premigrationKeys = Object.keys(window.localStorage).filter((k) =>
      k.startsWith('poseidon.personal.premigration.'),
    );
    expect(premigrationKeys).toHaveLength(1);
  });

  it('union-merges divergent local and remote history by dive id instead of picking one side', async () => {
    window.localStorage.setItem(
      'poseidon.personal',
      JSON.stringify(
        state({ dives: [dive('local-only', '2026-01-01T00:00:00.000Z')] }),
      ),
    );
    vi.mocked(getDocFromServer).mockResolvedValue(
      existingSnapshot(
        state({ dives: [dive('remote-only', '2026-01-02T00:00:00.000Z')] }),
      ),
    );

    const persistence = new FirestorePersistence('uid-1');
    const result = (await persistence.read()) as PersistedPersonalStateV2;

    expect(result.dives.map((d) => d.id).sort()).toEqual([
      'local-only',
      'remote-only',
    ]);
  });

  it('does not re-write to Firestore when local and remote already agree', async () => {
    const shared = state({ dives: [dive('same', '2026-01-01T00:00:00.000Z')] });
    window.localStorage.setItem('poseidon.personal', JSON.stringify(shared));
    vi.mocked(getDocFromServer).mockResolvedValue(existingSnapshot(shared));

    const persistence = new FirestorePersistence('uid-1');
    await persistence.read();

    expect(setDoc).not.toHaveBeenCalled();
  });
});
