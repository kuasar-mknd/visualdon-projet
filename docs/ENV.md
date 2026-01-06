# Environment Variables

## Overview
This application is a client-side React application built with Vite.

## Current Usage
**There are NO custom environment variables currently used in the source code.**

The application runs entirely on client-side logic and static data. The `.env.example` file is provided solely as a template for standard Vite configurations or future extensions.

## Standard Vite Variables
Vite automatically handles specific variables (e.g., `BASE_URL`, `MODE`, `PROD`, `DEV`). These are available via `import.meta.env` but do not require manual configuration in `.env` for standard deployments.

## Future Configuration
If you need to add environment variables in the future:
1.  Prefix them with `VITE_` to expose them to the client-side code.
2.  Access them via `import.meta.env.VITE_MY_VAR`.
3.  Add them to this file.

## Example `.env`
For a quick start or future reference, you can copy the provided example file:

```bash
cp .env.example .env
```

The `.env.example` file contains commented-out placeholders:

```bash
# Application Base URL (optional, defaults to root)
# VITE_BASE_URL=/

# Analytics ID (if applicable)
# VITE_ANALYTICS_ID=

# Debug Mode (true/false)
# VITE_DEBUG=false
```
