# Environment Variables

## Overview
This application is a client-side React application built with Vite. It does not currently rely on specific environment variables for its core functionality.

## Current Usage
- **NO** custom environment variables are currently required to run the application locally or in production.
- **NODE_ENV**: Handled automatically by Vite (`development` during `pnpm dev`, `production` during `pnpm build`).

> **Note**: The environment variables listed below (and in `.env.example`) are **examples** for potential future configuration. They are not currently utilized by the application code.

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
# Application Base URL (optional, defaults to root)
# VITE_BASE_URL=/

# Analytics ID (if applicable)
# VITE_ANALYTICS_ID=

# Debug Mode (true/false)
# VITE_DEBUG=false
```
