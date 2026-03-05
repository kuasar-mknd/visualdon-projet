/**
 * Centralized logging utility for sanitizing and safe logging.
 */

// eslint-disable-next-line no-control-regex
const controlCharRegex = /[\u0000-\u001F\u007F-\u009F]/g;

const sanitizeLogMessage = (msg) => {
  if (typeof msg !== 'string') {
    try {
      msg = JSON.stringify(msg);
    } catch {
      msg = String(msg);
    }
  }

  // Truncate to 500 chars to prevent log injection or DoS via massive logs
  if (msg.length > 500) {
    msg = msg.substring(0, 500) + '... [TRUNCATED]';
  }

  // Remove control characters
  return msg.replace(controlCharRegex, '');
};

const formatArgs = (args) => {
  return args.map(arg => sanitizeLogMessage(arg));
};

export const logger = {
  info: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...formatArgs(args));
    }
  },
  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn(...formatArgs(args));
    }
  },
  error: (...args) => {
    // Suppress stack traces in production by logging only sanitized messages, not Error objects
    if (import.meta.env.DEV) {
      console.error(...args); // In dev, we might want the real Error object for debugging
    } else {
      // In production, only log the sanitized message
      console.error(...formatArgs(args));
    }
  }
};
