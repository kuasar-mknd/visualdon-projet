# Environment Variables

## Overview
This application is a client-side React application built with Vite. It minimizes reliance on runtime environment variables.

## Validated Environment Variables
The following variables are recognized by the build system and application code.

### Analytics
- **`VITE_CLOUDFLARE_TOKEN`**: (Optional) The token for Cloudflare Web Analytics.
    - **Usage**: Injected into `index.html` during the build process to configure the analytics beacon.
    - **Example**: `VITE_CLOUDFLARE_TOKEN=1a2b3c4d...`

## Setup
To configure your local environment:

1.  Copy the example file:
    ```bash
    cp .env.example .env
    ```

2.  Edit `.env` to add your specific keys (if needed).

## Adding New Variables
If you extend the application:
1.  Prefix client-side variables with `VITE_`.
2.  Add them to `.env.example`.
3.  Document them in this file.
