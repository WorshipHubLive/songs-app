import { Storage } from 'expo-sqlite/kv-store';

/**
 * Typed, fail-safe wrapper around `expo-sqlite/kv-store` for **non-sensitive**
 * persistent data (language, theme, sync timestamps, cached user profile).
 *
 * Sensitive data (tokens, fingerprint) must go through `utils/storage.ts`
 * (SecureStore) instead — never store secrets here.
 *
 * All reads swallow errors and return a fallback so a corrupt or missing entry
 * never crashes a screen on startup.
 */

// ─── Raw string helpers ───────────────────────────────────────────────────────

/** Reads a raw string value. Returns `null` when absent or on read error. */
export function getKvItem(key: string): string | null {
  try {
    return Storage.getItemSync(key);
  } catch {
    return null;
  }
}

/** Persists a raw string value synchronously. */
export function setKvItem(key: string, value: string): void {
  Storage.setItemSync(key, value);
}

/** Removes a value synchronously. Safe to call when the key is absent. */
export function removeKvItem(key: string): void {
  Storage.removeItemSync(key);
}

// ─── JSON helpers ──────────────────────────────────────────────────────────────

/** Reads and parses a JSON value. Returns `null` when absent or unparseable. */
export function getKvJson<T>(key: string): T | null {
  const raw = getKvItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Serializes and persists a JSON value synchronously. */
export function setKvJson<T>(key: string, value: T): void {
  setKvItem(key, JSON.stringify(value));
}
