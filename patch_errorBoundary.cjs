const fs = require('fs');
let code = fs.readFileSync('src/components/common/ErrorBoundary.jsx', 'utf8');
code = code.replace("import React from 'react';", "import React from 'react';\nimport PropTypes from 'prop-types';");
code = code.replace("componentDidCatch(error, errorInfo) { \/\/ eslint-disable-line no-unused-vars", "componentDidCatch(error, errorInfo) {\n    // eslint-disable-line no-unused-vars");
code += "\n\nErrorBoundary.propTypes = {\n  children: PropTypes.node.isRequired,\n};\n";
fs.writeFileSync('src/components/common/ErrorBoundary.jsx', code);
