#!/usr/bin/env node

/**
 * Script to update CO2 emissions data from Global Carbon Budget
 * Downloads the latest data from Zenodo
 * 
 * To update to a newer version:
 * 1. Visit: https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Friedlingstein%22%20AND%20metadata.title%3A%22fossil%20CO2%20emissions%22&f=resource_type%3Adataset-data&l=list&p=1&s=10&sort=bestmatch
 * 2. Find the latest record
 * 3. Update ZENODO_RECORD_ID below with the new ID
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DATA_DIR = path.join(__dirname, '../public/data');
const TEMP_DIR = path.join(__dirname, '../.temp');

// Zenodo Concept Record ID for GCP Fossil CO2 emissions (stable across versions)
const ZENODO_CONCEPT_ID = '5569234';

/**
 * Fetch JSON from URL
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      const contentType = res.headers['content-type'];
      if (res.statusCode === 200 && contentType && !contentType.includes('application/json')) {
        console.warn(`⚠️  Warning: Expected application/json but got ${contentType}`);
      }

      const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit
      let length = 0;
      let data = '';

      res.on('data', chunk => {
        length += chunk.length;
        if (length > MAX_SIZE) {
          res.destroy();
          reject(new Error('Response too large (exceeded 10MB)'));
          return;
        }
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API Error: ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON response'));
        }
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

/**
 * Download a file from URL with redirect handling
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    let redirects = 0;
    const maxRedirects = 5;

    const download = (fileUrl) => {
      if (!fileUrl.startsWith('https://')) {
        reject(new Error('Insecure protocol: HTTPS required'));
        return;
      }

      const file = fs.createWriteStream(destPath);
      
      const req = https.get(fileUrl, { timeout: 15000 }, (response) => {
        // Handle redirects
        if (response.statusCode === 302 || response.statusCode === 301) {
          file.close();
          fs.unlinkSync(destPath);
          redirects++;
          if (redirects > maxRedirects) {
            reject(new Error('Too many redirects'));
            return;
          }
          const location = response.headers.location;
          if (!location) {
             reject(new Error('Redirect missing location header'));
             return;
          }
          return download(location);
        }
        
        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          return reject(new Error(`Failed to download: ${response.statusCode}`));
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlinkSync(destPath);
          reject(err);
        });
      });

      req.on('error', (err) => {
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(new Error('Download timed out'));
      });
    };
    
    download(url);
  });
}

/**
 * Get data from Zenodo
 */
async function getZenodoData() {
  console.log('🔍 Fetching data from Zenodo...');
  
  // Query for the latest version using the concept ID
  const apiUrl = `https://zenodo.org/api/records?q=conceptrecid:${ZENODO_CONCEPT_ID}&sort=mostrecent&size=1`;
  const response = await fetchJSON(apiUrl);
  
  if (!response || !response.hits || !response.hits.hits || response.hits.hits.length === 0) {
    throw new Error('Invalid response from Zenodo API or no records found');
  }
  
  // The first hit is the latest version
  const record = response.hits.hits[0];
  const metadata = record.metadata;
  const files = record.files;
  
  console.log(`✓ Found dataset`);
  console.log(`  Version: ${metadata.version || metadata.publication_date.substring(0, 4)}`);
  console.log(`  DOI: ${metadata.doi}`);
  console.log(`  Published: ${metadata.publication_date}\n`);
  
  // Find the CSV files
  const mtCO2File = files.find(f => f.key.includes('MtCO2_flat.csv') && !f.key.includes('metadata'));
  const populationFile = files.find(f => f.key.includes('population_flat.csv'));
  
  if (!mtCO2File || !populationFile) {
    console.error('Available files:', files.map(f => f.key));
    throw new Error('Required CSV files not found');
  }
  
  return {
    version: metadata.version || metadata.publication_date.substring(0, 4),
    mtCO2Url: mtCO2File.links.self,
    populationUrl: populationFile.links.self,
    mtCO2Filename: path.basename(mtCO2File.key),
    populationFilename: path.basename(populationFile.key),
    mtCO2Checksum: mtCO2File.checksum,
    populationChecksum: populationFile.checksum
  };
}

