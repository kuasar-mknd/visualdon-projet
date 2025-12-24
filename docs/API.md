# Data API Documentation

## Overview

This application is a client-side visualization that consumes static CSV data files. While it does not have a traditional REST API backend, the data files act as the "API" for the application.

## Data Endpoints (Static Files)

The application fetches data from the `public/data/` directory.

### 1. Global CO2 Emissions
- **Path**: `/data/global_emissions.csv` (or similar versioned filename via `manifest.json`)
- **Format**: CSV
- **Description**: Contains annual global CO2 emissions data.
- **Columns**:
    - `Year`: Integer (1750-Present)
    - `Global`: Float (Total emissions in MtCO2)
    - `Coal`, `Oil`, `Gas`, `Cement`, `Flaring`, `Other`: Float (Breakdown by source)

### 2. Country Emissions
- **Path**: `/data/country_emissions.csv`
- **Format**: CSV
- **Description**: Detailed emissions data per country.
- **Columns**:
    - `Country Code`: ISO 3166-1 alpha-3 code
    - `Year`: Integer
    - `Total`: Float
    - `Per Capita`: Float

### 3. Data Manifest
- **Path**: `/data/manifest.json`
- **Format**: JSON
- **Description**: Maps logical data keys to actual filenames (which may include hashes or timestamps).
- **Example**:
  ```json
  {
    "global": "global_emissions.csv",
    "countries": "country_emissions.csv",
    "lastUpdated": "2023-10-27T10:00:00Z"
  }
  ```

## Data Update Process

The data is updated via a Node.js script:

```bash
pnpm run update-data
```

This script:
1. Fetches the latest "GCP Fossil CO2 emissions" dataset from Zenodo.
2. Parses and sanitizes the CSV data.
3. Generates optimized CSV files in `public/data/`.
4. Updates `public/data/manifest.json`.

See `docs/ARCHITECTURE.md` for more details on the update mechanism.
