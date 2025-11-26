/**
 * Simple API response caching utility
 * Reduces redundant API calls and improves performance
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class APICache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();

    /**
     * Get cached data if available and not expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set cache data with TTL
     */
    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * Clear specific cache entry
     */
    clear(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clearAll(): void {
        this.cache.clear();
    }

    /**
     * Clear expired entries
     */
    cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        this.cache.forEach((entry, key) => {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }
}

// Create singleton instance
export const apiCache = new APICache();

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        apiCache.cleanup();
    }, 5 * 60 * 1000);
}

/**
 * Cached fetch wrapper
 * 
 * @example
 * const data = await cachedFetch('/api/v1/reports', {
 *   headers: { Authorization: `Bearer ${token}` }
 * }, { ttl: 5 * 60 * 1000 });
 */
export async function cachedFetch<T>(
    url: string,
    options?: RequestInit,
    cacheOptions?: { ttl?: number; forceRefresh?: boolean }
): Promise<T> {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const ttl = cacheOptions?.ttl || 5 * 60 * 1000; // Default 5 minutes

    // Check cache first
    if (!cacheOptions?.forceRefresh) {
        const cached = apiCache.get<T>(cacheKey);
        if (cached) {
            return cached;
        }
    }

    // Fetch fresh data
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    apiCache.set(cacheKey, data, ttl);

    return data;
}
