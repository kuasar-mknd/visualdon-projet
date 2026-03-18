I will:
1.  **Create** `src/utils/logger.js`:
    -   This file will export `info`, `warn`, and `error` methods.
    -   It will sanitize input (truncating to 500 chars, removing control characters using regex `/[\u0000-\u001F\u007F-\u009F]/g` with `// eslint-disable-next-line no-control-regex`).
    -   It will extract the `.message` property from Error objects and suppress stack traces (converting objects to strings correctly to handle un-serializable objects via try-catch `JSON.stringify` and `String(input ?? '')`).
2.  **Refactor** `src/services/countryService.js` to use `logger` instead of `console`:
    -   Import `logger` from `../utils/logger.js`.
    -   Replace `console.warn` and `console.error` calls.
3.  **Refactor** `src/hooks/useData.js` to use `logger` instead of `console`:
    -   Import `logger` from `../utils/logger.js`.
    -   Replace `console.error` calls.
4.  **Refactor** `scripts/update-data.js` to suppress stack trace:
    -   Make sure error stack is suppressed properly. (It's currently commented out, but error message is logged via `console.error`, and this is a backend script where full sanitization is nice but we mainly suppress the stack trace which is already done). Wait, looking closely at `scripts/update-data.js`, the memory says: "CLI and backend scripts (e.g., scripts/update-data.js) suppress full error stack traces to adhere to strict fail-safe security policies, logging only the error message." - It seems it is already doing this `console.error('\n❌ Error:', error.message);`. But I will leave it as is or double check.
5.  **Pre-commit steps:** Follow instructions to ensure tests and linting pass.
