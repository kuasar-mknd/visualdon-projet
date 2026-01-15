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

- **Node.js 20.x** or higher (Recommended: `v20.11.0` LTS)
- **pnpm** (preferred), or npm/yarn.

### Installation

```bash
# Clone the repository
git clone https://github.com/kuasar-mknd/visualdon-projet.git
cd visualdon-projet

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
# Typecheck and Build
pnpm run build

# Preview production build locally
pnpm run preview
```

## 📊 Data & API

This project uses authoritative emissions data from the [Global Carbon Budget](https://globalcarbonproject.org/).

### Data Sources
- **Territorial Emissions**: Country-level CO₂ emissions by source (coal, oil, gas, cement, flaring).
- **Per Capita Emissions**: Population-adjusted emissions data.
- **Coverage**: 1750–2024.

### API Access
The application exposes its data via a static API. You can retrieve the current dataset manifest using curl:

```bash
curl -s https://visualdon-projet.pages.dev/data/manifest.json
```

For full documentation on available data endpoints, schemas, and usage, see [docs/API.md](docs/API.md).

### Updating Data
To fetch the latest data from the source (Zenodo):

```bash
pnpm run update-data
```

## 🛠️ Technology Stack

- **Frontend**: React 19.2, Hooks, Context API
- **Visualization**: D3.js v7, Three.js
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite 7
- **CI/CD**: GitHub Actions
- **Hosting**: Cloudflare Pages

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a deep dive into the code structure and design patterns.

## 📁 Project Structure

```text
visualdon-projet/
├── src/
│   ├── components/      # UI & Visualization Components
│   ├── hooks/           # Custom React Hooks (Data, Resize)
│   ├── services/        # Domain Services
│   └── utils/           # Helper functions
├── public/
│   └── data/            # Static CSV Data & Manifest
├── scripts/
│   └── update-data.js   # Data Fetching Script
└── .github/
    └── workflows/       # CI/CD Pipelines
```

## ❓ Troubleshooting

- **pnpm not found**: If you don't have pnpm installed, run `npm install -g pnpm` or use `corepack enable`.
- **Missing dependencies**: If you see "Module not found" errors, ensure you ran `pnpm install` in the root directory.
- **Environment Issues**: If the app behaves unexpectedly, check your `.env` file against `.env.example`. See [docs/ENV.md](docs/ENV.md).
- **Port already in use**: Vite will automatically try the next available port (e.g., 5174) if 5173 is busy.
- **Data not loading**: Run `pnpm run update-data` to ensure you have the latest datasets in `public/data/`.

## ✅ Verification

We use automated scripts to verify data integrity and code quality.

```bash
# Run integrity checks (Manifest/CSV validation)
pnpm test

# Run code linting
pnpm lint
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for climate awareness and data transparency**
