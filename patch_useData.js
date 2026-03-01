const fs = require('fs');
let code = fs.readFileSync('src/hooks/useData.js', 'utf8');
code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { logger } from '../utils/logger';");
code = code.replace('console.error("Error loading data:", err.message);', 'logger.error("Error loading data:", err.message);');
fs.writeFileSync('src/hooks/useData.js', code);
