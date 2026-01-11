
const { performance } = require('perf_hooks');

const ROWS = 50000;
const COLS = 10;
const headers = Array.from({ length: COLS }, (_, i) => `col_${i}`);
const safeHeaders = headers.map((key, index) => ({ key, index }));

const rawRows = [];
for (let i = 0; i < ROWS; i++) {
    const row = [];
    for (let j = 0; j < COLS; j++) {
        row.push(String(Math.random() * 1000));
    }
    rawRows.push(row);
}

function fastRowConverter(d) {
    for (const key in d) {
        if (key === 'col_0') continue; // Simulate string col
        const val = d[key];
        if (val === '') d[key] = null;
        else d[key] = +val;
    }
    return d;
}

function currentApproach() {
    const start = performance.now();
    const data = rawRows.map(row => {
        const obj = {};
        for (let j = 0; j < safeHeaders.length; j++) {
            const { key, index } = safeHeaders[j];
            obj[key] = row[index];
        }
        return fastRowConverter(obj);
    });
    const end = performance.now();
    return end - start;
}

function optimizedApproach() {
    const start = performance.now();
    const data = rawRows.map(row => {
        const obj = {};
        for (let j = 0; j < safeHeaders.length; j++) {
            const { key, index } = safeHeaders[j];
            const rawVal = row[index];

            // Inline logic or specialized builder
            if (key === 'col_0') {
                obj[key] = rawVal;
                continue;
            }
            if (rawVal === '') {
                obj[key] = null;
            } else {
                obj[key] = +rawVal;
            }
        }
        return obj;
    });
    const end = performance.now();
    return end - start;
}

// Warmup
for(let i=0; i<5; i++) {
    currentApproach();
    optimizedApproach();
}

let currentTotal = 0;
let optimizedTotal = 0;
const iterations = 50;

for(let i=0; i<iterations; i++) {
    currentTotal += currentApproach();
    optimizedTotal += optimizedApproach();
}

console.log(`CSV Parsing - Current Approach Average: ${(currentTotal / iterations).toFixed(3)} ms`);
console.log(`CSV Parsing - Optimized Approach Average: ${(optimizedTotal / iterations).toFixed(3)} ms`);
console.log(`Improvement: ${((currentTotal - optimizedTotal) / currentTotal * 100).toFixed(1)}%`);
