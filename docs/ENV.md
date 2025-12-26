# Environment Variables

## Overview
This application is a client-side React application built with Vite. It does not currently rely on specific environment variables for its core functionality.

## Current Usage
- **NO** custom environment variables are currently required to run the application locally or in production.
- **NODE_ENV**: Handled automatically by Vite (`development` during `pnpm dev`, `production` during `pnpm build`).

## Conventions
If you need to add environment variables in the future:
1.  Prefix them with `VITE_` to expose them to the client-side code.
2.  Access them via `import.meta.env.VITE_MY_VAR`.
3.  Add them to this file.

## Example `.env`
Since no variables are currently needed, an `.env` file is not required. However, an example would look like this:

```bash
# Example only - no active variables
# VITE_API_BASE_URL=https://api.example.com
# VITE_ENABLE_ANALYTICS=false
```
