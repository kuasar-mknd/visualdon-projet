## 2024-05-23 - Content Security Policy & Regression Risks
**Vulnerability:** Missing Content Security Policy (CSP) allowing potential XSS and data exfiltration.
**Learning:** Fixing linter errors (unused variables) in legacy code must be done with extreme caution to avoid regressions or perceived regressions. Also, switching package managers (npm vs pnpm) should be avoided in security patches unless explicitly required.
**Prevention:** Use `eslint-disable` for legacy unused variables if removal is risky. Verify project's package manager constraints before installing dependencies.

## 2025-12-17 - CSP Violation in d3.csv
**Vulnerability:** `d3.csv` (via `d3-dsv`) uses `new Function` (eval) to create object converters, which violates strict CSP (`script-src 'self'`) that disallows `unsafe-eval`.
**Learning:** Even modern libraries (d3 v7) may trigger CSP violations depending on their internal implementation or bundling. `d3-dsv` creates optimized parsers using function construction.
**Prevention:** Use `d3.csvParseRows` (which is iteration-based) and manually map headers to values instead of relying on `d3.csv`'s automatic object creation when strict CSP is required.
