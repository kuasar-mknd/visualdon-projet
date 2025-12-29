import { isValidCountryCode } from '../utils/security';

const CACHE_KEY = 'visualdon_country_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 250; // Limit cache to ~250 countries to prevent localStorage exhaustion

// Optimization: In-memory cache to avoid frequent synchronous localStorage reads/parsing
// This significantly reduces main-thread blocking during animations where fetchCountryDetails is called repeatedly.
let memoryCache = null;

// Debounce timer for localStorage writes
let cacheWriteTimer = null;

const getCache = () => {
  if (memoryCache !== null) return memoryCache;

  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) {
      memoryCache = {};
      return memoryCache;
    }

    const parsed = JSON.parse(cache);
    // Security Enhancement: Validate that parsed cache is actually an object
    // to prevent crashes if localStorage contains "null" or other non-object JSON values
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn("Invalid cache structure detected, resetting cache");
      memoryCache = {};
      return memoryCache;
    }

    memoryCache = parsed;
    return memoryCache;
  } catch (e) {
    console.error("Error reading cache:", e.message);
    memoryCache = {};
    return memoryCache;
  }
};

const setCache = (cache) => {
  // Update memory cache immediately
  memoryCache = cache;

  // Debounce the expensive localStorage write
  if (cacheWriteTimer) clearTimeout(cacheWriteTimer);

  cacheWriteTimer = setTimeout(() => {
      // Security Enhancement: Prevent unlimited growth of localStorage (DoS risk)
      const keys = Object.keys(memoryCache);
      if (keys.length > MAX_CACHE_SIZE) {
        // Sort keys by timestamp (oldest first) to implement LRU-like eviction
        const sortedKeys = keys.sort((a, b) => (memoryCache[a].timestamp || 0) - (memoryCache[b].timestamp || 0));

        // Remove oldest entries to bring size down to limit
        const keysToRemove = sortedKeys.slice(0, keys.length - MAX_CACHE_SIZE);
        keysToRemove.forEach(key => delete memoryCache[key]);
      }

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
      } catch (e) {
        console.error("Error writing cache:", e.message);
      }
  }, 2000); // 2 seconds delay
};

export const fetchCountryDetails = async (code, language) => {
  if (!code) return null;
  
  // Security Enhancement: Validate input format
  // Expected: ISO 3166-1 alpha-2 or alpha-3 code (2-3 letters/digits)
  // This prevents URL injection and cache pollution with garbage keys
  if (!isValidCountryCode(code)) {
    console.warn(`Security: Invalid country code format rejected: ${code}`);
    return null;
  }

  // Normalize code to 2 chars if possible, but API supports 3 chars too.
  // Our data uses 3 char codes (ISO 3166-1 alpha-3).
  // restcountries supports alpha codes.

  const cache = getCache();
  const now = Date.now();
  
  if (cache[code] && (now - cache[code].timestamp < CACHE_EXPIRY)) {
    // Return cached name based on language
    const data = cache[code].data;
    return getNameFromData(data, language);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    // Sanitize input to prevent URL injection
    const safeCode = encodeURIComponent(code);
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${safeCode}`, {
      signal: controller.signal
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();

    // Security Enhancement: Validate API response structure before using it
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid API response format');
    }

    const countryData = data[0]; // API returns array

    // Validate country data shape
    if (!countryData || !countryData.name) {
      throw new Error('Missing country name data in response');
    }

    // Update cache
    cache[code] = {
      data: countryData,
      timestamp: now
    };
    setCache(cache);

    return getNameFromData(countryData, language);
  } catch (error) {
    console.warn(`Failed to fetch data for ${code}:`, error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

const getNameFromData = (data, language) => {
  if (!data) return null;
  if (language === 'fr' && data.translations && data.translations.fra) {
    return data.translations.fra.common;
  }
  return data.name.common; // Default to common name (English usually)
};
