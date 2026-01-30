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
  return requiredKeys.every(key =>
    Object.prototype.hasOwnProperty.call(manifest, key) &&
    typeof manifest[key] === 'string' &&
    manifest[key].length > 0
  );
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
 * @param {object} geoJson - The GeoJSON object to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const validateGeoJson = (geoJson) => {
  if (!geoJson || typeof geoJson !== 'object') return false;

  // Check basic FeatureCollection structure
  if (geoJson.type !== 'FeatureCollection') return false;

  // Check features array
  if (!Array.isArray(geoJson.features)) return false;

  return true;
};

/**
 * Validates if a string is a valid Hex color code.
 * @param {string} color - The color string to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const isValidColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
};

/**
 * Validates if a year is within a reasonable range (1750-2100).
 * @param {number|string} year - The year to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const isValidYear = (year) => {
  const num = parseInt(year, 10);
  return !isNaN(num) && num >= 1750 && num <= 2100;
};

/**
 * Validates if a filename is safe (alphanumeric, dots, dashes, underscores).
 * Prevents path traversal.
 * @param {string} filename - The filename to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const isValidFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  // Allow only alphanumeric, dots, dashes, underscores
  // Explicitly disallow slashes to prevent directory traversal
  return /^[a-zA-Z0-9._-]+$/.test(filename) && !filename.includes('..');
};

/**
 * Validates country data object structure.
 * @param {object} data - The data object to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const validateCountryData = (data) => {
  if (!data || typeof data !== 'object') return false;

  // Optional check: if Year exists, it must be valid
  if ('Year' in data && !isValidYear(data.Year)) return false;

  // Optional check: if ISO code exists, it must be valid (allowing "WLD" for World)
  if (data['ISO 3166-1 alpha-3'] && data['ISO 3166-1 alpha-3'] !== 'WLD' && !isValidCountryCode(data['ISO 3166-1 alpha-3'])) {
      return false;
  }

  return true;
};

/**
 * Validates cache structure for localStorage.
 * @param {object} cache - The cache object.
 * @returns {boolean} - True if valid.
 */
export const validateCacheStructure = (cache) => {
  if (!cache || typeof cache !== 'object' || Array.isArray(cache)) return false;

  // Verify values are objects with timestamp and data
  // We check a sample or all. Checking all is safer.
  return Object.values(cache).every(item =>
    item && typeof item === 'object' &&
    typeof item.timestamp === 'number' &&
    item.data && typeof item.data === 'object'
  );
};
