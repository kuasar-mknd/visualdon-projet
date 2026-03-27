/**
 * Centralized logging utility to prevent stack trace leaks and sanitize logs.
 */

const sanitizeLog = (input) => {
  let strInput;
  try {
    if (input === null || input === undefined) {
      strInput = '';
    } else if (input instanceof Error) {
      strInput = String(input.message ?? '');
    } else if (typeof input === 'object') {
      try {
        strInput = String(JSON.stringify(input) ?? '');
      } catch {
        strInput = String(input ?? '');
      }
    } else {
      strInput = String(input ?? '');
    }
  } catch {
    strInput = '';
  }

  // eslint-disable-next-line no-control-regex
  const sanitized = strInput.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  if (sanitized.length > 500) {
    return sanitized.substring(0, 500) + '...';
  }

  return sanitized;
};

const logger = {
  info: (msg, data) => {
    const safeMsg = sanitizeLog(msg);
    if (data !== undefined) {
      console.info(safeMsg, sanitizeLog(data));
    } else {
      console.info(safeMsg);
    }
  },
  warn: (msg, data) => {
    const safeMsg = sanitizeLog(msg);
    if (data !== undefined) {
      console.warn(safeMsg, sanitizeLog(data));
    } else {
      console.warn(safeMsg);
    }
  },
  error: (msg, err) => {
    const safeMsg = sanitizeLog(msg);
    if (err !== undefined) {
      console.error(safeMsg, sanitizeLog(err));
    } else {
      console.error(safeMsg);
    }
  }
};

export default logger;
