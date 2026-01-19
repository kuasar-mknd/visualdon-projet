# Environment Variables

This document lists all environment variables used by the application.

## 🔐 Configuration

The application is a client-side SPA, so most configuration is build-time or static.

### Variables

| Variable | Description | Required | Scope |
|---|---|---|---|
| `VITE_CLOUDFLARE_TOKEN` | Token for Cloudflare Web Analytics. Injected into `index.html`. | No | Build (Client) |

> **Note**: Variables prefixed with `VITE_` are exposed to the browser. Do not store secrets in them.

## 🛠️ Setup

1.  Copy `.env.example` to `.env`.
2.  Fill in the values (if needed).

### .env.example

```ini
# Cloudflare Web Analytics Token (Optional)
VITE_CLOUDFLARE_TOKEN=
```

## 🔍 Validation

The application validates critical configuration on startup or build.
*   **Analytics**: If `VITE_CLOUDFLARE_TOKEN` is missing, analytics script injection is skipped gracefully.
