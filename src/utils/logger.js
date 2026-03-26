const sanitize = (input) => {
  if (input === null || input === undefined) {
    return String(input ?? '');
  }

  if (input instanceof Error) {
    // Extract only the message to prevent stack trace leaks
    return sanitizeString(input.message);
  }

  let str;
  if (typeof input === 'object') {
    try {
      str = JSON.stringify(input);
    } catch {
      str = String(input);
    }
  } else {
    str = String(input);
  }

  return sanitizeString(str);
};

const sanitizeString = (str) => {
  // eslint-disable-next-line no-control-regex
  const noControlChars = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  return noControlChars.substring(0, 500);
};

export const logger = {
  error: (msg, errorObj = null) => {
    const safeMsg = sanitize(msg);
    if (errorObj) {
      const safeError = sanitize(errorObj);
      console.error(safeMsg, safeError); // Production-safe output
    } else {
      console.error(safeMsg);
    }
  },
  warn: (msg, errorObj = null) => {
    const safeMsg = sanitize(msg);
    if (errorObj) {
      const safeError = sanitize(errorObj);
      console.warn(safeMsg, safeError);
    } else {
      console.warn(safeMsg);
    }
  },
  info: (msg, data = null) => {
    const safeMsg = sanitize(msg);
    if (data) {
      const safeData = sanitize(data);
      console.info(safeMsg, safeData);
    } else {
      console.info(safeMsg);
    }
  }
};
