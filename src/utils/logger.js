/**
 * Centralized logging utility for sanitizing inputs and suppressing stack traces in production.
 */

const sanitizeMessage = (message) => {
  if (typeof message !== 'string') {
    message = String(message);
  }

  // Truncate to 500 characters to prevent log flooding
  if (message.length > 500) {
    message = message.substring(0, 500) + '...';
  }

  // Remove control characters to prevent log injection/formatting issues
  // eslint-disable-next-line no-control-regex
  return message.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};

const formatArgs = (args) => {
  return args.map(arg => {
    if (arg instanceof Error) {
      // Suppress stack traces in production
      if (!import.meta.env.DEV) {
        return sanitizeMessage(arg.message);
      }
      return arg; // Allow stack trace in dev
    }

    if (typeof arg === 'string') {
      return sanitizeMessage(arg);
    }

    return arg;
  });
};

export const logger = {
  info: (...args) => {
    console.log(...formatArgs(args));
  },
  warn: (...args) => {
    console.warn(...formatArgs(args));
  },
  error: (...args) => {
    console.error(...formatArgs(args));
  }
};
