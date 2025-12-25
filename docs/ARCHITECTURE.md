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

- **`components/`**: Reusable React components.
  - **`charts/`**: D3.js based visualization components (e.g., BubbleChart, StackedAreaChart).
  - **`controls/`**: UI elements for user interaction (Play button, Slider).
  - **`globe/`**: Components related to the 3D globe visualization.
  - **`layout/`**: Structural components like Header and Footer.
  - **`overlay/`**: UI overlays for detailed information.
- **`context/`**: React Context definitions, primarily for state management that needs to be accessed globally (e.g., LanguageContext).
- **`hooks/`**: Custom React hooks.
  - **`useData.js`**: A critical hook for fetching, parsing, and managing the emissions data.
- **`services/`**: Infrastructure-agnostic logic.
  - **`countryService.js`**: Handles country name translations and mapping.
- **`utils/`**: Shared utility functions (e.g., security helpers).
- **`App.jsx`**: The main application component that orchestrates the layout and state.
- **`main.jsx`**: The entry point that mounts the React application.

### `public/`
Static assets that are served directly.
- **`data/`**: Contains the CSV files with CO₂ emissions data. These are fetched by the application at runtime.

### `scripts/`
Node.js scripts for maintenance tasks.
- **`update-data.js`**: Fetches the latest data from the Global Carbon Project and updates the CSV files in `public/data/`.

## Data Flow
1.  **Initialization**: On load, `App.jsx` initializes.
2.  **Data Fetching**: The `useData` hook is triggered. It reads `public/data/manifest.json` to resolve filenames and then fetches CSV files using `d3-fetch` (wrapped in a safe fetcher).
3.  **Parsing**: Data is parsed and transformed into a usable format (likely an array of objects).
4.  **State**: The parsed data is stored in the React state.
5.  **Rendering**: Components (Charts, Globe) receive data via props and render the visualizations.
6.  **Updates**: When the user interacts (e.g., moves the time slider), the state updates, triggering re-renders of the visualizations to show data for the selected year.

## Design Patterns

### Component Architecture
The application follows a component-based architecture where each UI element is a self-contained unit.
- **Container/Presenter**: Some components act as containers (fetching data/state) while others are purely presentational.

### Clean Architecture Mapping
While this is a frontend-only application, the structure loosely maps to Clean Architecture principles:
- **Domain Layer**: Implicitly defined by the data structures (emissions data) and types. `src/services/` contains domain-specific logic like country translation.
- **Application Layer**: `src/hooks/` and `src/context/` manage the application state and business logic (e.g., filtering data by year).
- **Infrastructure Layer**: `d3.csv` and `fetch` APIs act as the infrastructure for data retrieval. `scripts/update-data.js` handles external data source integration and manifest generation.
- **Presentation Layer**: React components (`src/components/`) handle the UI and user interaction.

### Custom Hooks
Logic for data fetching and state management is encapsulated in hooks (`useData`) to separate concerns and keep components clean.

### Context API
Global state (like Language) is shared using React Context to avoid prop drilling.
