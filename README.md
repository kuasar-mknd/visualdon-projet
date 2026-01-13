# 🌍 Global CO₂ Emissions Visualization

[![Deployment Status](https://img.shields.io/badge/Cloudflare%20Pages-Deployed-orange?logo=cloudflare)](https://visualdon-projet.pages.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Data Source](https://zenodo.org/badge/DOI/10.5281/zenodo.7215364.svg)](https://doi.org/10.5281/zenodo.7215364)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.3.0-646CFF?logo=vite)](https://vitejs.dev)

An interactive 3D globe visualization exploring global CO₂ emissions from 1750 to 2024. Built with React, D3.js, and Three.js, this project transforms complex climate data into an engaging, accessible experience.

![Preview](wireframes/preview.png)

## ✨ Features

- **🌐 Interactive 3D Globe**: Explore emissions data on a fully interactive, rotatable globe with zoom controls
- **📊 Dynamic Visualizations**: Real-time charts showing top emitters and country-specific breakdowns by sector
- **⏱️ Time Travel**: Animate through 270+ years of emissions history with play/pause controls
- **🌍 Bilingual Support**: Switch seamlessly between English and French interfaces
- **📈 Cloudflare Analytics**: Integrated privacy-first web analytics
- **🔍 SEO Optimized**: Metadata, Sitemap, and Robots.txt for better discoverability
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **♿ Accessible**: Built with accessibility best practices and semantic HTML
- **🔄 Auto-updating Data**: Automated monthly data updates from the Global Carbon Budget

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- pnpm (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/kuasar-mknd/visualdon-projet.git
cd visualdon-projet

# Install dependencies (auto-detects pnpm/npm/yarn)
pnpm install

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
pnpm run build
pnpm run preview
```

## 📊 Data & API

This project uses authoritative emissions data from the [Global Carbon Budget](https://globalcarbonproject.org/), maintained by leading climate scientists worldwide.

### Data Sources

- **Territorial Emissions**: Country-level CO₂ emissions by source (coal, oil, gas, cement, flaring)
- **Per Capita Emissions**: Population-adjusted emissions data
- **Coverage**: 1750–2024 (updated annually)

### API Access

The application exposes its data via a static API. You can retrieve the current dataset manifest using curl:

```bash
curl -s https://visualdon-projet.pages.dev/data/manifest.json
```

For full documentation on available data endpoints and schemas, see [docs/API.md](docs/API.md).

### Updating Data

```bash
# Fetch latest data from Global Carbon Budget
pnpm run update-data
```

Data updates are also automated via GitHub Actions, running monthly. See [DATA_UPDATE.md](DATA_UPDATE.md) for details.

## 🛠️ Technology Stack

- **Frontend**: React 19.2 with hooks
- **Visualization**: D3.js for charts, Three.js for 3D globe
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite 7
- **Deployment**: Cloudflare Pages
- **Analytics**: Cloudflare Web Analytics
- **Data Processing**: Node.js scripts for CSV parsing and optimization (see `scripts/update-data.js`)

## 📁 Project Structure

```text
visualdon-projet/
├── src/
│   ├── components/      # React components
│   │   ├── charts/      # D3 Charts (Bubble, StackedArea)
│   │   ├── controls/    # UI Controls (Play, Slider)
│   │   ├── globe/       # 3D Globe elements & Legend
│   │   ├── layout/      # Header, Footer
│   │   └── overlay/     # Details Panel
│   ├── context/         # React context (Language)
│   ├── hooks/           # Custom React hooks (useData)
│   ├── services/        # API services (country translations)
│   ├── App.jsx          # Main orchestrator
│   └── main.jsx         # Application entry point
├── public/
│   ├── data/            # CO₂ emissions datasets (CSV)
│   ├── sitemap.xml      # SEO Sitemap
│   └── robots.txt       # Crawler directives
├── scripts/
│   └── update-data.js   # Data fetching and processing script
├── .github/
│   └── workflows/       # GitHub Actions for automated data updates
└── dataset/             # Original raw datasets
```

## ❓ Troubleshooting

Common issues and solutions:

- **Missing dependencies**: If you encounter errors about missing modules, ensure you have run `pnpm install`.
- **Package Manager**: This project is optimized for `pnpm`. If you use `npm` or `yarn` and face issues, try deleting `node_modules` and installing with `pnpm`.
- **Node version**: This project requires Node.js 20+. Use `node -v` to check your version.
- **Port already in use**: If `http://localhost:5173` is taken, Vite will automatically try the next available port (e.g., 5174). Check the console output.
- **Data not loading**: If charts are empty, try running `pnpm run update-data` to fetch the latest dataset.
- **Environment Issues**: Ensure your `.env` file (if present) does not contain conflicting variables. See [docs/ENV.md](docs/ENV.md) for details.

## ✅ Verification

### Automated Verification
The project includes a comprehensive test suite that verifies data integrity, manifest consistency, and critical file existence.

```bash
# Run integrity checks (no browser required)
pnpm test
```

### Static Analysis
To ensure code quality and prevent regressions, run the linter:
```bash
pnpm lint
```

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, improving documentation, or proposing new features, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and commit: `git commit -m 'Add amazing feature'`
4. **Push to your branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines, including:

- Code style and conventions
- Testing requirements
- Commit message format
- Pull request process

### Development Guidelines

- Follow the existing code style (ESLint configuration provided)
- Write meaningful commit messages
- Test your changes across different browsers and devices
- Update documentation as needed

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Data Provider**: [Global Carbon Project](https://www.globalcarbonproject.org/)
- **Research Paper**: Friedlingstein et al. (2021) - [Global Carbon Budget 2021](https://doi.org/10.5194/essd-13-5213-2021)
- **Country Translations**: [REST Countries API](https://restcountries.com/)
- **Institution**: HEIG-VD (Haute École d'Ingénierie et de Gestion du Canton de Vaud)

## 📖 Research Context

This visualization is based on the Global Carbon Budget dataset, which provides comprehensive, peer-reviewed estimates of anthropogenic greenhouse gas emissions from 1750 to present. The research highlights:

- Continuous growth in CO₂ emissions across all sectors
- No significant reduction observed in any global sector to date
- The critical importance of independent, real-time emissions tracking for climate policy

> **Citation**: Friedlingstein, P., Jones, M. W., O'Sullivan, M., et al. (2021). Global Carbon Budget 2021. _Earth System Science Data_, 13(11), 5213-5252. <https://doi.org/10.5194/essd-13-5213-2021>

## 🔗 Links

- **Live Demo**: [https://visualdon-projet.pages.dev](https://visualdon-projet.pages.dev)
- **Report Issues**: [GitHub Issues](https://github.com/kuasar-mknd/visualdon-projet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kuasar-mknd/visualdon-projet/discussions)

## 📧 Contact

For questions or suggestions, please [open an issue](https://github.com/kuasar-mknd/visualdon-projet/issues/new) or start a [discussion](https://github.com/kuasar-mknd/visualdon-projet/discussions/new).

---

**Made with ❤️ for climate awareness and data transparency**
