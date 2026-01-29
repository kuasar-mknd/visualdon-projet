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
    if (cache[code].notFound) return code;
    const data = cache[code].data;
    return getNameFromData(data, language);
  }

  // Check for existing in-flight request
  if (pendingRequests.has(code)) {
    try {
        const countryData = await pendingRequests.get(code);
        if (!countryData) return code; // Handle not found in pending
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

        if (!response.ok) {
            // If 404, mark as not found
            if (response.status === 404) {
                 cache[code] = {
                    data: null,
                    notFound: true,
                    timestamp: now
                };
                setCache(cache);
                return null; // Resolve to null (which means code fallback in caller?)
                // Wait, caller expects object.
            }
            throw new Error('Network response was not ok');
        }

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
    if (!countryData) return code; // Fallback
    return getNameFromData(countryData, language);
  } catch (error) {
    // Sanitize code for logging to prevent log injection
    const safeLogCode = encodeURIComponent(code);
    console.warn(`Failed to fetch data for ${safeLogCode}:`, error.message);
    return null;
  }
};

/**
 * Fetches details for multiple countries in a single batch request.
 * @param {string[]} codes - Array of country codes.
 * @param {string} language - Language code.
 * @returns {Promise<Object>} - Object mapping country codes to translated names.
 */
export const fetchCountriesDetails = async (codes, language) => {
  if (!codes || !Array.isArray(codes) || codes.length === 0) return {};

  const uniqueCodes = [...new Set(codes)].filter(isValidCountryCode);
  if (uniqueCodes.length === 0) return {};

  // Validate language
  if (language && !isValidLanguage(language)) {
      language = null;
  }

  const cache = getCache();
  const now = Date.now();
  const results = {};
  const missingCodes = [];

  // Check cache first
  for (const code of uniqueCodes) {
    if (cache[code] && (now - cache[code].timestamp < CACHE_EXPIRY)) {
      if (cache[code].notFound) {
          results[code] = code;
      } else {
          results[code] = getNameFromData(cache[code].data, language);
      }
    } else {
      missingCodes.push(code);
    }
  }

  if (missingCodes.length === 0) return results;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for batch

  try {
    const codesStr = missingCodes.map(encodeURIComponent).join(',');
    const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codesStr}`, {
        signal: controller.signal
    });

    if (!response.ok) {
         // If partial failure or 404, we assume all missing codes are invalid?
         // No, restcountries batch endpoint might return 200 with found ones?
         // Or 404 if NONE found?
         // Assuming it returns what it finds.
         if (response.status !== 404) {
             throw new Error('Network response was not ok');
         }
         // If 404, data is empty/null.
    }

    let data = [];
    if (response.ok) {
        data = await response.json();
    }

    if (!Array.isArray(data)) {
        // Maybe it returned single object if only 1 code requested?
        // restcountries usually returns array.
        data = [];
    }

    const returnedCodes = new Set();
    data.forEach(countryData => {
        // restcountries returns objects with cca2, cca3
        const code = countryData.cca3;

        if (code) {
             returnedCodes.add(code);
             // Update cache
            cache[code] = {
                data: countryData,
                timestamp: now
            };

            // Update results
            results[code] = getNameFromData(countryData, language);
        }
    });

    // Mark missing as not found
    missingCodes.forEach(code => {
        if (!returnedCodes.has(code)) {
            cache[code] = {
                data: null,
                notFound: true,
                timestamp: now
            };
            results[code] = code; // Fallback
        }
    });

    setCache(cache);

  } catch (error) {
    console.warn("Failed to fetch batch countries:", error.message);
    // Return what we have
  } finally {
      clearTimeout(timeoutId);
  }

  return results;
};

export const getCountryNameSync = (code, language) => {
  if (!code) return null;
  const cache = getCache();
  if (cache[code]) {
      if (cache[code].notFound) return code;
      return getNameFromData(cache[code].data, language);
  }
  return null;
};

const getNameFromData = (data, language) => {
  if (!data) return null;
  if (language === 'fr' && data.translations && data.translations.fra) {
    return data.translations.fra.common;
  }
  return data.name.common; // Default to common name (English usually)
};
