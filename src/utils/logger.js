/**
 * A secure, centralized logger utility.
 * Sanitizes inputs (truncating and removing control characters).
 * Suppresses full stack traces from Error objects to prevent system leakage.
 */

// Helper to sanitize individual messages/arguments
const sanitize = (input) => {
  if (input === null || input === undefined) {
    return '';
  }

  // If it's an Error, extract just the message to avoid leaking stack traces
  if (input instanceof Error) {
    return sanitizeString(input.message);
  }

  // If it's an object/array, try to JSON stringify safely
  if (typeof input === 'object') {
    try {
      const stringified = JSON.stringify(input);
      return sanitizeString(stringified);
    } catch {
      // Fallback for circular structures or unserializable objects
      return sanitizeString(String(input ?? ''));
    }
  }

  // Primitives and fallback
  return sanitizeString(String(input ?? ''));
};

const sanitizeString = (str) => {
  // Truncate to 500 characters
  let cleanStr = str.length > 500 ? str.substring(0, 500) + '...' : str;

  // Remove control characters to prevent log injection/terminal corruption
  // eslint-disable-next-line no-control-regex
  cleanStr = cleanStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  return cleanStr;
};

// Logger methods
export const logger = {
  info: (...args) => {
    console.log(...args.map(sanitize));
  },
  warn: (...args) => {
    console.warn(...args.map(sanitize));
  },
  error: (...args) => {
    console.error(...args.map(sanitize));
  }
};
