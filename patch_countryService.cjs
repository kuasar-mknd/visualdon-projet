const fs = require('fs');
let code = fs.readFileSync('src/services/countryService.js', 'utf8');
code = code.replace("import { isValidCountryCode, isValidLanguage } from '../utils/security.js';", "import { isValidCountryCode, isValidLanguage } from '../utils/security.js';\nimport { logger } from '../utils/logger.js';");
code = code.replace('console.warn("Invalid cache structure detected, resetting cache");', 'logger.warn("Invalid cache structure detected, resetting cache");');
code = code.replace('console.error("Error reading cache:", e.message);', 'logger.error("Error reading cache:", e.message);');
code = code.replace('console.error("Error writing cache:", e.message);', 'logger.error("Error writing cache:", e.message);');
code = code.replace('console.warn(`Security: Invalid country code format rejected: ${code}`);', 'logger.warn(`Security: Invalid country code format rejected: ${code}`);');
code = code.replace('console.warn(`Failed to fetch data for ${safeLogCode}:`, error.message);', 'logger.warn(`Failed to fetch data for ${safeLogCode}:`, error.message);');
fs.writeFileSync('src/services/countryService.js', code);
