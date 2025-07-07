interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useApiCache<T = any>() {
  const cache = new Map<string, CacheEntry<T>>();

  const getCached = (key: string, ttl = 5 * 60 * 1000): T | null => {
    const cached = cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > ttl;
    if (isExpired) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  };

  const setCached = (key: string, data: T): void => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  };

  const removeCached = (key: string): void => {
    cache.delete(key);
  };

  const clearCache = (): void => {
    cache.clear();
  };

  const withCache = async (
    key: string,
    fn: () => Promise<T>,
    ttl = 5 * 60 * 1000,
  ): Promise<T> => {
    const cached = getCached(key, ttl);
    if (cached !== null) {
      return cached;
    }

    const data = await fn();
    setCached(key, data);
    return data;
  };

  return {
    getCached,
    setCached,
    removeCached,
    clearCache,
    withCache,
  };
}
