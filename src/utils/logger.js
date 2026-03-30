/**
 * Centralized logging utility for the application.
 * Sanitizes inputs, prevents stack trace leaks, and safely stringifies objects.
 */

// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g;
const MAX_LENGTH = 500;

const sanitizeValue = (value) => {
  let strVal;

  if (value instanceof Error) {
    // Extract only the message to prevent stack trace leaks
    strVal = value.message;
  } else if (typeof value === 'object' && value !== null) {
    try {
      strVal = JSON.stringify(value);
    } catch {
      strVal = String(value);
    }
  } else {
    strVal = String(value ?? '');
  }

  // Remove control characters to prevent log injection
  strVal = strVal.replace(CONTROL_CHAR_REGEX, '');

  // Truncate to prevent log bloat / DoS
  if (strVal.length > MAX_LENGTH) {
    strVal = strVal.substring(0, MAX_LENGTH) + '...[TRUNCATED]';
  }

  return strVal;
};

const formatMessage = (args) => {
  return args.map(sanitizeValue).join(' ');
};

export const logger = {
  info: (...args) => {
    console.info(formatMessage(args));
  },
  warn: (...args) => {
    console.warn(formatMessage(args));
  },
  error: (...args) => {
    console.error(formatMessage(args));
  },
  debug: (...args) => {
    console.debug(formatMessage(args));
  }
};

export default logger;
