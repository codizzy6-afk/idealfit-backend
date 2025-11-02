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

// Live updates: simple version counter and timestamp per shop
function liveKey(shop: string) {
  return `live:${shop}`;
}

export function incrementWebhookVersion(shop: string) {
  const key = liveKey(shop);
  const current = cache.get<{ version: number; ts: number }>(key) || {
    version: 0,
    ts: Date.now(),
  };
  const next = { version: current.version + 1, ts: Date.now() };
  cache.set(key, next, 24 * 60 * 60 * 1000); // keep for a day
  return next;
}

export function getWebhookVersion(shop: string) {
  const key = liveKey(shop);
  return (
    cache.get<{ version: number; ts: number }>(key) || {
      version: 0,
      ts: Date.now(),
    }
  );
}

// Exchange rate cache key
export function exchangeRateKey() {
  return "exchange:usd:inr";
}

// Fetch live USD to INR exchange rate
export async function getUSDToINRRate(): Promise<number> {
  const cacheKey = exchangeRateKey();
  const cached = cache.get<number>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Try exchangerate-api.com (free tier, no API key needed)
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      headers: {
        "User-Agent": "IdealFit/1.0",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const rate = data.rates?.INR;
      
      if (rate && typeof rate === 'number' && rate > 0) {
        // Cache for 1 hour
        cache.set(cacheKey, rate, 60 * 60 * 1000);
        console.log(`✅ Fetched live USD/INR rate: ${rate.toFixed(2)}`);
        return rate;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch exchange rate from API:", error);
  }

  // Fallback to static rate if API fails
  const fallbackRate = 83.0;
  console.log(`⚠️ Using fallback USD/INR rate: ${fallbackRate}`);
  // Cache fallback for 15 minutes (shorter, so we retry sooner)
  cache.set(cacheKey, fallbackRate, 15 * 60 * 1000);
  return fallbackRate;
}


