import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import type { PoseidonStore } from '@poseidon/domain';

import { PoseidonClient, createPoseidonClient } from './client';

const ClientContext = createContext<PoseidonClient | null>(null);

export function PoseidonProvider({ client, children }: { client?: PoseidonClient; children: ReactNode }) {
  const [fallback] = useState(() => client ?? createPoseidonClient());
  return <ClientContext.Provider value={client ?? fallback}>{children}</ClientContext.Provider>;
}

export function usePoseidon(): PoseidonClient {
  const client = useContext(ClientContext);
  if (!client) throw new Error('usePoseidon must be used inside a PoseidonProvider.');
  return client;
}

export interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Reads derived state from the store and reloads whenever a mutation commits.
 * `key` identifies the query's inputs; changing it re-runs the loader.
 */
export function useStoreQuery<T>(key: string, loader: (store: PoseidonStore) => Promise<T>): QueryState<T> {
  const client = usePoseidon();
  const [state, setState] = useState<QueryState<T>>({ data: undefined, loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [revision, setRevision] = useState(() => client.revision);

  useEffect(() => client.subscribe(() => setRevision(client.revision)), [client]);

  useEffect(() => {
    let cancelled = false;
    setState((previous) => ({ ...previous, loading: true }));
    loaderRef
      .current(client.store)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ data: undefined, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client, key, revision]);

  return state;
}

/** Wraps a write so callers get pending state and errors without boilerplate. */
export function useMutation() {
  const client = usePoseidon();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(
    async <T,>(operation: (store: PoseidonStore) => Promise<T>): Promise<T | undefined> => {
      setPending(true);
      setError(null);
      try {
        return await client.mutate(operation);
      } catch (caught) {
        setError(caught instanceof Error ? caught : new Error(String(caught)));
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [client],
  );

  return { run, pending, error };
}
