# Data Update Process

This project uses data from the [Global Carbon Budget](https://globalcarbonbudget.org/).

## Automatic Update

To update the data to the latest version:

```bash
npm run update-data
```

This script will:

1. Download the latest data from Global Carbon Budget (Zenodo repository)
2. Clean and optimize the CSV files
3. Save them to `public/data/`

## Manual Update

If you need to customize the data source or processing:

1. Edit `scripts/update-data.js`
2. Update the `DATA_URLS` object with new URLs
3. Modify the `cleanCSV()` function if you need different data transformations

## Data Files

- `GCB2022v27_MtCO2_flat-clean.csv` - Territorial CO2 emissions by country and year
- `GCB2022v27_percapita_flat-clean.csv` - Per capita CO2 emissions

## Automation with GitHub Actions

You can automate data updates using GitHub Actions. Create `.github/workflows/update-data.yml`:

```yaml
name: Update CO2 Data

on:
  schedule:
    - cron: "0 0 1 * *" # Run monthly
  workflow_dispatch: # Allow manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm install
      - run: npm run update-data
      - name: Commit changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add public/data/
          git commit -m "chore: update CO2 emissions data" || echo "No changes"
          git push
```

## Data Source

The data comes from the Global Carbon Budget project, specifically from their Zenodo repository:

- https://zenodo.org/communities/global-carbon-budget

Always check their website for the latest version numbers and update the URLs in `scripts/update-data.js` accordingly.
