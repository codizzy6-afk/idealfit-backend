// Simple in-memory cache with per-key TTL and invalidation

type CacheEntry<T> = { value: T; expiresAt: number };

class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const found = this.store.get(key);
    if (!found) return null;
    if (Date.now() > found.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return found.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}

export const cache = new InMemoryCache();

export function analyticsCacheKey(shop: string) {
  return `analytics:${shop}`;
}

export function billingCacheKey(shop: string) {
  return `billing:${shop}`;
}

export function invalidateShopCaches(shop: string) {
  cache.invalidateByPrefix(`analytics:${shop}`);
  cache.invalidateByPrefix(`billing:${shop}`);
}


