/**
 * Centralized logging utility to ensure consistent logging across the application.
 * Sanitizes inputs and suppresses stack traces in production.
 */

const sanitize = (val) => {
  if (typeof val === 'string') {
    // Truncate to prevent excessively long logs
    let sanitized = val.length > 500 ? val.substring(0, 500) + '...' : val;
    // Remove control characters using regex
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    return sanitized;
  }
  return val;
};

const formatMessage = (args) => {
  return args.map(arg => {
    if (arg instanceof Error) {
        // Suppress stack trace in production
        return import.meta.env.DEV ? arg : arg.message;
    }
    return sanitize(arg);
  });
};

export const logger = {
  info: (...args) => {
    console.log(...formatMessage(args));
  },
  warn: (...args) => {
    console.warn(...formatMessage(args));
  },
  error: (...args) => {
    console.error(...formatMessage(args));
  }
};
