/**
 * Thin localStorage wrapper. Stores values as JSON strings.
 * All access is guarded with typeof window so it is safe to call on the server.
 */
function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

async function setItem(key: string, value: unknown): Promise<boolean> {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function getItem<T = unknown>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function delItem(key: string) {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

export { setItem, getItem, delItem };
