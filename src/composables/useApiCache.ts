interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useApiCache<T = any>() {
  const cache = new Map<string, CacheEntry<T>>();

  /**
   * Get cached data if available and not expired
   * @param key - Cache key
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   * @returns Cached data or null if not found/expired
   */
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

  /**
   * Set data in cache
   * @param key - Cache key
   * @param data - Data to cache
   */
  const setCached = (key: string, data: T): void => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  };

  /**
   * Remove specific key from cache
   * @param key - Cache key to remove
   */
  const removeCached = (key: string): void => {
    cache.delete(key);
  };

  /**
   * Clear all cached data
   */
  const clearCache = (): void => {
    cache.clear();
  };

  /**
   * Execute a function with caching
   * @param key - Cache key
   * @param fn - Function to execute if cache miss
   * @param ttl - Time to live in milliseconds
   * @returns Promise with the result
   */
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
