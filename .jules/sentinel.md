## 2024-05-23 - Content Security Policy & Regression Risks
**Vulnerability:** Missing Content Security Policy (CSP) allowing potential XSS and data exfiltration.
**Learning:** Fixing linter errors (unused variables) in legacy code must be done with extreme caution to avoid regressions or perceived regressions. Also, switching package managers (npm vs pnpm) should be avoided in security patches unless explicitly required.
**Prevention:** Use `eslint-disable` for legacy unused variables if removal is risky. Verify project's package manager constraints before installing dependencies.

## 2025-12-17 - CSP Violation in d3.csv
**Vulnerability:** `d3.csv` (via `d3-dsv`) uses `new Function` (eval) to create object converters, which violates strict CSP (`script-src 'self'`) that disallows `unsafe-eval`.
**Learning:** Even modern libraries (d3 v7) may trigger CSP violations depending on their internal implementation or bundling. `d3-dsv` creates optimized parsers using function construction.
**Prevention:** Use `d3.csvParseRows` (which is iteration-based) and manually map headers to values instead of relying on `d3.csv`'s automatic object creation when strict CSP is required.

## 2025-12-18 - URL Injection via Unsanitized Input
**Vulnerability:** The `fetchCountryDetails` service interpolated the country code directly into the URL path (`.../alpha/${code}`), allowing potential URL injection/manipulation if the code contained special characters.
**Learning:** Even when inputs come from internal data (like CSV files), treating them as untrusted is safer ("Defense in Depth"). External APIs might be leveraged for unexpected behavior if inputs are manipulated.
**Prevention:** Always use `encodeURIComponent()` when constructing URL paths or query parameters dynamically, regardless of the perceived trust level of the input source.

## 2025-12-21 - Data Integrity Verification (Supply Chain)
**Vulnerability:** Downloading datasets from external sources (even trusted ones like Zenodo) without integrity verification leaves the application vulnerable to Man-in-the-Middle (MitM) attacks or compromised servers serving malicious files.
**Learning:** Supply chain security isn't just about NPM packages; it applies to data pipelines too. A compromised data file could lead to persistent XSS (if content is rendered) or skewed visualization logic.
**Prevention:** Always verify cryptographic checksums (MD5/SHA) of downloaded assets against a trusted metadata source before processing or storing them.

## 2025-12-22 - Global Error Boundary & Secure Logger
**Vulnerability:** Default error handling in React, along with unverified `console` outputs, leaked sensitive information including trace stacks. Unsanitized strings in logs presented a risk for log injection.
**Learning:** Security fixes involving logs must avoid crashing production tools. A dedicated logging utility suppresses full stack traces, limits sizes, and safely formats parameters. A global React Error Boundary uses this tool for component lifecycle failures to fail safely without disclosing unhandled exceptions to users.
**Prevention:** Employ `logger.info`, `logger.warn`, and `logger.error` globally instead of the default console. Wrap the root React app node in `<ErrorBoundary>` to sanitize client-side panics.
