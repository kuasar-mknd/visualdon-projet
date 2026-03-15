const sanitizeValue = (val) => {
  if (val instanceof Error) {
    return val.message;
  }

  let str = '';
  if (typeof val === 'string') {
    str = val;
  } else {
    try {
      str = JSON.stringify(val);
      if (str === undefined) {
        str = String(val ?? '');
      }
    } catch {
      str = String(val ?? '');
    }
  }

  // eslint-disable-next-line no-control-regex
  str = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  if (str.length > 500) {
    return str.substring(0, 500) + '...[truncated]';
  }
  return str;
};

const sanitizeArgs = (args) => {
  return args.map(sanitizeValue);
};

export const logger = {
  info: (...args) => {
    console.log(...sanitizeArgs(args));
  },
  warn: (...args) => {
    console.warn(...sanitizeArgs(args));
  },
  error: (...args) => {
    console.error(...sanitizeArgs(args));
  }
};
