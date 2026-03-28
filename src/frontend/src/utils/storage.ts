import type { AppState } from "../store";

const DB_NAME = "dpt_db";
const STORE_NAME = "state";
const KEY = "app";
const LS_KEY = "dpt_state";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadState(): Promise<Partial<AppState> | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    // fallback to localStorage
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(state, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // fallback
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }
}

export async function getStorageUsageKB(state?: AppState): Promise<number> {
  if (state) {
    return JSON.stringify(state).length / 1024;
  }
  if (navigator.storage?.estimate) {
    try {
      const { usage } = await navigator.storage.estimate();
      return (usage ?? 0) / 1024;
    } catch {
      // fall through
    }
  }
  try {
    const raw = localStorage.getItem(LS_KEY) ?? "";
    return raw.length / 1024;
  } catch {
    return 0;
  }
}

export async function clearStorage(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
}
