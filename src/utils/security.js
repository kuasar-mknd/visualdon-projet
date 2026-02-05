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
 * Sanitizes a message for logging.
 * Truncates long strings and escapes control characters.
 * @param {string|Error} message - The message or error to log.
 * @returns {string} - The sanitized message.
 */
export const sanitizeLog = (message) => {
  let str = '';
  if (message instanceof Error) {
    str = message.message; // Only log the message, not the stack trace
  } else if (typeof message === 'object') {
    try {
      str = JSON.stringify(message);
    } catch {
      str = '[Circular]';
    }
  } else {
    str = String(message);
  }

  // Truncate to 100 characters
  if (str.length > 100) {
    str = str.substring(0, 100) + '...';
  }

  // Remove control characters (ASCII 0-31) except newline/tab
  // Also remove potential ANSI escape codes
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

/**
 * Validates a country name.
 * Allows letters (including unicode), spaces, hyphens, parentheses, apostrophes, and commas.
 * @param {string} name - The country name to validate.
 * @returns {boolean} - True if valid.
 */
export const isValidCountryName = (name) => {
  if (!name || typeof name !== 'string') return false;
  // Unicode property escapes \p{L} matches any letter from any language
  return /^[\p{L}\s\-()',.]+$/u.test(name);
};

/**
 * Validates a filename to prevent path traversal.
 * Allows alphanumeric, dots, hyphens, and underscores.
 * @param {string} name - The filename to validate.
 * @returns {boolean} - True if valid.
 */
export const isValidFilename = (name) => {
  if (!name || typeof name !== 'string') return false;
  // Prevent directory traversal
  if (name.includes('..') || name.includes('/') || name.includes('\\')) return false;

  return /^[a-zA-Z0-9.\-_]+$/.test(name);
};
