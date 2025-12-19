# API & Data Documentation

## Overview
This application is a **frontend-only** visualization tool. It does not communicate with a traditional backend API for its core functionality during runtime. Instead, it relies on static data files served from the `public/data` directory.

## Data Source
The primary data source is the [Global Carbon Project](https://globalcarbonproject.org/).
- **Location**: `public/data/`
- **Format**: CSV (Comma Separated Values)
- **Access**: Fetched via HTTP GET requests by the client-side application (using `d3.csv` or similar).

### Data Files
- **`co2_data.csv`** (Hypothetical name based on context): Contains historical CO₂ emissions data.
  - **Columns**: `Year`, `Country`, `ISO`, `Cement`, `Oil`, `Gas`, `Coal`, `Flaring`, `Total`.

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
- **Source**: Fetches from an external URL (e.g., Global Carbon Project or Zenodo).
- **Execution**: `pnpm run update-data`
- **Output**: Updates the CSV files in `public/data/`.
