/**
 * Centralized secure logger utility.
 * Sanitizes inputs, truncates long messages, removes control characters,
 * and extracts only the message from Error objects to prevent stack trace leaks.
 */

// eslint-disable-next-line no-control-regex
const controlCharRegex = /[\u0000-\u001F\u007F-\u009F]/g;

const sanitize = (input) => {
  if (input === null || input === undefined) return '';

  if (input instanceof Error) {
    input = input.message;
  } else if (typeof input === 'object' || typeof input === 'function' || typeof input === 'symbol') {
    try {
      input = JSON.stringify(input);
    } catch {
      input = String(input);
    }
  }

  let str = String(input);
  str = str.replace(controlCharRegex, '');
  if (str.length > 500) {
    str = str.substring(0, 500) + '...';
  }
  return str;
};

const formatMessage = (msg, data) => {
  const sanitizedMsg = sanitize(msg);
  if (data !== undefined) {
    return `${sanitizedMsg} ${sanitize(data)}`;
  }
  return sanitizedMsg;
};

export const logger = {
  info: (msg, data) => {
    console.info(formatMessage(msg, data));
  },
  warn: (msg, data) => {
    console.warn(formatMessage(msg, data));
  },
  error: (msg, error) => {
    console.error(formatMessage(msg, error));
  }
};
