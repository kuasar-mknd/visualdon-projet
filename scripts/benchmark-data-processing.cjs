
const { performance } = require('perf_hooks');

// Mock Data Generation
const COUNTRIES = ['USA', 'CHN', 'IND', 'RUS', 'JPN', 'DEU', 'WLD', 'GBR', 'FRA', 'ITA'];
const YEARS = 270; // 1750 to 2020
const DATA_SIZE = 50000; // Approx size

const data = [];
for (let i = 0; i < DATA_SIZE; i++) {
  data.push({
    "ISO 3166-1 alpha-3": COUNTRIES[i % COUNTRIES.length],
    Year: 1750 + (i % YEARS),
    Total: Math.random() * 1000,
    "Per Capita": Math.random() * 20
  });
}

console.log(`Dataset size: ${data.length} rows`);

function currentApproach(emissions) {
    const start = performance.now();

    // Pass 1: Stats
    let min = Infinity;
    let max = -Infinity;
    let maxEm = 0;

    for (const d of emissions) {
      if (d.Year != null) {
          if (d.Year < min) min = d.Year;
          if (d.Year > max) max = d.Year;
      }
      const val = d.Total || 0;
      if (val > maxEm) maxEm = val;
    }
    const stats = { yearRange: { min, max }, maxEmissions: maxEm };

    // Pass 2: By Year
    const byYear = new Map();
    for (const d of emissions) {
      if (d["ISO 3166-1 alpha-3"] === "WLD") continue;

      const year = d.Year;
      if (!byYear.has(year)) {
        byYear.set(year, { list: [], map: new Map() });
      }
      const entry = byYear.get(year);
      entry.list.push(d);
      entry.map.set(d["ISO 3166-1 alpha-3"], d);
    }
    // Sort
    for (const entry of byYear.values()) {
      entry.list.sort((a, b) => (b.Total || 0) - (a.Total || 0));
    }

    // Pass 3: By Country
    const byCountry = new Map();
    for (const d of emissions) {
      const iso = d["ISO 3166-1 alpha-3"];
      if (!byCountry.has(iso)) {
        byCountry.set(iso, []);
      }
      byCountry.get(iso).push(d);
    }

    const end = performance.now();
    return end - start;
}

function optimizedApproach(emissions) {
    const start = performance.now();

    let min = Infinity;
    let max = -Infinity;
    let maxEm = 0;
    const byYear = new Map();
    const byCountry = new Map();

    for (const d of emissions) {
        // Stats
        if (d.Year != null) {
            if (d.Year < min) min = d.Year;
            if (d.Year > max) max = d.Year;
        }
        const val = d.Total || 0;
        if (val > maxEm) maxEm = val;

        const iso = d["ISO 3166-1 alpha-3"];

        // Group by Country
        if (!byCountry.has(iso)) {
            byCountry.set(iso, []);
        }
        byCountry.get(iso).push(d);

        // Group by Year (exclude WLD)
        if (iso !== "WLD") {
            const year = d.Year;
            if (!byYear.has(year)) {
                byYear.set(year, { list: [], map: new Map() });
            }
            const entry = byYear.get(year);
            entry.list.push(d);
            entry.map.set(iso, d);
        }
    }

    // Sort lists by Total descending (Still need this)
    for (const entry of byYear.values()) {
        entry.list.sort((a, b) => (b.Total || 0) - (a.Total || 0));
    }

    const stats = { yearRange: { min, max }, maxEmissions: maxEm };

    const end = performance.now();
    return end - start;
}

// Warmup
for(let i=0; i<5; i++) {
    currentApproach(data);
    optimizedApproach(data);
}

// Measure
let currentTotal = 0;
let optimizedTotal = 0;
const iterations = 100;

for(let i=0; i<iterations; i++) {
    currentTotal += currentApproach(data);
    optimizedTotal += optimizedApproach(data);
}

console.log(`Current Approach Average: ${(currentTotal / iterations).toFixed(3)} ms`);
console.log(`Optimized Approach Average: ${(optimizedTotal / iterations).toFixed(3)} ms`);
console.log(`Improvement: ${((currentTotal - optimizedTotal) / currentTotal * 100).toFixed(1)}%`);
