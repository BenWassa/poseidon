/**
 * A thin reactive wrapper around the framework-independent `PoseidonStore`.
 *
 * Components never see persistence: they read through `PoseidonClient` and
 * write through `mutate`, which bumps a revision so every open query reloads.
 * Swapping localStorage for another adapter is a change here and nowhere else.
 */
import {
  LocalStoragePersistence,
  createPoseidonStore,
  type PersistenceAdapter,
  type PoseidonContent,
  type PoseidonStore,
} from '@poseidon/domain';

import { contentPack } from './content';

export class PoseidonClient {
  readonly store: PoseidonStore;

  private listeners = new Set<() => void>();
  private version = 0;

  constructor(store: PoseidonStore) {
    this.store = store;
  }

  /** Monotonic counter; every committed mutation invalidates open queries. */
  get revision(): number {
    return this.version;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): number => this.version;

  /** Runs a write and notifies subscribers once it has committed. */
  async mutate<T>(operation: (store: PoseidonStore) => Promise<T>): Promise<T> {
    const result = await operation(this.store);
    this.version += 1;
    for (const listener of [...this.listeners]) listener();
    return result;
  }
}

/**
 * localStorage is deliberate for a personal log: it is synchronous, universally
 * available, survives restart, needs no account, and a lifetime of dives is
 * kilobytes. The adapter is injectable so tests and any future IndexedDB or
 * sync adapter drop in without touching a component.
 */
function browserPersistence(): PersistenceAdapter {
  return new LocalStoragePersistence(window.localStorage);
}

export interface CreateClientOptions {
  persistence?: PersistenceAdapter;
  content?: PoseidonContent;
}

export function createPoseidonClient(options: CreateClientOptions = {}): PoseidonClient {
  return new PoseidonClient(
    createPoseidonStore({
      persistence: options.persistence ?? browserPersistence(),
      content: options.content ?? contentPack,
    }),
  );
}
