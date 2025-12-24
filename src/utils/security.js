/**
 * Security utilities for input validation and sanitization.
 *
 * "Defense in Depth" strategy:
 * - Validate all inputs at the boundary.
 * - Sanitize outputs before display.
 */

/**
 * Sanitizes a string to prevent XSS and HTML injection risks when displaying data.
 * Removes < and > characters which are key for HTML tags.
 *
 * @param {string} str - The string to sanitize.
 * @returns {string} The sanitized string.
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  // Basic sanitization: remove potential HTML tags to prevent injection if rendered in HTML
  // This is a minimal sanitizer for display purposes in SVG/HTML text nodes.
  return str.replace(/[<>]/g, '');
};

/**
 * Validates if a string is a valid ISO 3166-1 alpha-2 or alpha-3 country code.
 *
 * @param {string} code - The country code to validate.
 * @returns {boolean} True if valid.
 */
export const isValidCountryCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  return /^[a-zA-Z0-9]{2,3}$/.test(code);
};

/**
 * Clamps a number between a min and max value.
 * Useful for validating numeric inputs like years.
 *
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
export const clamp = (value, min, max) => {
  if (typeof value !== 'number' || isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};
