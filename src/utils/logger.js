/**
 * Centralized logging utility to prevent stack trace leaks and sanitize inputs.
 */

const MAX_LOG_LENGTH = 500;

// Utility to safely stringify objects, functions, or symbols
const safeStringify = (input) => {
  if (input instanceof Error) {
    return input.message;
  }
  try {
    const stringified = typeof input === 'object' ? JSON.stringify(input) : String(input ?? '');
    return typeof stringified === 'string' ? stringified : '';
  } catch (err) { // eslint-disable-line no-unused-vars
    return '[Unserializable Object]';
  }
};

// Utility to sanitize log strings
const sanitizeLog = (str) => {
  // eslint-disable-next-line no-control-regex
  const sanitized = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  return sanitized.length > MAX_LOG_LENGTH
    ? sanitized.substring(0, MAX_LOG_LENGTH) + '...'
    : sanitized;
};

// Internal log handler
const handleLog = (level, ...args) => {
  const sanitizedArgs = args.map(arg => sanitizeLog(safeStringify(arg)));

  if (process.env.NODE_ENV !== 'test') {
    console[level](...sanitizedArgs);
  }
};

const logger = {
  info: (...args) => handleLog('info', ...args),
  warn: (...args) => handleLog('warn', ...args),
  error: (...args) => handleLog('error', ...args),
  log: (...args) => handleLog('log', ...args),
};

export default logger;
