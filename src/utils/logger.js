// src/utils/logger.js
/**
 * Centralized logging utility to prevent stack trace leaks and sanitize outputs.
 * Uses strict serialization and sanitization before outputting via native console methods.
 */

// Simple control character stripper (using eslint-disable-next-line as required by directives)
// eslint-disable-next-line no-control-regex
const STRIP_CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;

function sanitizeValue(val) {
  try {
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
    return str.replace(STRIP_CONTROL_CHARS, '').substring(0, 500);
  } catch {
    return '[Unserializable Value]';
  }
}

export const logger = {
  info: (...args) => {
    const safeArgs = args.map(arg => {
      if (arg instanceof Error) return sanitizeValue(arg.message);
      return sanitizeValue(arg);
    });
    console.info(...safeArgs);
  },
  warn: (...args) => {
    const safeArgs = args.map(arg => {
      if (arg instanceof Error) return sanitizeValue(arg.message);
      return sanitizeValue(arg);
    });
    console.warn(...safeArgs);
  },
  error: (...args) => {
    const safeArgs = args.map(arg => {
      if (arg instanceof Error) return sanitizeValue(arg.message);
      return sanitizeValue(arg);
    });
    console.error(...safeArgs);
  }
};
