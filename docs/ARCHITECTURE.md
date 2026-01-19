# Architecture & Design

This document outlines the architectural principles, directory structure, and design patterns used in the VisualDon-Projet application. It serves as a guide for developers to understand the codebase and how to extend it.

## 🏗️ High-Level Architecture

The application is a **Single Page Application (SPA)** built with **React** and **Vite**, served statically via Cloudflare Pages. It follows a modular component-based architecture with a clear separation of concerns, inspired by Clean Architecture principles but adapted for a frontend-heavy context.

### Layers

1.  **Presentation Layer (`components/`)**:
    *   Pure UI components responsible for rendering and user interaction.
    *   Separated into feature-specific folders (charts, controls, globe, layout, overlay).
    *   Passive components that receive data via props or context.

2.  **Application Layer (`hooks/`, `context/`)**:
    *   **Hooks**: Encapsulate stateful logic and data transformations (e.g., `useData` for fetching CSVs, custom D3 hooks).
    *   **Context**: Manages global state (e.g., `LanguageContext` for i18n).
    *   This layer bridges the UI and the data/infrastructure.

3.  **Infrastructure Layer (`services/`, `utils/`, `scripts/`)**:
    *   **Services**: Handle external API calls (e.g., `countryService.js` for fetching translations).
    *   **Utils**: Pure functions for security validation, formatting, and mathematical operations.
    *   **Scripts**: Node.js scripts for build-time data processing and fetching.

## 📂 Directory Structure

```text
src/
├── components/          # Presentation Layer
│   ├── charts/          # D3.js visualizations (Bubble, StackedArea, TopCountries)
│   ├── controls/        # Interactive elements (PlayButton, Slider, Timeline)
│   ├── globe/           # 3D Globe (Three.js/D3 hybrid)
│   ├── layout/          # App shell (Header, Footer, MainLayout)
│   └── overlay/         # Data overlays (DetailsPanel, Loading)
├── context/             # Global State (LanguageContext)
├── hooks/               # Application Logic (useData, useResizeObserver)
├── services/            # Data Services (countryService)
├── utils/               # Utilities (security, formatting)
├── App.jsx              # Root Component
└── main.jsx             # Entry Point
```

## 🧩 Key Design Patterns

### Data Loading Strategy
Data is loaded via a **Manifest-based pattern**.
1.  The app fetches `manifest.json` first.
2.  It uses the hashes in the manifest to fetch versioned CSV files (`emissions.csv`, `per_capita.csv`).
3.  This ensures cache busting and data integrity.

### Visualization Architecture
*   **Hybrid Approach**: Uses React for DOM structure and D3.js/Three.js for the actual rendering canvas/SVG.
*   **Refs**: `useRef` is used to hand over DOM elements to D3/Three.js, bypassing React's virtual DOM for performance-critical rendering.
*   **Memoization**: Extensive use of `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders during high-frequency updates (e.g., animation loop).

### Security
*   **Input Validation**: All external data (CSVs, APIs) is validated against strict schemas (see `utils/security.js`).
*   **Sanitization**: User inputs and fetched strings are sanitized before rendering.
*   **Dependency Review**: Automated workflows check for vulnerable dependencies.

## ➕ Extending the Application

### Adding a New Chart
1.  Create a new component in `src/components/charts/`.
2.  Use `useData` hook to access global emissions data.
3.  Implement D3 logic within a `useEffect` targeting a `ref`.
4.  Add the component to `src/components/overlay/DetailsPanel.jsx` or a new layout area.

### Adding a New Data Source
1.  Update `scripts/update-data.js` to fetch and normalize the new dataset.
2.  Add validation logic in `src/utils/security.js`.
3.  Update `src/hooks/useData.js` to load the new CSV.
4.  Expose the data via the hook to components.

### Adding a Language
1.  Update `src/context/LanguageContext.jsx` with the new language dictionary.
2.  Add a toggle button in `src/components/layout/HeaderContent.jsx`.
