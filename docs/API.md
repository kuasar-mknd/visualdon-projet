# API & Data Documentation

## Overview
This application is a **frontend-only** visualization tool. It does not communicate with a traditional backend API for its core functionality during runtime. Instead, it relies on static data files served from the `public/data` directory, managed via a manifest file.

This document describes the structure of these data files, which serve as the "Read-Only API" for the application.

## Data Architecture

### Data Loading Strategy
To support versioned data without requiring code changes, the application uses a **Manifest-based loading strategy**:

1.  **Manifest**: The app first fetches `public/data/manifest.json`.
2.  **Dynamic Resolution**: This JSON file contains the specific filenames for the current dataset version.
3.  **Data Fetching**: The app then fetches the CSV files specified in the manifest.

### Data Files (`public/data/`)

#### 1. Manifest (`manifest.json`)
The entry point for data discovery.

```json
{
  "emissions": "GCB2025v15_MtCO2_flat.csv",
  "perCapita": "GCB_2025v15_percapita_flat-clean.csv",
  "version": "2025v15",
  "lastUpdated": "2025-12-27T00:04:57.161Z"
}
```

#### 2. Emissions Data (CSV)
Contains total emissions broken down by source.
- **Filename**: Variable (e.g., `GCB2025v15_MtCO2_flat.csv`)
- **Source**: [Global Carbon Budget](https://globalcarbonproject.org/) via Zenodo.
- **Columns**:
  - `Country`: Country name.
  - `ISO 3166-1 alpha-3`: 3-letter country code.
  - `Year`: Integer year (e.g., 2024).
  - `Total`: Total emissions in MtCO2.
  - `Coal`, `Oil`, `Gas`, `Cement`, `Flaring`, `Other`: Component emissions.
  - `Per Capita`: (Legacy/redundant column, see separate file).

#### 3. Per Capita Data (CSV)
Contains population-adjusted emissions.
- **Filename**: Variable (e.g., `GCB_2025v15_percapita_flat-clean.csv`)
- **Source**: Derived during the data update process.
- **Columns**:
  - `Country`: Country name.
  - `Year`: Integer year.
  - `Per Capita`: Emissions in tonnes per person.

### API Access Example
You can inspect the current data manifest using standard HTTP tools:

```bash
# Get the manifest
curl -s https://visualdon-projet.pages.dev/data/manifest.json | jq .

# Fetch the emissions data file (replace filename with actual from manifest)
curl -O https://visualdon-projet.pages.dev/data/GCB2025v15_MtCO2_flat.csv
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
