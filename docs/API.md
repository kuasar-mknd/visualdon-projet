# API & Data Documentation

## Overview
This application is a **frontend-only** visualization tool. It does not communicate with a traditional backend API for its core functionality during runtime. Instead, it relies on static data files served from the `public/data` directory, managed via a manifest file.

This document describes the structure of these data files, which serve as the "API" for the application.

## Data Architecture

### Data Loading Strategy
To support versioned data without requiring code changes, the application uses a **Manifest-based loading strategy**:

1.  **Manifest**: The app first fetches `public/data/manifest.json`.
2.  **Dynamic Resolution**: This JSON file contains the specific filenames for the current dataset version.
3.  **Data Fetching**: The app then fetches the CSV files specified in the manifest.

### Data Files (`public/data/`)

- **`manifest.json`**:
  ```json
  {
    "emissions": "GCB2025v15_MtCO2_flat.csv",
    "perCapita": "GCB_2025v15_percapita_flat-clean.csv",
    "emissionsHash": "a1b2c3d4...",
    "perCapitaHash": "e5f6g7h8...",
    "geoJsonHash": "i9j0k1l2...",
    "version": "2025v15",
    "lastUpdated": "2025-12-27T00:04:57.161Z"
  }
  ```
- **Emissions Data** (e.g., `GCB2025v15_MtCO2_flat.csv`):
  - **Source**: Directly from Global Carbon Budget (Zenodo).
  - **Columns**: `Country`, `ISO 3166-1 alpha-3`, `Year`, `Total`, `Coal`, `Oil`, `Gas`, `Cement`, `Flaring`, `Other`, `Per Capita`.
- **Per Capita Data** (e.g., `GCB_2025v15_percapita_flat-clean.csv`):
  - **Source**: Calculated during the update process.
  - **Columns**: `Country`, `Year`, `Per Capita`.

### API Access Example
You can inspect the current data manifest using curl:

```bash
curl -s https://visualdon-projet.pages.dev/data/manifest.json | jq .
```

## Internal Services

### Country Service (`src/services/countryService.js`)
A utility service module running in the browser to handle country data normalization and translation.
- **Functionality**:
  - Maps ISO codes to Country names.
  - Provides translations for country names (English/French).
- **Usage**: Imported directly by React components.

## External Scripts

### Data Update Script (`scripts/update-data.js`)
This Node.js script is used at **build/maintenance time** to fetch the latest data.
- **Source**: Fetches from the Global Carbon Budget Zenodo repository using a stable Concept ID.
- **Execution**: `pnpm run update-data`
- **Output**:
  - Downloads the latest CSV files.
  - Calculates per-capita data if needed.
  - Generates `manifest.json`.
  - Updates files in `public/data/`.
