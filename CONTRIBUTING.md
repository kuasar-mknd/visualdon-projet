# Contributing to Global CO₂ Emissions Visualization

First off, thank you for considering contributing to this project! 🎉

This project aims to make climate data accessible and understandable through interactive visualization. Your contributions help advance climate awareness and data transparency.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue.

## 🤔 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs. actual behavior**
- **Screenshots** if applicable
- **Environment details** (browser, OS, Node version)

Use the bug report template when available.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear use case** - why is this enhancement useful?
- **Detailed description** of the proposed functionality
- **Mockups or examples** if applicable
- **Potential implementation approach** (optional)

### Your First Code Contribution

Unsure where to start? Look for issues labeled:

- `good first issue` - simple issues perfect for newcomers
- `help wanted` - issues where we need community help
- `documentation` - improvements to docs

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes following our coding standards
3. Test your changes thoroughly
4. Update documentation as needed
5. Submit a pull request!

## 🛠️ Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git

### Setup Steps

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/visualdon-projet.git
cd visualdon-projet

# Add upstream remote
git remote add upstream https://github.com/kuasar-mknd/visualdon-projet.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run update-data` - Fetch latest CO₂ emissions data

## 📏 Coding Standards

### JavaScript/React

- Use **functional components** with hooks (no class components)
- Follow **React best practices**: proper hook usage, memoization where needed
- Use **meaningful variable names** - clarity over brevity
- **Extract reusable logic** into custom hooks
- **Avoid prop drilling** - use Context API when appropriate

### Code Style

We use ESLint to enforce code style. Run `npm run lint` before committing.

**Key conventions:**

- Use `const` by default, `let` only when reassignment is needed
- Prefer arrow functions for callbacks
- Use template literals for string interpolation
- Add comments for complex logic, but prefer self-documenting code
- Keep functions small and focused (single responsibility)

### File Organization

- **Components**: One component per file, named exports
- **Hooks**: Prefix with `use`, e.g., `useData.js`
- **Services**: API calls and external integrations
- **Context**: Global state management

### CSS/Styling

- Use **Tailwind CSS** utility classes
- Follow **mobile-first** responsive design
- Maintain **consistent spacing** using Tailwind's scale
- Use **semantic color names** from the theme

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```bash
feat(globe): add zoom controls for 3D visualization

- Implement mouse wheel zoom
- Add zoom in/out buttons
- Set min/max zoom limits

Closes #42
```

```bash
fix(chart): prevent bubble overflow in country chart

Bubbles were extending beyond chart boundaries for countries
with extensive data. Added proper scaling and padding.

Fixes #38
```

## 🔄 Pull Request Process

1. **Update documentation** - README, code comments, etc.
2. **Follow commit guidelines** - clear, conventional commit messages
3. **Test thoroughly** - verify on multiple browsers/devices
4. **Keep PRs focused** - one feature/fix per PR
5. **Describe your changes** - use the PR template
6. **Link related issues** - use "Fixes #123" or "Closes #123"
7. **Be responsive** - address review feedback promptly

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Tested on Chrome, Firefox, and Safari
- [ ] Responsive design verified on mobile

## 📂 Project Structure

```
src/
├── components/
│   ├── Globe.jsx              # 3D globe visualization
│   ├── CountryChart.jsx       # Country-specific emissions chart
│   └── TopCountriesChart.jsx  # Top emitters ranking
├── context/
│   └── LanguageContext.jsx    # i18n context
├── hooks/
│   └── useData.js             # Data fetching hook
├── services/
│   └── countryService.js      # Country name translations
└── App.jsx                    # Main application
```

### Key Components

- **Globe.jsx**: Three.js-based 3D globe with country selection
- **CountryChart.jsx**: D3.js bubble chart showing emissions by sector
- **TopCountriesChart.jsx**: Horizontal bar chart of top emitters
- **useData.js**: Loads and processes CSV data files

## 🧪 Testing

Currently, this project relies on manual testing. Contributions to add automated tests are highly welcome!

**Manual testing checklist:**

- [ ] Globe renders correctly and is interactive
- [ ] Year slider updates visualizations
- [ ] Play/pause animation works
- [ ] Country selection displays correct data
- [ ] Language toggle switches all text
- [ ] Charts render without errors
- [ ] Responsive layout works on mobile

## 🌐 Internationalization

We support English and French. When adding new text:

1. Add translations to `LanguageContext.jsx`
2. Use the `t()` function from `useLanguage()` hook
3. Never hardcode user-facing strings

```jsx
const { t } = useLanguage();
return <button>{t("play")}</button>;
```

## 📊 Data Contributions

### Updating Data Sources

If you find a newer or better data source:

1. Document the source with proper citation
2. Update `scripts/update-data.js`
3. Ensure data format compatibility
4. Update `DATA_UPDATE.md` documentation

### Data Quality

- Verify data accuracy against official sources
- Check for missing or anomalous values
- Document any data transformations applied

## 💡 Feature Ideas

Looking for inspiration? Here are some feature ideas:

- [ ] Add more visualization types (choropleth map, line charts)
- [ ] Export data/charts as images or CSV
- [ ] Compare multiple countries side-by-side
- [ ] Show emissions projections/targets
- [ ] Add historical events timeline overlay
- [ ] Implement keyboard navigation
- [ ] Add unit tests with Vitest
- [ ] Create E2E tests with Playwright

## 🆘 Getting Help

- **Questions?** Open a [Discussion](https://github.com/kuasar-mknd/visualdon-projet/discussions)
- **Bug?** Open an [Issue](https://github.com/kuasar-mknd/visualdon-projet/issues)
- **Stuck?** Check existing issues or ask in Discussions

## 🙏 Recognition

Contributors are recognized in our README and release notes. Significant contributions may be highlighted in project documentation.

---

Thank you for contributing to climate awareness through data visualization! 🌍💚
