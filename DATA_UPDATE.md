# Data Update Process

This project uses data from the [Global Carbon Budget](https://globalcarbonproject.org/).

## Automatic Update

To update the data to the latest version available on Zenodo:

```bash
pnpm run update-data
```

This script will:

1.  Query the Zenodo API using the stable Concept ID (`5569234`) to find the latest version.
2.  Download the required CSV files (Emissions and Population).
3.  Calculate per-capita emissions.
4.  Save the files to `public/data/` with versioned filenames.
5.  Update `public/data/manifest.json` to point to the new files.

## Manual Update

The update process is fully automated via the script. You generally do not need to manually edit URLs.
However, if the Zenodo API structure changes or the Concept ID is deprecated:

1.  Find the new record ID on Zenodo.
2.  Update `ZENODO_CONCEPT_ID` in `scripts/update-data.js`.

## Data Files

Files in `public/data/` are versioned. Do not hardcode filenames in the application; always use the `manifest.json` to resolve them.

- **`manifest.json`**: Maps logical names (`emissions`, `perCapita`) to actual filenames.
- **`GCB..._MtCO2_flat.csv`**: Territorial CO2 emissions.
- **`GCB..._percapita_flat-clean.csv`**: Per capita emissions (calculated).

## Automation with GitHub Actions

Data updates are automated using GitHub Actions. See `.github/workflows/update-data.yml` (if configured) or the repository settings.

## Data Source

The data comes from the Global Carbon Budget project, specifically from their Zenodo repository:

-   [Global Carbon Budget on Zenodo](https://zenodo.org/communities/global-carbon-budget)

Always check their website for the latest version numbers if the automated script fails.
