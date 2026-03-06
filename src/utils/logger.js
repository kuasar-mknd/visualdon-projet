/**
 * Centralized logging utility.
 * Sanitizes inputs and suppresses stack traces in production.
 */

const isDev = import.meta.env ? import.meta.env.DEV : true;

// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;

function sanitizeLogArgs(args) {
  return args.map(arg => {
    if (typeof arg === 'string') {
      let sanitized = arg.replace(CONTROL_CHAR_REGEX, '');
      if (sanitized.length > 500) {
        sanitized = sanitized.substring(0, 500) + '...[truncated]';
      }
      return sanitized;
    }
    if (arg instanceof Error) {
      return isDev ? arg : arg.message;
    }
    return arg;
  });
}

export const logger = {
  info: (...args) => {
    if (isDev) {
      console.log(...sanitizeLogArgs(args));
    } else {
      console.info(...sanitizeLogArgs(args));
    }
  },
  warn: (...args) => {
    console.warn(...sanitizeLogArgs(args));
  },
  error: (...args) => {
    console.error(...sanitizeLogArgs(args));
  }
};
