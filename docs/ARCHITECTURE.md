# Architecture

## Overview
This project is a client-side Single Page Application (SPA) built with React 19 and Vite. It visualizes global CO₂ emissions data using D3.js for charts and Three.js (via React components) for 3D globe elements. The application is designed to be performant, accessible, and responsive.

## Core Technologies
- **React 19**: UI library for building component-based user interfaces.
- **Vite**: Next-generation frontend tooling for fast builds and hot module replacement.
- **Tailwind CSS v4**: Utility-first CSS framework for styling.
- **D3.js**: JavaScript library for manipulating documents based on data, used here for complex visualizations.

## Directory Structure

### `src/`
The source code is organized as follows:

- **`components/`**: Reusable React components (Presentation Layer).
  - **`charts/`**: D3.js based visualization components (e.g., BubbleChart, StackedAreaChart).
  - **`controls/`**: UI elements for user interaction (Play, Slider).
  - **`globe/`**: Components related to the 3D globe visualization.
  - **`layout/`**: Structural components like Header and Footer.
  - **`overlay/`**: UI overlays for detailed information.
- **`context/`**: React Context definitions for global state (e.g., `LanguageContext`).
- **`hooks/`**: Custom React hooks for application logic (Application Layer).
  - **`useData.js`**: Fetches, parses, and manages emissions data.
- **`services/`**: Domain services (Domain Layer).
  - **`countryService.js`**: Handles country name translations and mapping.
- **`utils/`**: Shared utility functions (e.g., security helpers).
- **`App.jsx`**: The main application component that orchestrates layout and state.
- **`main.jsx`**: The entry point.

### `public/`
Static assets served directly.
- **`data/`**: JSON manifest and CSV files with CO₂ emissions data.

### `scripts/`
Infrastructure scripts.
- **`update-data.js`**: Fetches the latest data from the Global Carbon Project (Infrastructure/Adapter).

### `verification/`
Quality assurance scripts.
- **`verify-integrity.js`**: Validates data consistency and environment setup.

## Data Flow
1.  **Initialization**: On load, `App.jsx` initializes.
2.  **Data Fetching**: The `useData` hook (Application Layer) requests the manifest and CSV files.
3.  **Infrastructure Access**: `d3.fetch` (Infrastructure) retrieves files from `public/data/`.
4.  **Parsing & Mapping**: Data is parsed and mapped to domain objects (Domain Layer).
5.  **State**: Processed data is stored in React state.
6.  **Rendering**: Components (Presentation Layer) receive data via props and render visualizations.

## Design Patterns

### Component Architecture
The application follows a component-based architecture:
- **Container Components**: Manage state and data fetching (e.g., `App.jsx`).
- **Presentational Components**: Purely render UI based on props (e.g., `GlobeLegend`).

### Clean Architecture Mapping
Although a frontend application, the structure aligns with Clean Architecture principles:

- **Presentation Layer (`src/components/`)**:
  - Responsible for UI rendering and user interaction.
  - Depends on Application Layer (Hooks) and Domain Layer (Services).

- **Application Layer (`src/hooks/`, `src/context/`)**:
  - Orchestrates application flow (e.g., data loading, language switching).
  - Contains use cases like "Load Emissions Data" (`useData`).

- **Domain Layer (`src/services/`, Types)**:
  - Encapsulates business rules and entities independent of UI.
  - Example: `countryService.js` defines how country codes map to names.

- **Infrastructure Layer (`scripts/`, `public/data/`, API calls)**:
  - External concerns: Data fetching, CSV storage, API adaptations.
  - The `update-data.js` script acts as an adapter to the Global Carbon Project's external API.

### State Management
- **Global**: `LanguageContext` for i18n preferences.
- **Local**: `useState` and `useReducer` for component-specific state (e.g., current year, selected country).
- **Data**: `useData` custom hook encapsulates data fetching state (loading, error, data).

## Extending the Application

### Adding New Visualizations
1.  **Create Component**: Add to `src/components/charts/`.
2.  **Integrate Data**: Use props to pass data from `App.jsx`.
3.  **Render**: Implement D3 or SVG logic.

### Adding New Data Sources
1.  **Update Infrastructure**: Modify `scripts/update-data.js` to fetch new data.
2.  **Update Domain**: Ensure `manifest.json` reflects the new file.
3.  **Update Application**: Modify `useData.js` to load the new resource.
