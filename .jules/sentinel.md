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

## 2025-12-21 - Deep Structure Validation
**Vulnerability:** Shallow validation of complex objects (GeoJSON, Manifest) allowed invalid internal structures (empty features, weak hashes) to bypass checks.
**Learning:** Checking `typeof obj === 'object'` is insufficient for critical data files. Invalid internal structures can crash visualization libraries (D3) or lead to logic errors.
**Prevention:** Implement deep structural validation that checks nested properties (e.g., `features[0].geometry`) and strictly enforces string formats (e.g., regex for SHA-256 hashes).
