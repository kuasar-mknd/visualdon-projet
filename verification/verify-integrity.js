import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function logPass(message) {
  console.log(`${GREEN}✓ PASS:${RESET} ${message}`);
}

function logFail(message) {
  console.error(`${RED}✗ FAIL:${RESET} ${message}`);
  process.exit(1);
}

// 1. Verify Manifest
const manifestPath = path.join(__dirname, '../public/data/manifest.json');
if (!fs.existsSync(manifestPath)) {
  logFail(`Manifest file missing at ${manifestPath}`);
}

try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestContent);

  if (!manifest.emissions || !manifest.perCapita) {
    logFail('Manifest missing required keys (emissions, perCapita)');
  }

  // Verify referenced files exist
  const emissionsPath = path.join(__dirname, '../public/data', manifest.emissions);
  if (!fs.existsSync(emissionsPath)) {
    logFail(`Referenced emissions file missing: ${manifest.emissions}`);
  }

  const perCapitaPath = path.join(__dirname, '../public/data', manifest.perCapita);
  if (!fs.existsSync(perCapitaPath)) {
    logFail(`Referenced perCapita file missing: ${manifest.perCapita}`);
  }

  logPass('Data integrity verified (manifest + CSVs)');
} catch (error) {
  logFail(`Manifest validation error: ${error.message}`);
}

// 2. Verify ENV example
const envExamplePath = path.join(__dirname, '../.env.example');
if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    if (envContent.includes('=')) {
        // Check if values are placeholders (rudimentary check)
        const lines = envContent.split('\n');
        for (const line of lines) {
            if (line.trim().startsWith('#')) continue;
            const parts = line.split('=');
            if (parts.length === 2 && parts[1].trim().length > 0 && !line.includes('YOUR_') && !parts[1].includes('<')) {
                console.warn(`${RED}! WARN:${RESET} Potential secret in .env.example: ${parts[0]}`);
            }
        }
    }
    logPass('.env.example exists');
} else {
    logFail('.env.example missing');
}

console.log('\nAll integrity checks passed.');
