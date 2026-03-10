export const logger = {
  info: (msg, ...args) => {
    const safeMsg = sanitizeLogInput(msg);
    const safeArgs = args.map(arg => sanitizeLogInput(arg));
    console.log(`[INFO]: ${safeMsg}`, ...safeArgs);
  },
  warn: (msg, ...args) => {
    const safeMsg = sanitizeLogInput(msg);
    const safeArgs = args.map(arg => sanitizeLogInput(arg));
    console.warn(`[WARN]: ${safeMsg}`, ...safeArgs);
  },
  error: (msg, error) => {
    const safeMsg = sanitizeLogInput(msg);
    const safeErrorMsg = error instanceof Error ? sanitizeLogInput(error.message) : sanitizeLogInput(error);

    // Check if we are in development environment
    const isDev = import.meta.env && import.meta.env.DEV;

    if (isDev && error && error.stack) {
        console.error(`[ERROR]: ${safeMsg}`, safeErrorMsg, error.stack);
    } else {
        console.error(`[ERROR]: ${safeMsg}`, safeErrorMsg);
    }
  }
};

function sanitizeLogInput(input) {
  if (input === null || input === undefined) return '';
  let strInput;
  try {
      strInput = typeof input === 'object' ? JSON.stringify(input) : String(input);
  } catch {
      strInput = String(input || '');
  }

  // eslint-disable-next-line no-control-regex
  strInput = strInput.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  if (strInput.length > 500) {
      return strInput.substring(0, 500) + '...[TRUNCATED]';
  }
  return strInput;
}
