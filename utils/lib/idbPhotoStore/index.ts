"use client";

/**
 * IndexedDB-backed store for wizard photo File objects.
 *
 * Why IndexedDB and not localStorage?
 *   - localStorage is limited to ~5 MB per origin and stores strings only.
 *     Storing a 2 MB photo as a base64 data URL blows past that limit
 *     after 2–3 photos, which is exactly what a multi-kandang wizard hits.
 *   - IndexedDB stores binary Blobs natively, can grow to gigabytes, and
 *     survives reloads (until the user clears site data).
 *
 * Key scheme: the caller passes any string id (we use a UUID generated
 * at file-drop time in FileUploadCard). Two helper entry points
 * (`clearAll`, `pruneMissing`) are exposed for wizard-wide cleanup.
 *
 * SSR safety: every function early-returns a safe default when
 * `indexedDB` is unavailable (server render or restricted browsers).
 */

const DB_NAME = "siternak-wizard-photos";
const DB_VERSION = 1;
const STORE_NAME = "files";

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    let req: IDBOpenDBRequest;
    try {
      req = window.indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      // Throws in some sandboxed contexts (e.g. file:// in some browsers).
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
  return dbPromise;
}

function isQuotaError(err: unknown): boolean {
  if (!(err instanceof DOMException)) return false;
  return (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
}

/**
 * Persist a File under `id`. Overwrites any existing entry with the same key.
 * Resolves to true on success, false on any failure (quota, blocked, etc.).
 * Callers should log + continue with degraded UX when this returns false.
 */
export async function putPhoto(id: string, file: File): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;
  return new Promise<boolean>((resolve) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(STORE_NAME, "readwrite");
    } catch {
      resolve(false);
      return;
    }
    try {
      tx.objectStore(STORE_NAME).put(file, id);
    } catch (err) {
      if (isQuotaError(err)) {
        // No room left — abort so the onerror doesn't double-fire.
        try {
          tx.abort();
        } catch {}
      }
      resolve(false);
      return;
    }
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
    tx.onabort = () => resolve(false);
  });
}

/**
 * Retrieve a previously stored File by id. Returns null if not found or
 * if IndexedDB is unavailable. Safe to call from client-only contexts.
 */
export async function getPhoto(id: string): Promise<File | null> {
  const db = await openDB();
  if (!db) return null;
  return new Promise<File | null>((resolve) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(STORE_NAME, "readonly");
    } catch {
      resolve(null);
      return;
    }
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve((req.result as File) ?? null);
    req.onerror = () => resolve(null);
  });
}

/**
 * Remove a single photo by id. Best-effort: returns true if the call
 * completed (even when nothing matched), false if IndexedDB errored.
 */
export async function deletePhoto(id: string): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;
  return new Promise<boolean>((resolve) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(STORE_NAME, "readwrite");
    } catch {
      resolve(false);
      return;
    }
    try {
      tx.objectStore(STORE_NAME).delete(id);
    } catch {
      resolve(false);
      return;
    }
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

/**
 * Bulk-delete a list of photo ids. Use this from the wizard's `clear()`
 * to make sure no orphaned files linger in IDB after a draft is dropped.
 */
export async function deletePhotos(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDB();
  if (!db) return;
  return new Promise<void>((resolve) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(STORE_NAME, "readwrite");
    } catch {
      resolve();
      return;
    }
    const store = tx.objectStore(STORE_NAME);
    for (const id of ids) {
      try {
        store.delete(id);
      } catch {
        // One bad key shouldn't stop the rest.
      }
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

/**
 * List every photo id currently stored. Used by maintenance flows
 * (e.g. drop all orphans whose parent draft no longer exists in
 * localStorage). Cheap — IDB getAllKeys is fast for small N.
 */
export async function listPhotoIds(): Promise<string[]> {
  const db = await openDB();
  if (!db) return [];
  return new Promise<string[]>((resolve) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(STORE_NAME, "readonly");
    } catch {
      resolve([]);
      return;
    }
    const req = tx.objectStore(STORE_NAME).getAllKeys();
    req.onsuccess = () =>
      resolve((req.result as IDBValidKey[]).map((k) => String(k)));
    req.onerror = () => resolve([]);
  });
}

/**
 * Drop every photo in the store. Use for "reset all data" flows from
 * settings. Never call this on routine draft clears — that would wipe
 * unrelated drafts.
 */
export async function clearAllPhotos(): Promise<void> {
  const db = await openDB();
  if (!db) return;
  return new Promise<void>((resolve) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(STORE_NAME, "readwrite");
    } catch {
      resolve();
      return;
    }
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}
