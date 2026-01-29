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
  // Security Enhancement: Strict validation, alpha only (no numbers)
  return /^[a-zA-Z]{2,3}$/.test(code);
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
 * Validates a year is within a reasonable range.
 * @param {number|string} year - The year to validate.
 * @param {number} min - Minimum allowed year (default 1750).
 * @param {number} max - Maximum allowed year (default 2100).
 * @returns {boolean} - True if valid.
 */
export const isValidYear = (year, min = 1750, max = 2100) => {
  const y = parseInt(year, 10);
  if (isNaN(y)) return false;
  return y >= min && y <= max;
};

/**
 * Validates a color string (hex or rgb).
 * @param {string} color - The color string.
 * @returns {boolean} - True if valid.
 */
export const isValidColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  // Hex (3, 4, 6, or 8 digits)
  if (/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) return true;
  // rgb/rgba
  if (/^rgba?\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*(,\s*(\d*\.?\d+%?))?\s*\)$/.test(color)) return true;
  return false;
};

/**
 * Validates filename to prevent path traversal (basic check).
 * @param {string} filename - The filename to validate.
 * @returns {boolean} - True if valid (no slashes, dots at start).
 */
export const isValidFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  // Allow alphanumeric, dashes, underscores, dots (but not at start, and no slashes)
  return /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/.test(filename) && !filename.includes('/') && !filename.includes('\\');
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
