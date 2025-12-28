# 🌍 Global CO₂ Emissions Visualization

[![Deployment Status](https://img.shields.io/badge/Cloudflare%20Pages-Deployed-orange?logo=cloudflare)](https://visualdon-projet.pages.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Data Source](https://zenodo.org/badge/DOI/10.5281/zenodo.7215364.svg)](https://doi.org/10.5281/zenodo.7215364)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.3.0-646CFF?logo=vite)](https://vitejs.dev)

An interactive 3D globe visualization exploring global CO₂ emissions from 1750 to 2024. Built with React, D3.js, and Three.js, this project transforms complex climate data into an engaging, accessible experience.

![Preview](wireframes/preview.png)

## ✨ Features

- **🌐 Interactive 3D Globe**: Explore emissions data on a fully interactive, rotatable globe with zoom controls.
- **📊 Dynamic Visualizations**: Real-time charts showing top emitters and country-specific breakdowns by sector.
- **⏱️ Time Travel**: Animate through 270+ years of emissions history with play/pause controls.
- **🌍 Bilingual Support**: Switch seamlessly between English and French interfaces.
- **📈 Cloudflare Analytics**: Integrated privacy-first web analytics.
- **🔍 SEO Optimized**: Metadata, Sitemap, and Robots.txt for better discoverability.
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices.
- **♿ Accessible**: Built with accessibility best practices and semantic HTML.
- **🔄 Auto-updating Data**: Automated monthly data updates from the Global Carbon Budget.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20.x or higher.
- **Package Manager**: pnpm (recommended), or npm/yarn.

### Installation

```bash
# Clone the repository
git clone https://github.com/kuasar-mknd/visualdon-projet.git
cd visualdon-projet

# Install dependencies (frozen lockfile recommended for CI)
pnpm install --frozen-lockfile

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
# Build the application
pnpm run build

# Preview the production build locally
pnpm run preview
```

## 🧪 Testing & Verification

### Linting
Ensure code quality and style consistency:
```bash
pnpm lint
```

### Verification Scripts
The project includes lightweight verification scripts (Python + Playwright) in `verification/` to ensure key components render correctly.
```bash
# Example: Verify initial load
python verification/verify_load.py
```

## 📊 Data & API

This project uses authoritative emissions data from the [Global Carbon Budget](https://globalcarbonproject.org/).

- **Endpoints**: The application serves data statically from `public/data/`. See [docs/API.md](docs/API.md) for details.
- **Update Process**: Run `pnpm run update-data` to fetch the latest dataset from Zenodo.

## ❓ Troubleshooting

### Common Issues

1.  **"Missing dependencies" or "Module not found"**
    *   **Cause**: `pnpm install` was not run or failed.
    *   **Fix**: Run `pnpm install` again.

2.  **"Node version mismatch"**
    *   **Cause**: You are running an older Node.js version.
    *   **Fix**: Install Node.js 20 or use `nvm use 20`.

3.  **"Port 5173 already in use"**
    *   **Cause**: Another instance of Vite is running.
    *   **Fix**: Vite will automatically choose the next port (e.g., 5174). Check your terminal output.

4.  **Charts appear empty**
    *   **Cause**: Data files might be missing or corrupted.
    *   **Fix**: Run `pnpm run update-data` to refresh `public/data/`.

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code style, testing, and pull requests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Data Provider**: [Global Carbon Project](https://www.globalcarbonproject.org/)
- **Research**: Friedlingstein et al. (2021) - [Global Carbon Budget 2021](https://doi.org/10.5194/essd-13-5213-2021)
- **Institution**: HEIG-VD
