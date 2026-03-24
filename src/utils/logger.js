/**
 * Centralized logging utility for sanitizing and formatting logs safely.
 */

// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;

const sanitizeValue = (value) => {
  let stringified;

  if (value instanceof Error) {
    stringified = value.message;
  } else if (typeof value === 'object' && value !== null) {
    try {
      stringified = JSON.stringify(value);
    } catch {
      stringified = String(value ?? '');
    }
  } else {
    stringified = String(value ?? '');
  }

  // Remove control characters to prevent log injection
  stringified = stringified.replace(CONTROL_CHAR_REGEX, '');

  // Truncate to 500 characters
  if (stringified.length > 500) {
    stringified = stringified.substring(0, 500) + '...';
  }

  return stringified;
};

export const logger = {
  log: (...args) => console.log(...args.map(sanitizeValue)),
  info: (...args) => console.info(...args.map(sanitizeValue)),
  warn: (...args) => console.warn(...args.map(sanitizeValue)),
  error: (...args) => console.error(...args.map(sanitizeValue)),
};
