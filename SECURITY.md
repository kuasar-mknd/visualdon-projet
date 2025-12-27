# Security Policy

## Supported Versions

The following versions of this project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please report it responsibly.

### How to Report

1.  **Do NOT** file a public issue on GitHub.
2.  Email details to `security@kuasar.xyz` (or the maintainer's contact).
3.  Include steps to reproduce the issue.

### Our Process

1.  We will acknowledge your report within 48 hours.
2.  We will investigate the issue and determine its impact.
3.  We will release a patch as soon as possible.
4.  We will provide credit for your discovery (if desired).

## Security Measures

This project implements several security best practices:
- **Content Security Policy (CSP):** Strict CSP to prevent XSS.
- **Security Headers:** HSTS, X-Frame-Options, etc., enforced at the edge.
- **Input Validation:** Validation of country codes and API responses.
- **Dependency Management:** Regular updates and auditing of dependencies.
- **Code Scanning:** Automated linting and security checks.

## Critical Learnings

See `.jules/sentinel.md` for a log of past security learnings and mitigations.
