/**
 * Firestore-backed PersistenceAdapter: the personal dive log lives at
 * `users/{uid}` as one document, mirroring `PersistedPersonalStateV2`.
 *
 * Two constraints from the local-first architecture this replaces shape
 * every decision below:
 *
 * 1. `PoseidonStore` awaits `persistence.write()` before advancing state,
 *    serialized on a single mutation queue (packages/domain/src/store.ts).
 *    Firestore write promises only settle on server ack, so `write()` here
 *    must resolve on local-cache acceptance instead — otherwise every
 *    offline write hangs forever and blocks all further reads.
 * 2. An offline/uncached read looks identical to "no document yet". Treating
 *    that as "safe to migrate local data up" would let a flaky first load on
 *    a new device silently overwrite real remote history. Migration only
 *    ever runs off a server-CONFIRMED read.
 */
import {
  type DocumentData,
  type DocumentSnapshot,
  doc,
  getDocFromCache,
  getDocFromServer,
  setDoc,
} from 'firebase/firestore';

import {
  LocalStoragePersistence,
  PoseidonPersistenceError,
  migratePersistedState,
  type Creature,
  type Dive,
  type PersistedPersonalStateV2,
  type PersistenceAdapter,
} from '@poseidon/domain';

import { db } from './config';

const SOFT_SIZE_LIMIT_BYTES = 700 * 1024; // Firestore's hard cap is 1 MiB.

function safeMigrate(raw: unknown): PersistedPersonalStateV2 | null {
  if (raw === null || raw === undefined) return null;
  try {
    return migratePersistedState(raw, new Date().toISOString()).state;
  } catch {
    // Malformed data on one side must not block reconciling the other.
    return null;
  }
}

/**
 * Union-merges two histories by record id, favouring whichever `Dive` was
 * updated more recently and keeping every `Creature` from both sides. This
 * runs once per app load (see `read()`), so it has to be safe whether the
 * two sides are identical (the common case — nothing changes), one side is
 * empty (first-time migration), or both diverged (two devices that each
 * logged dives before ever syncing).
 */
function mergeState(
  remote: PersistedPersonalStateV2 | null,
  local: PersistedPersonalStateV2 | null,
): { state: PersistedPersonalStateV2 | null; changed: boolean } {
  if (!remote && !local) return { state: null, changed: false };
  if (!remote) return { state: local, changed: true };
  if (!local) return { state: remote, changed: false };

  let divesChanged = false;
  const diveMap = new Map<string, Dive>(remote.dives.map((d) => [d.id, d]));
  for (const dive of local.dives) {
    const existing = diveMap.get(dive.id);
    if (!existing || dive.updatedAt > existing.updatedAt) {
      diveMap.set(dive.id, dive);
      divesChanged = true;
    }
  }

  let creaturesChanged = false;
  const creatureMap = new Map<string, Creature>(
    remote.userCreatures.map((c) => [c.id, c]),
  );
  for (const creature of local.userCreatures) {
    if (!creatureMap.has(creature.id)) {
      creatureMap.set(creature.id, creature);
      creaturesChanged = true;
    }
  }

  if (!divesChanged && !creaturesChanged) {
    return { state: remote, changed: false };
  }

  return {
    state: {
      schemaVersion: 2,
      updatedAt: new Date().toISOString(),
      dives: [...diveMap.values()],
      userCreatures: [...creatureMap.values()],
    },
    changed: true,
  };
}

export class FirestorePersistence implements PersistenceAdapter {
  private readonly docRef;
  private readonly localShadow = new LocalStoragePersistence(
    window.localStorage,
  );

  constructor(uid: string) {
    this.docRef = doc(db, 'users', uid);
  }

  async read(): Promise<unknown | null> {
    let serverSnap: DocumentSnapshot<DocumentData> | undefined;
    try {
      serverSnap = await getDocFromServer(this.docRef);
    } catch {
      serverSnap = undefined; // offline or otherwise unreachable
    }

    if (serverSnap) {
      const remote = safeMigrate(
        serverSnap.exists() ? serverSnap.data() : null,
      );
      const rawLocal = await this.localShadow.read();
      const local = safeMigrate(rawLocal);
      const { state: merged, changed } = mergeState(remote, local);

      if (changed && merged) {
        if (rawLocal !== null) this.snapshotPremigration(rawLocal);
        await this.localShadow.write(merged);
        this.pushRemote(merged);
      }
      return merged;
    }

    // Offline / unreachable: a cache miss here must NOT be read as "no
    // document exists" (see class doc comment #2). Fall back to whatever is
    // cached, then to the local shadow.
    try {
      const cacheSnap = await getDocFromCache(this.docRef);
      if (cacheSnap.exists()) return cacheSnap.data();
    } catch {
      // Nothing cached for this document yet.
    }
    return this.localShadow.read();
  }

  async write(state: PersistedPersonalStateV2): Promise<void> {
    this.assertWithinSizeLimit(state);
    // Shadow first: Firestore does not evaluate security rules locally, so a
    // write that is later rejected/rolled back on reconnect must never be
    // the diver's only copy.
    await this.localShadow.write(state);
    this.pushRemote(state);
  }

  /**
   * Deliberately not awaited by callers: Firestore write promises only
   * settle on server ack, and `PoseidonStore` awaits `persistence.write()`
   * before every subsequent read. Blocking on that ack would hang the whole
   * app offline (see class doc comment #1).
   */
  private pushRemote(state: PersistedPersonalStateV2): void {
    setDoc(this.docRef, state).catch((error: unknown) => {
      console.error(
        'Poseidon: Firestore sync failed; local copy is safe.',
        error,
      );
    });
  }

  private snapshotPremigration(rawLocal: unknown): void {
    try {
      window.localStorage.setItem(
        `poseidon.personal.premigration.${Date.now()}`,
        JSON.stringify(rawLocal),
      );
    } catch {
      // Best-effort safety net; migration proceeds regardless.
    }
  }

  private assertWithinSizeLimit(state: PersistedPersonalStateV2): void {
    const bytes = new TextEncoder().encode(JSON.stringify(state)).length;
    if (bytes > SOFT_SIZE_LIMIT_BYTES) {
      throw new PoseidonPersistenceError(
        `Poseidon's cloud record is ${Math.round(bytes / 1024)} KB, approaching Firestore's 1 MB document limit. Export a backup (Data & backup) before logging more dives.`,
      );
    }
  }
}
