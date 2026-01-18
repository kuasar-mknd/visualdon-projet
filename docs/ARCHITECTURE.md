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
- **`context/`**: React Context definitions (Application Layer).
- **`hooks/`**: Custom React hooks (Application Layer).
  - **`useData.js`**: Manages data fetching logic.
- **`services/`**: Domain logic (Domain Layer).
  - **`countryService.js`**: Handles country name translations and mapping.
- **`utils/`**: Shared utility functions (Infrastructure Layer).
- **`App.jsx`**: Main orchestrator.
- **`main.jsx`**: Entry point.

### `public/`
Static assets served directly.
- **`data/`**: JSON manifests and CSV datasets.

### `scripts/`
Node.js maintenance scripts.
- **`update-data.js`**: Fetches external data (Infrastructure Adapter).

## Clean Architecture Mapping

Although this is a frontend application, it follows Clean Architecture principles to separate concerns:

1.  **Domain Layer** (`src/services/`):
    - Contains business logic independent of the UI, such as country code normalization and translation rules.
    - Entities: Country, EmissionData.

2.  **Application Layer** (`src/hooks/`, `src/context/`):
    - Orchestrates data flow and state management.
    - Use Cases: "Fetch Global Emissions", "Filter by Year", "Toggle Language".
    - `useData` acts as an interactor that retrieves data from the repository (Infrastructure) and provides it to the View.

3.  **Infrastructure Layer** (`src/utils/`, `scripts/`, `fetch` API):
    - Handles external details like network requests, CSV parsing, and browser APIs.
    - `update-data.js` acts as an adapter to the Global Carbon Project data source.

4.  **Presentation Layer** (`src/components/`, `src/App.jsx`):
    - purely reactive UI components that display data from the Application layer.
    - Responsible for user interaction and rendering D3/Three.js visualizations.

## Extending the Application

### Adding New Endpoints (Visualizations)
To add a new use-case, such as a "Per Capita Ranking":

1.  **Domain**: Define any new business rules (e.g., threshold for "High Emitter") in `src/services/`.
2.  **Application**: Create a hook or update `useData` to prepare the specific data view.
3.  **Presentation**: Create a new component in `src/components/` to render the ranking.

### Adding Data Sources
To add a new dataset:
1.  **Infrastructure**: Update `scripts/update-data.js` to fetch and normalize the new CSV.
2.  **Application**: Update `src/hooks/useData.js` to load the new file defined in `manifest.json`.
