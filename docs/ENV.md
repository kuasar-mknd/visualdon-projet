# Environment Variables

## Overview
This application is a client-side React application built with Vite.

## Current Usage
The following environment variables are supported. All variables exposed to the client must be prefixed with `VITE_`.

| Variable | Description | Required | Default |
|---|---|---|---|
| `VITE_BASE_URL` | The base URL for the application deployment. | No | `/` |
| `VITE_ANALYTICS_ID` | The ID for analytics integration (e.g., Cloudflare Beacon). | No | - |
| `VITE_DEBUG` | Enable debug mode (logging). | No | `false` |

## Accessing Variables
In the code, access variables using `import.meta.env`:
```javascript
const debug = import.meta.env.VITE_DEBUG === 'true';
```

## Setup
To configure the environment locally:
1.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Edit `.env` to set your values.

**Note**: Never commit the `.env` file to version control.
