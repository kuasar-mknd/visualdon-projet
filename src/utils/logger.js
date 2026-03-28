/**
 * Centralized logging utility to prevent stack trace leaks and enforce sanitization.
 * Implements "Fail Safe" and "Defense in Depth" philosophies.
 */

const MAX_LOG_LENGTH = 500;
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;

function sanitize(input) {
  let str = '';
  try {
    if (typeof input === 'object' && input !== null) {
      if (input instanceof Error) {
        str = input.message;
      } else {
        str = JSON.stringify(input);
      }
    } else {
      str = String(input ?? '');
    }
  } catch {
    str = String(input ?? '');
  }

  // Remove control characters
  str = str.replace(CONTROL_CHAR_REGEX, '');

  // Truncate
  if (str.length > MAX_LOG_LENGTH) {
    str = str.substring(0, MAX_LOG_LENGTH) + '...[TRUNCATED]';
  }

  return str;
}

const logger = {
  info: (message, meta) => {
    console.log(sanitize(message), meta ? sanitize(meta) : '');
  },
  warn: (message, meta) => {
    console.warn(sanitize(message), meta ? sanitize(meta) : '');
  },
  error: (message, err) => {
    const safeMessage = sanitize(message);
    const safeError = err instanceof Error ? sanitize(err.message) : sanitize(err);
    console.error(`[ERROR] ${safeMessage}`, safeError ? `- ${safeError}` : '');
  }
};

export default logger;
