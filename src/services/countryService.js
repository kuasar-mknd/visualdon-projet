import { isValidCountryCode } from '../utils/security';

const CACHE_KEY = 'visualdon_country_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 250; // Limit cache to ~250 countries

// Optimization: In-memory cache using Map for O(1) eviction policy (LRU by insertion order)
// This is significantly faster than Object.keys().sort() which is O(N log N)
let memoryCache = null;

// Optimization: Track pending requests to deduplicate concurrent calls
// If multiple components (e.g. Chart + Globe) request the same country simultaneously,
// they will share the same Promise.
const pendingRequests = new Map();

const getCache = () => {
  if (memoryCache !== null) return memoryCache;

  try {
    const rawCache = localStorage.getItem(CACHE_KEY);
    if (!rawCache) {
      memoryCache = new Map();
      return memoryCache;
    }

    const parsed = JSON.parse(rawCache);
    // Validate structure
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn("Invalid cache structure detected, resetting cache");
      memoryCache = new Map();
      return memoryCache;
    }

    // Convert object to Map
    memoryCache = new Map(Object.entries(parsed));
    return memoryCache;
  } catch (e) {
    console.error("Error reading cache:", e.message);
    memoryCache = new Map();
    return memoryCache;
  }
};

const setCache = (cache) => {
  // Optimization: Map preserves insertion order.
  // To enforce size limit, we can just remove the first item (oldest inserted) using the iterator.
  // This is O(1) compared to O(N log N) for sorting timestamps.
  while (cache.size > MAX_CACHE_SIZE) {
     const oldestKey = cache.keys().next().value;
     cache.delete(oldestKey);
  }

  memoryCache = cache;

  // Debounce LocalStorage write could be added here if needed, but for now we write on update.
  try {
    // Convert Map back to object for JSON storage
    const obj = Object.fromEntries(cache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error("Error writing cache:", e.message);
  }
};

export const fetchCountryDetails = async (code, language) => {
  if (!code) return null;
  
  if (!isValidCountryCode(code)) {
    console.warn(`Security: Invalid country code format rejected: ${code}`);
    return null;
  }

  const cache = getCache();
  const now = Date.now();
  
  // Check cache
  const cached = cache.get(code);
  if (cached && (now - cached.timestamp < CACHE_EXPIRY)) {
    // Refresh LRU position by re-inserting
    cache.delete(code);
    cache.set(code, cached);
    setCache(cache); // Persist updated order
    return getNameFromData(cached.data, language);
  }

  // Check pending requests
  const reqKey = `${code}`;
  if (pendingRequests.has(reqKey)) {
    return pendingRequests.get(reqKey).then(data => {
        if (!data) return null;
        return getNameFromData(data, language);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const requestPromise = (async () => {
    try {
      const safeCode = encodeURIComponent(code);
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${safeCode}`, {
        signal: controller.signal
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid API response format');
      }

      const countryData = data[0];

      if (!countryData || !countryData.name) {
        throw new Error('Missing country name data in response');
      }

      // Update cache
      cache.delete(code); // Remove if exists (update)
      cache.set(code, {
        data: countryData,
        timestamp: Date.now()
      });
      setCache(cache);

      return countryData;
    } catch (error) {
      const safeLogCode = encodeURIComponent(code);
      console.warn(`Failed to fetch data for ${safeLogCode}:`, error.message);
      return null;
    } finally {
      clearTimeout(timeoutId);
      pendingRequests.delete(reqKey);
    }
  })();

  pendingRequests.set(reqKey, requestPromise);

  // Safe handling of the promise result
  return requestPromise.then(data => {
      if (!data) return null;
      return getNameFromData(data, language);
  });
};

const getNameFromData = (data, language) => {
  if (!data) return null;
  if (language === 'fr' && data.translations && data.translations.fra) {
    return data.translations.fra.common;
  }
  return data.name.common;
};
