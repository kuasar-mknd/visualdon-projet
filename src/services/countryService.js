import { isValidCountryCode, isValidLanguage } from '../utils/security.js';

const CACHE_KEY = 'visualdon_country_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 250; // Limit cache to ~250 countries to prevent localStorage exhaustion

// Optimization: In-memory cache to avoid frequent synchronous localStorage reads/parsing
// This significantly reduces main-thread blocking during animations where fetchCountryDetails is called repeatedly.
let memoryCache = null;

// Optimization: In-flight request deduplication
// Prevents multiple network requests for the same country code if called concurrently
const pendingRequests = new Map();

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
  // Security Enhancement: Prevent unlimited growth of localStorage (DoS risk)
  const keys = Object.keys(cache);
  if (keys.length > MAX_CACHE_SIZE) {
    // Sort keys by timestamp (oldest first) to implement LRU-like eviction
    // Note: This is O(N log N) but N is small (250), so performance impact is negligible compared to network request
    const sortedKeys = keys.sort((a, b) => (cache[a].timestamp || 0) - (cache[b].timestamp || 0));

    // Remove oldest entries to bring size down to limit
    const keysToRemove = sortedKeys.slice(0, keys.length - MAX_CACHE_SIZE);
    keysToRemove.forEach(key => delete cache[key]);
  }

  memoryCache = cache;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("Error writing cache:", e.message);
  }
};

export const fetchCountriesBatch = async (codes, language) => {
  if (!codes || !Array.isArray(codes) || codes.length === 0) return {};

  const uniqueCodes = [...new Set(codes)];
  const validCodes = uniqueCodes.filter(isValidCountryCode);

  if (language && !isValidLanguage(language)) {
      language = null;
  }

  const cache = getCache();
  const now = Date.now();
  const results = {};
  const missingCodes = [];

  // Check cache first
  validCodes.forEach(code => {
      if (cache[code] && (now - cache[code].timestamp < CACHE_EXPIRY)) {
          results[code] = getNameFromData(cache[code].data, language);
      } else {
          missingCodes.push(code);
      }
  });

  if (missingCodes.length === 0) {
      return results;
  }

  // Use a unique key for the batch request to deduplicate
  const batchKey = `BATCH_${missingCodes.sort().join(',')}`;

  if (pendingRequests.has(batchKey)) {
      try {
           const batchData = await pendingRequests.get(batchKey);
           Object.keys(batchData).forEach(code => {
               results[code] = getNameFromData(batchData[code], language);
           });
           return results;
      } catch (e) { // eslint-disable-line no-unused-vars
           console.warn("Batch request failed, proceeding to manual fetch");
      }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for batch

  const requestPromise = (async () => {
    try {
        const param = missingCodes.map(c => encodeURIComponent(c)).join(',');
        const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${param}`, {
          signal: controller.signal
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid API response format');
        }

        const newCacheData = {};

        // API returns array of country objects.
        // We need to map them back to the requested codes.
        data.forEach(country => {
            // Check both cca3 and cca2 to match what we asked for
            const code3 = country.cca3;
            const code2 = country.cca2;

            if (missingCodes.includes(code3)) {
                newCacheData[code3] = country;
                cache[code3] = { data: country, timestamp: now };
            } else if (missingCodes.includes(code2)) {
                newCacheData[code2] = country;
                cache[code2] = { data: country, timestamp: now };
            }
        });

        setCache(cache);
        return newCacheData;
    } finally {
        clearTimeout(timeoutId);
        pendingRequests.delete(batchKey);
    }
  })();

  pendingRequests.set(batchKey, requestPromise);

  try {
    const batchData = await requestPromise;
    Object.keys(batchData).forEach(code => {
      results[code] = getNameFromData(batchData[code], language);
    });
  } catch (error) {
    console.warn(`Failed to fetch batch data:`, error.message);
  }

  return results;
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

  // Security Enhancement: Validate language
  if (language && !isValidLanguage(language)) {
      // Treat invalid language as undefined/null so we fallback to default
      language = null;
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

  // Check for existing in-flight request
  if (pendingRequests.has(code)) {
    try {
        const countryData = await pendingRequests.get(code);
        return getNameFromData(countryData, language);
    } catch (e) { // eslint-disable-line no-unused-vars
        // If the pending request failed, we'll try again (fall through)
        // or return null depending on behavior.
        // For now, let's just return null to match existing error behavior
        return null;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const requestPromise = (async () => {
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

        return countryData;
    } finally {
        clearTimeout(timeoutId);
        // Clean up pending request
        pendingRequests.delete(code);
    }
  })();

  pendingRequests.set(code, requestPromise);

  try {
    const countryData = await requestPromise;
    return getNameFromData(countryData, language);
  } catch (error) {
    // Sanitize code for logging to prevent log injection
    const safeLogCode = encodeURIComponent(code);
    console.warn(`Failed to fetch data for ${safeLogCode}:`, error.message);
    return null;
  }
};

const getNameFromData = (data, language) => {
  if (!data) return null;
  if (language === 'fr' && data.translations && data.translations.fra) {
    return data.translations.fra.common;
  }
  return data.name.common; // Default to common name (English usually)
};
