/**
 * Security utilities for input validation and sanitization.
 */

/**
 * Validates if a string is a valid ISO 3166-1 alpha-2 or alpha-3 country code.
 * @param {string} code - The country code to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const isValidCountryCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  return /^[a-zA-Z0-9]{2,3}$/.test(code);
};

/**
 * Sanitizes a string to prevent XSS.
 * Removes HTML tags and unsafe characters.
 * @param {string} str - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, (char) => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      case '&': return '&amp;';
      default: return char;
    }
  });
};

/**
 * Validates the manifest.json structure to ensure data integrity.
 * Enforces strict SHA-256 hash format.
 * @param {object} manifest - The manifest object to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const validateManifest = (manifest) => {
  if (!manifest || typeof manifest !== 'object') return false;

  // Required keys for a valid manifest
  const requiredKeys = [
    'emissions',
    'perCapita',
    'emissionsHash',
    'perCapitaHash',
    'geoJsonHash',
    'version',
    'lastUpdated'
  ];

  // Validate presence and type of keys
  const hasKeys = requiredKeys.every(key =>
    Object.prototype.hasOwnProperty.call(manifest, key) &&
    typeof manifest[key] === 'string' &&
    manifest[key].length > 0
  );

  if (!hasKeys) return false;

  // Validate SHA-256 Hash format (64 hex characters)
  const sha256Regex = /^[a-f0-9]{64}$/i;

  if (!sha256Regex.test(manifest.emissionsHash)) return false;
  if (!sha256Regex.test(manifest.perCapitaHash)) return false;

  // geoJsonHash is required to be non-empty by the hasKeys check, so we validate it
  if (!sha256Regex.test(manifest.geoJsonHash)) return false;

  return true;
};

/**
 * Validates language code (whitelist).
 * @param {string} lang - The language code.
 * @returns {boolean} - True if valid.
 */
export const isValidLanguage = (lang) => {
  return ['en', 'fr'].includes(lang);
};

/**
 * Validates the GeoJSON structure.
 * Checks types and inspects the first few features for correctness.
 * @param {object} geoJson - The GeoJSON object to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const validateGeoJson = (geoJson) => {
  if (!geoJson || typeof geoJson !== 'object') return false;

  // Check basic FeatureCollection structure
  if (geoJson.type !== 'FeatureCollection') return false;

  // Check features array
  if (!Array.isArray(geoJson.features)) return false;

  // Deep validate the first few features to ensure structure
  // (Checking all might be expensive for large datasets, 5 is a good sample)
  const sampleLimit = Math.min(geoJson.features.length, 5);
  for (let i = 0; i < sampleLimit; i++) {
    const f = geoJson.features[i];
    if (!f || typeof f !== 'object') return false;
    if (f.type !== 'Feature') return false;
    if (!f.geometry || typeof f.geometry !== 'object') return false;
    // Geometry type should be a string
    if (typeof f.geometry.type !== 'string') return false;
    // Coordinates should be an array (for Polygon/MultiPolygon)
    if (!Array.isArray(f.geometry.coordinates)) return false;
  }

  return true;
};

/**
 * Validates the Country API response structure.
 * @param {object} data - The country data object from API.
 * @returns {boolean} - True if valid.
 */
export const validateCountryData = (data) => {
  if (!data || typeof data !== 'object') return false;
  // Minimal requirement: name.common
  if (!data.name || typeof data.name !== 'object') return false;
  if (typeof data.name.common !== 'string') return false;

  // If translations exist, they should be an object
  if (data.translations && typeof data.translations !== 'object') return false;

  return true;
};

/**
 * Validates the cache structure for localStorage.
 * @param {object} cache - The cache object.
 * @returns {boolean} - True if valid.
 */
export const validateCacheStructure = (cache) => {
  if (!cache || typeof cache !== 'object' || Array.isArray(cache)) return false;

  // Iterate over a sample of keys to prevent performance issues on huge caches,
  // though max cache size is small (250).
  const keys = Object.keys(cache);
  for (const key of keys) {
    const entry = cache[key];
    if (!entry || typeof entry !== 'object') return false;
    // Must have data and timestamp
    if (!entry.data || typeof entry.data !== 'object') return false;
    if (typeof entry.timestamp !== 'number') return false;
    // Validate the inner data structure too
    if (!validateCountryData(entry.data)) return false;
  }

  return true;
};

/**
 * Validates a filename to prevent path traversal.
 * Allows alphanumeric, dots, underscores, dashes.
 * @param {string} filename - The filename to validate.
 * @returns {boolean} - True if valid.
 */
export const isValidFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  if (filename.length === 0 || filename.length > 255) return false;
  // Strictly allow only safe characters
  // ^[a-zA-Z0-9._-]+$
  return /^[a-zA-Z0-9._-]+$/.test(filename) && !filename.includes('..');
};
