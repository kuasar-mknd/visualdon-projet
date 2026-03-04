/**
 * Centralized logging utility.
 * Sanitizes inputs and suppresses stack traces in production.
 */
export const logger = {
  info: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    } else {
      // In production, log message without stack traces or sensitive data
      console.warn(sanitizeLogArgs(args));
    }
  },
  error: (...args) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    } else {
      // In production, suppress stack traces
      console.error(sanitizeLogArgs(args));
    }
  }
};

const sanitizeLogArgs = (args) => {
  return args.map(arg => {
    if (typeof arg === 'string') {
      // Truncate to 500 chars, remove control characters
      // eslint-disable-next-line no-control-regex
      let sanitized = arg.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      if (sanitized.length > 500) {
        sanitized = sanitized.substring(0, 497) + '...';
      }
      return sanitized;
    }
    if (arg instanceof Error) {
      // Only return the message, not the stack trace
      return arg.message;
    }
    return arg;
  }).join(' ');
};