/**
 * Verify file checksum
 * @param {string} filePath - Path to file
 * @param {string} checksum - Expected checksum (e.g., 'md5:12345...')
 */
function verifyChecksum(filePath, checksum) {
  return new Promise((resolve, reject) => {
    if (!checksum) {
      console.warn('⚠️  No checksum provided for verification');
      resolve();
      return;
    }

    const [algo, hash] = checksum.split(':');
    if (!algo || !hash) {
      reject(new Error(`Invalid checksum format: ${checksum}`));
      return;
    }

    // Security Enhancement: Whitelist allowed algorithms to prevent usage of weak or unexpected algorithms
    const ALLOWED_ALGOS = ['md5', 'sha1', 'sha256', 'sha512'];
    if (!ALLOWED_ALGOS.includes(algo)) {
      reject(new Error(`Algorithm not allowed: ${algo}. Allowed: ${ALLOWED_ALGOS.join(', ')}`));
      return;
    }

    try {
      const stream = fs.createReadStream(filePath);
      const hasher = crypto.createHash(algo);

      stream.on('data', data => hasher.update(data));
      stream.on('end', () => {
        const calculatedHash = hasher.digest('hex');
        if (calculatedHash === hash) {
          console.log(`✓ Integrity check passed (${algo})`);
          resolve();
        } else {
          reject(new Error(`Checksum mismatch! Expected ${hash}, got ${calculatedHash}`));
        }
      });
      stream.on('error', reject);
    } catch (error) {
      reject(new Error(`Hashing error: ${error.message}`));
    }
  });
}

/**
/**
 * Parse a single CSV line with support for quoted fields and escaped quotes.
 * This replaces the regex-based split to avoid ReDoS vulnerabilities.
 * @param {string} line - The CSV line to parse
 * @returns {string[]} Array of field values
 */
function parseCSVLine(line) {
  const result = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        // Escaped quote: "" becomes "
        currentField += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim());
  return result;
}

/**
 * Parse CSV into array of objects
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  // Security Enhancement: Use state-machine parser instead of Regex to prevent ReDoS
  const headers = parseCSVLine(lines[0]);
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row = {};

    headers.forEach((header, index) => {
      // Prevent prototype pollution
      if (header === '__proto__' || header === 'constructor' || header === 'prototype') {
        return;
      }
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}

/**
 * Calculate per capita emissions
 */
function calculatePerCapita(mtCO2Data, populationData) {
  console.log('🧮 Calculating per capita emissions...');
  
  const popMap = new Map();
  populationData.forEach(row => {
    const key = `${row.Country}-${row.Year}`;
    popMap.set(key, parseFloat(row.Population) || 0);
  });
  
  const perCapitaData = mtCO2Data.map(row => {
    const key = `${row.Country}-${row.Year}`;
    const population = popMap.get(key) || 0;
    const total = parseFloat(row.Total) || 0;
    
    return {
      ...row,
      'Per Capita': population > 0 ? (total / population).toFixed(6) : ''
    };
  });
  
  console.log(`✓ Calculated per capita for ${perCapitaData.length} rows`);
  return perCapitaData;
}

/**
 * Convert array of objects back to CSV
 */
function arrayToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvLines = [headers.map(h => `"${h}"`).join(',')];
  
  data.forEach(row => {
    const values = headers.map(h => {
      const value = row[h] || '';
      if (value.toString().includes(',') || value.toString().includes('"')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvLines.push(values.join(','));
  });
  
  return csvLines.join('\n') + '\n';
}

/**
 * Main update function
 */
async function updateData() {
  console.log('📊 Starting data update from Global Carbon Budget (Zenodo)...\n');
  
  // Create directories
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  try {
    // Get Zenodo data info
    const zenodoData = await getZenodoData();
    
    // Download files
    console.log(`⬇️  Downloading ${zenodoData.mtCO2Filename}...`);
    const mtCO2Temp = path.join(TEMP_DIR, zenodoData.mtCO2Filename);

    if (!mtCO2Temp.startsWith(TEMP_DIR + path.sep)) {
      throw new Error('Path traversal detected in MtCO2 filename');
    }

    await downloadFile(zenodoData.mtCO2Url, mtCO2Temp);
    console.log(`✓ Downloaded (${(fs.statSync(mtCO2Temp).size / 1024).toFixed(0)} KB)`);
    await verifyChecksum(mtCO2Temp, zenodoData.mtCO2Checksum);
    console.log('');
    
    console.log(`⬇️  Downloading ${zenodoData.populationFilename}...`);
    const populationTemp = path.join(TEMP_DIR, zenodoData.populationFilename);

    if (!populationTemp.startsWith(TEMP_DIR + path.sep)) {
      throw new Error('Path traversal detected in population filename');
    }

    await downloadFile(zenodoData.populationUrl, populationTemp);
    console.log(`✓ Downloaded (${(fs.statSync(populationTemp).size / 1024).toFixed(0)} KB)`);
    await verifyChecksum(populationTemp, zenodoData.populationChecksum);
    console.log('');
    
    // Parse and process
    console.log('📖 Parsing data...');
    const mtCO2Content = fs.readFileSync(mtCO2Temp, 'utf-8');
    const populationContent = fs.readFileSync(populationTemp, 'utf-8');
    
    const mtCO2Data = parseCSV(mtCO2Content);
    const populationData = parseCSV(populationContent);
    console.log(`✓ Parsed ${mtCO2Data.length} emission records, ${populationData.length} population records\n`);
    
    const perCapitaData = calculatePerCapita(mtCO2Data, populationData);
    
    // Save files (with dynamic names and manifest)
    console.log('💾 Saving data...');
    
    // Use the original filename for emissions data
    const mtCO2FinalName = zenodoData.mtCO2Filename;
    const mtCO2Final = path.join(DATA_DIR, mtCO2FinalName);

    if (!mtCO2Final.startsWith(DATA_DIR + path.sep)) {
      throw new Error('Path traversal detected in MtCO2 final filename');
    }

    fs.writeFileSync(mtCO2Final, mtCO2Content, 'utf-8');
    console.log(`✓ Saved: ${mtCO2Final}`);
    
    // Create dynamic name for per-capita data
    const perCapitaFinalName = `GCB_${zenodoData.version}_percapita_flat-clean.csv`;
    const perCapitaFinal = path.join(DATA_DIR, perCapitaFinalName);

    if (!perCapitaFinal.startsWith(DATA_DIR + path.sep)) {
      throw new Error('Path traversal detected in per-capita final filename');
    }

    fs.writeFileSync(perCapitaFinal, arrayToCSV(perCapitaData), 'utf-8');
    console.log(`✓ Saved: ${perCapitaFinal}\n`);

    // Create and save manifest
    const manifest = {
      emissions: mtCO2FinalName,
      perCapita: perCapitaFinalName,
      version: zenodoData.version,
      lastUpdated: new Date().toISOString()
    };

    const manifestPath = path.join(DATA_DIR, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`✓ Saved manifest: ${manifestPath}\n`);
    
    console.log('✅ Data update completed successfully!');
    console.log(`📈 Version: ${zenodoData.version}`);
    console.log(`📁 Files saved to: ${DATA_DIR}`);
    
    // Cleanup
    console.log('\n🗑️  Cleaning up...');
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('✓ Done\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    // Don't log stack trace in production/CI logs if unnecessary, or keep it for debugging but ensure no sensitive data is there.
    // Here we are in a dev/maintenance script, so stack is useful, but we ensure the error message is what we rely on.
    // To comply with strict "fail safe" (errors shouldn't leak system details), we'll reduce verbosity unless needed.
    // console.error(error.stack);
    process.exit(1);
  }
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  updateData();
}

export { updateData, verifyChecksum };
