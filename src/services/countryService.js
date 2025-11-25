const CACHE_KEY = 'visualdon_country_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const getCache = () => {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return {};
    return JSON.parse(cache);
  } catch (e) {
    console.error("Error reading cache", e);
    return {};
  }
};

const setCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("Error writing cache", e);
  }
};

export const fetchCountryDetails = async (code, language) => {
  if (!code) return null;
  
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

  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    const countryData = data[0]; // API returns array

    // Update cache
    cache[code] = {
      data: countryData,
      timestamp: now
    };
    setCache(cache);

    return getNameFromData(countryData, language);
  } catch (error) {
    console.warn(`Failed to fetch data for ${code}:`, error);
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
