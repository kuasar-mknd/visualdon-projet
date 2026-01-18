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

#### Manifest File
**Endpoint**: `/data/manifest.json`

**Response Example** (JSON):
```json
{
  "emissions": "GCB2025v15_MtCO2_flat.csv",
  "perCapita": "GCB_2025v15_percapita_flat-clean.csv",
  "version": "2025v15",
  "lastUpdated": "2025-12-27T00:04:57.161Z"
}
```

#### Emissions Data
**Endpoint**: `/data/{filename_from_manifest}` (e.g., `/data/GCB2025v15_MtCO2_flat.csv`)

**Format**: CSV (Comma Separated Values)

**Columns**:
- `Country`: Country name (e.g., "Afghanistan").
- `ISO 3166-1 alpha-3`: 3-letter country code (e.g., "AFG").
- `Year`: Integer year (e.g., 2020).
- `Total`: Total CO₂ emissions (MtCO₂).
- `Coal`, `Oil`, `Gas`, `Cement`, `Flaring`, `Other`: Emissions by source.
- `Per Capita`: Emissions per person (tCO₂).

**Example Row**:
```csv
Country,ISO 3166-1 alpha-3,Year,Total,Coal,Oil,Gas,Cement,Flaring,Other,Per Capita
Afghanistan,AFG,2020,12.160273,3.328381,6.862372,1.96952,0.032236,0,,0.29743
```

#### Per Capita Data
**Endpoint**: `/data/{filename_from_manifest}` (e.g., `/data/GCB_2025v15_percapita_flat-clean.csv`)

**Format**: CSV

**Columns**:
- `Country`: ISO 3166-1 alpha-3 code (e.g., "AFG").
- `Year`: Integer year.
- `Per Capita`: Emissions per person.

**Example Row**:
```csv
Country,Year,Per Capita
AFG,2020,0.29743
```

### Error Handling

Since these are static files:
- **404 Not Found**: The file does not exist. Check the `manifest.json` for the correct filename.
- **200 OK**: The file was found and returned.

### Authentication & CORS
- **Authentication**: None required. All data is public.
- **CORS**: The hosting platform (Cloudflare Pages) is configured to allow Cross-Origin Resource Sharing (CORS) for these static assets, allowing them to be consumed by other web applications.

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
