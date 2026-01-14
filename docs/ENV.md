# Environment Variables

## Overview
This application is a client-side React application built with Vite. It minimizes reliance on runtime environment variables.

## Current Usage

### Build-Time Variables
These variables are used during the build process or injected into the application via Vite.

- **`VITE_CLOUDFLARE_TOKEN`**: (Optional) The token for Cloudflare Web Analytics. If provided, it is injected into the HTML `head`.

### Standard Variables
- **`NODE_ENV`**: Managed by Vite (`development` vs `production`).

## Conventions
If you need to add environment variables in the future:
1.  Prefix them with `VITE_` to expose them to the client-side code.
2.  Access them via `import.meta.env.VITE_MY_VAR`.
3.  Add them to this file.

## Future Integrations
For future features requiring API keys (e.g., AI models or third-party services), please adhere to the following:

- **Cost Control**: See `docs/AI.md` for guidelines on budgeting and rate limiting.
- **Security**: Never commit real keys to the repository. Use GitHub Secrets for CI/CD and `.env` files for local development.

## Example `.env`
For a quick start, you can copy the provided example file:

```bash
cp .env.example .env
```

The `.env.example` file contains placeholders:

```bash
# Cloudflare Web Analytics Token
VITE_CLOUDFLARE_TOKEN=
```
