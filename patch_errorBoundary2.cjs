const fs = require('fs');
let code = fs.readFileSync('src/components/common/ErrorBoundary.jsx', 'utf8');
code = code.replace("componentDidCatch(error, errorInfo) {\n    // eslint-disable-line no-unused-vars", "componentDidCatch(error, errorInfo) { // eslint-disable-line no-unused-vars");
fs.writeFileSync('src/components/common/ErrorBoundary.jsx', code);
