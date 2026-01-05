# API Documentation

This project does not run a backend server. Instead, it serves static data files which act as a read-only API for the frontend application.

## 📡 Data Endpoints

The application loads data from the `/data/` directory.

### 1. Manifest
**URL**: `/data/manifest.json`
**Method**: `GET`
**Description**: Returns the configuration mapping logical names to the current versioned filenames of the datasets. This allows for cache busting and safe updates.

**Response Example**:
```json
{
  "emissions": "GCB2024v43_MtCO2_flat-clean.csv",
  "perCapita": "GCB_latest_percapita_flat-clean.csv",
  "emissionsHash": "sha256-...",
  "perCapitaHash": "sha256-...",
  "lastUpdated": "2024-10-27T10:00:00.000Z"
}
```

### 2. Emissions Dataset
**URL**: `/data/<filename_from_manifest>` (e.g., `/data/GCB2024v43_MtCO2_flat-clean.csv`)
**Method**: `GET`
**Format**: CSV
**Description**: Contains territorial CO₂ emissions data.

**Columns**:
- `Country`: Country name (ISO 3166-1 alpha-3 code or standard name)
- `ISO 3166-1 alpha-3`: Three-letter country code
- `Year`: Integer year (1750-2024)
- `Total`: Total emissions (MtCO₂)
- `Coal`: Emissions from coal
- `Oil`: Emissions from oil
- `Gas`: Emissions from gas
- `Cement`: Emissions from cement production
- `Flaring`: Emissions from gas flaring
- `Other`: Other sources

### 3. Per Capita Dataset
**URL**: `/data/<filename_from_manifest>` (e.g., `/data/GCB_latest_percapita_flat-clean.csv`)
**Method**: `GET`
**Format**: CSV
**Description**: Contains per capita emissions data.

**Columns**:
- `Country`: Country name
- `ISO 3166-1 alpha-3`: Three-letter country code
- `Year`: Integer year
- `Total`: Per capita emissions (tCO₂)

## 🌍 External APIs

The application consumes the following external APIs:

### REST Countries
**Base URL**: `https://restcountries.com/v3.1`
**Purpose**: Retrieving country metadata (flags, native names, population).
**Usage**:
-   `GET /alpha/{code}`: Fetch details for a specific country.
-   **Fields used**: `flags`, `name`, `population`, `region`.

### Zenodo (Data Update Script only)
**Base URL**: `https://zenodo.org/api`
**Purpose**: Fetching the latest Global Carbon Budget dataset during the build/update process.
**Usage**:
-   `GET /records/?q=conceptrecid:5569234`: Find the latest record version.
-   **Download**: Fetches the CSV files from the returned record.

## ⚠️ Error Handling

-   **404 Not Found**: If a data file is missing, the `useData` hook will enter an error state, and the UI will display a "Failed to load data" message.
-   **Integrity Failure**: If the SHA-256 hash of a downloaded file does not match the manifest, the application will reject the data to prevent tampering.
