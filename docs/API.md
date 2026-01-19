# API Documentation

The VisualDon-Projet is a static Single Page Application (SPA). It does not have a traditional REST backend. Instead, it serves data via static files (CSV/JSON) that serve as a read-only API.

## 📡 Data Endpoints

Base URL: `https://visualdon-projet.pages.dev/data/` (or `/data/` locally)

### 1. Data Manifest
Returns the metadata and integrity hashes for the current dataset version.

*   **URL**: `/data/manifest.json`
*   **Method**: `GET`
*   **Response**:
    ```json
    {
      "version": "2024.11.20",
      "lastUpdated": "2024-11-20T10:00:00Z",
      "files": {
        "emissions": "emissions.csv",
        "perCapita": "per_capita.csv"
      },
      "hashes": {
        "emissionsHash": "sha256-...",
        "perCapitaHash": "sha256-..."
      }
    }
    ```

### 2. Emissions Data
The core dataset containing absolute CO₂ emissions by country and year.

*   **URL**: `/data/emissions.csv`
*   **Method**: `GET`
*   **Format**: CSV
*   **Columns**:
    *   `Entity`: Country Name (String)
    *   `Code`: ISO 3166-1 alpha-3 code (String)
    *   `Year`: Year (Integer, 1750-Present)
    *   `Total`: Total CO₂ Emissions (Float)
    *   `Coal`, `Oil`, `Gas`, `Cement`, `Flaring`, `Other`: Breakdown by source (Float)

### 3. Per Capita Data
Population-adjusted emissions data.

*   **URL**: `/data/per_capita.csv`
*   **Method**: `GET`
*   **Format**: CSV
*   **Columns**:
    *   `Entity`: Country Name (String)
    *   `Code`: ISO 3166-1 alpha-3 code (String)
    *   `Year`: Year (Integer)
    *   `Per Capita`: CO₂ emissions per person in tonnes (Float)

## 🌍 External APIs

The application consumes the following external APIs on the client side:

### REST Countries
Used for fetching French translations of country names.

*   **URL**: `https://restcountries.com/v3.1/alpha?codes={codes}`
*   **Method**: `GET`
*   **Usage**: The app batches requests (e.g., 20 codes at a time) to avoid rate limits.
*   **Response**: Array of country objects containing `translations`.

## ⚠️ Error Handling

Since the "API" consists of static files:
*   **404 Not Found**: Indicates a missing data file or incorrect manifest configuration.
*   **Integrity Error**: The app calculates the SHA-256 hash of downloaded CSVs and compares them against `manifest.json`. If they mismatch, the app will refuse to load data to prevent tampering.

## 🔐 Authentication

No authentication is required for read access to public data.
