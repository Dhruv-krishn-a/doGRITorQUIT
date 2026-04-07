// apps/web/lib/cache.ts

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

// Store unknown instead of any (safe + eslint-compliant)
const cache = new Map<string, CacheEntry<unknown>>();

export function setCache<T>(key: string, value: T, ttlMs: number): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) return null;

  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  // Explicit cast at the boundary is correct here
  return entry.value as T;
}
