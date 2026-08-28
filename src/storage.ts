import type { GameState, SavedSetup } from './types';

let databaseName = 'tableclock-local';
const STORE = 'state';

/** Demo state is deliberately a different IndexedDB database from real games. */
export function setStorageNamespace(namespace: 'real' | 'demo'): void {
  databaseName = namespace === 'demo' ? 'tableclock-demo' : 'tableclock-local';
}

export function storageNamespace(): 'real' | 'demo' {
  return databaseName === 'tableclock-demo' ? 'demo' : 'real';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readLocal<T>(key: 'setup' | 'game'): Promise<T | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readonly');
      const request = transaction.objectStore(STORE).get(key);
      request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function writeLocal(key: 'setup' | 'game', value: SavedSetup | GameState | null): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    value === null ? store.delete(key) : store.put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearLocal(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch { /* A reset can still seed fresh in-memory demo state. */ }
}
