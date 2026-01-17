# Security Policy

## Supported Versions

The latest version of the application is the only supported version for security updates.

## Reporting a Vulnerability

We take the security of our application seriously. If you find a vulnerability, please report it responsibly.

### How to Report

Please report security issues privately via email to the project maintainers (or open a GitHub Security Advisory if available). Do not open a public issue on GitHub for sensitive security vulnerabilities.

### Scope

The following vulnerabilities are considered in scope:
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Authentication/Authorization flaws
- Sensitive Data Exposure (e.g., API keys, PII)
- Dependency Vulnerabilities (High/Critical severity)

### Response Timeline

1. **Acknowledgment:** We will acknowledge receipt of your report within 48 hours.
2. **Analysis:** We will investigate the issue and confirm its validity within 1 week.
3. **Fix:** We aim to release a fix for critical vulnerabilities within 2 weeks of confirmation.

## Security Measures

This project implements the following security measures:
- **Content Security Policy (CSP):** Strict CSP headers to prevent XSS.
- **Input Sanitization:** All user inputs and external data are validated and sanitized.
- **Dependency Management:** Regular auditing of dependencies using `pnpm audit` and Dependabot.
- **Data Integrity:** Cryptographic hash verification (SHA-256) for all static data assets.
- **Secure Headers:** Implementation of HSTS, X-Frame-Options, and other security headers.
