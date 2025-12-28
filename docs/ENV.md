# Environment Variables

## Overview
This application is a client-side React application built with Vite. It minimizes reliance on runtime environment variables to simplify deployment and maintenance.

## Current Usage
- **NODE_ENV**: Managed automatically by Vite (`development` during `pnpm dev`, `production` during `pnpm build`).
- **CI/CD Variables**: GitHub Actions (e.g., `update-data.yml`) use internal secrets (like `GITHUB_TOKEN`) which are automatically provided by the platform.

## Adding New Variables
If future features require environment variables (e.g., a new API key):
1.  **Prefix**: Must start with `VITE_` to be exposed to the browser.
2.  **Access**: Use `import.meta.env.VITE_MY_VARIABLE`.
3.  **Documentation**: Update this file immediately.

## Example `.env`
No `.env` file is currently required for local development.

```bash
# Example template (not active)
# VITE_API_ENDPOINT=https://api.example.com
# VITE_ANALYTICS_ID=UA-XXXXX-Y
```
