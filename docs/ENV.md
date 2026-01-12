# Environment Variables

## Overview
This application is a client-side React application built with Vite. It does not currently rely on specific environment variables for its core runtime functionality.

## Current Usage
- **NO** custom `VITE_` environment variables are currently required to run the application locally or in production.
- **NODE_ENV**: Handled automatically by Vite (`development` during `pnpm dev`, `production` during `pnpm build`).

## Conventions
If you need to add environment variables in the future:
1.  Prefix them with `VITE_` to expose them to the client-side code.
2.  Access them via `import.meta.env.VITE_MY_VAR`.
3.  Add them to this file.

## Example `.env`
For a quick start, you can copy the provided example file:

```bash
cp .env.example .env
```

The `.env.example` file contains commented-out placeholders for potential future configuration:

```bash
# VITE_APP_TITLE=Global CO2 Emissions
# Add other VITE_ variables as needed
```
