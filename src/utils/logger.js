/**
 * Centralized logging utility.
 * Sanitizes inputs, prevents stack trace leaks, and formats logs securely.
 */

const sanitizeMessage = (input) => {
  let str;
  if (input instanceof Error) {
    str = input.message;
  } else if (typeof input === 'object' && input !== null) {
    try {
      str = JSON.stringify(input);
    } catch {
      str = String(input ?? '');
    }
  } else {
    str = String(input ?? '');
  }

  // Remove control characters to prevent log injection
  // eslint-disable-next-line no-control-regex
  str = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Truncate to 500 chars
  if (str.length > 500) {
    str = str.substring(0, 500) + '...';
  }

  return str;
};

const formatArgs = (args) => {
  return args.map(arg => sanitizeMessage(arg)).join(' ');
};

export const logger = {
  info: (...args) => {
    console.info(formatArgs(args));
  },
  warn: (...args) => {
    console.warn(formatArgs(args));
  },
  error: (...args) => {
    console.error(formatArgs(args));
  }
};

export default logger;
