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
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DATA_DIR = path.join(__dirname, '../public/data');
const TEMP_DIR = path.join(__dirname, '../.temp');

// Latest Zenodo record ID for GCP Fossil CO2 emissions
const ZENODO_RECORD_ID = '17417124'; // GCB2025 (November 2025)

/**
 * Fetch JSON from URL
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON response'));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Download a file from URL with redirect handling
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const download = (fileUrl) => {
      const file = fs.createWriteStream(destPath);
      const protocol = fileUrl.startsWith('https') ? https : require('http');
      
      protocol.get(fileUrl, (response) => {
        // Handle redirects
        if (response.statusCode === 302 || response.statusCode === 301) {
          file.close();
          fs.unlinkSync(destPath);
          return download(response.headers.location);
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
      }).on('error', (err) => {
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
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
  
  const apiUrl = `https://zenodo.org/api/records/${ZENODO_RECORD_ID}`;
  const response = await fetchJSON(apiUrl);
  
  if (!response || !response.metadata) {
    throw new Error('Invalid response from Zenodo API');
  }
  
  const metadata = response.metadata;
  const files = response.files;
  
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
    mtCO2Filename: mtCO2File.key,
    populationFilename: populationFile.key
  };
}

/**
 * Parse CSV into array of objects
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
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
    await downloadFile(zenodoData.mtCO2Url, mtCO2Temp);
    console.log(`✓ Downloaded (${(fs.statSync(mtCO2Temp).size / 1024).toFixed(0)} KB)\n`);
    
    console.log(`⬇️  Downloading ${zenodoData.populationFilename}...`);
    const populationTemp = path.join(TEMP_DIR, zenodoData.populationFilename);
    await downloadFile(zenodoData.populationUrl, populationTemp);
    console.log(`✓ Downloaded (${(fs.statSync(populationTemp).size / 1024).toFixed(0)} KB)\n`);
    
    // Parse and process
    console.log('📖 Parsing data...');
    const mtCO2Content = fs.readFileSync(mtCO2Temp, 'utf-8');
    const populationContent = fs.readFileSync(populationTemp, 'utf-8');
    
    const mtCO2Data = parseCSV(mtCO2Content);
    const populationData = parseCSV(populationContent);
    console.log(`✓ Parsed ${mtCO2Data.length} emission records, ${populationData.length} population records\n`);
    
    const perCapitaData = calculatePerCapita(mtCO2Data, populationData);
    
    // Save files (with generic names so code doesn't need to change)
    console.log('💾 Saving data...');
    
    const mtCO2Final = path.join(DATA_DIR, 'GCB_latest_MtCO2_flat-clean.csv');
    fs.writeFileSync(mtCO2Final, mtCO2Content, 'utf-8');
    console.log(`✓ Saved: ${mtCO2Final}`);
    
    const perCapitaFinal = path.join(DATA_DIR, 'GCB_latest_percapita_flat-clean.csv');
    fs.writeFileSync(perCapitaFinal, arrayToCSV(perCapitaData), 'utf-8');
    console.log(`✓ Saved: ${perCapitaFinal}\n`);
    
    console.log('✅ Data update completed successfully!');
    console.log(`📈 Version: ${zenodoData.version}`);
    console.log(`📁 Files saved to: ${DATA_DIR}`);
    
    // Cleanup
    console.log('\n🗑️  Cleaning up...');
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('✓ Done\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  updateData();
}

export { updateData };
