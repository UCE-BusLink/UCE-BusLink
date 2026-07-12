import { get, set, del } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

/**
 * Creates an IndexedDB persister for TanStack Query.
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery'): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await set(idbValidKey, client);
      } catch (error) {
        console.error('[IDB_PERSISTER] Error saving to IndexedDB:', error);
      }
    },
    restoreClient: async () => {
      try {
        const client = await get<PersistedClient>(idbValidKey);
        return client;
      } catch (error) {
        console.error('[IDB_PERSISTER] Error restoring from IndexedDB:', error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(idbValidKey);
      } catch (error) {
        console.error('[IDB_PERSISTER] Error removing from IndexedDB:', error);
      }
    },
  };
}
