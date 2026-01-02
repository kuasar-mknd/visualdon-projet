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
- **`services/`**: logic for external or internal services.
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

### `verification/`
Contains scripts and artifacts for frontend verification.
- **`verify_load.cjs`**: A Playwright (Node.js) script used to verify that the application loads correctly and renders the main chart components. This serves as a lightweight smoke test for the frontend.

## Data Flow
1.  **Initialization**: On load, `App.jsx` initializes.
2.  **Data Fetching**: The `useData` hook is triggered. It fetches CSV files from `public/data/` using `d3-fetch` (or similar).
3.  **Parsing**: Data is parsed and transformed into a usable format (likely an array of objects).
4.  **State**: The parsed data is stored in the React state.
5.  **Rendering**: Components (Charts, Globe) receive data via props and render the visualizations.
6.  **Updates**: When the user interacts (e.g., moves the time slider), the state updates, triggering re-renders of the visualizations to show data for the selected year.

## Design Patterns

### Component Architecture
The application follows a component-based architecture where each UI element is a self-contained unit.
- **Container/Presenter**: Some components act as containers (fetching data/state) while others are purely presentational.

### Clean Architecture Mapping
This project adapts Clean Architecture principles to a frontend context to separate concerns and improve maintainability:

1.  **Domain Layer (Entities)**
    *   **Concept**: Business objects and rules independent of the UI.
    *   **Implementation**: Implicitly defined by the data schemas (Emissions, Country) and logic in `src/services/countryService.js` (e.g., country code validation, name translation).

2.  **Application Layer (Use Cases)**
    *   **Concept**: Orchestration of data flow and business rules.
    *   **Implementation**: `src/hooks/` (e.g., `useData`) and `src/context/` (e.g., `LanguageContext`). These modules manage *what* happens (fetching data, toggling language, filtering by year) without worrying about *how* it's rendered.

3.  **Interface Adapters (Presentation)**
    *   **Concept**: Converting data for the UI and handling user input.
    *   **Implementation**: React Components in `src/components/`. They receive data via props (from the Application Layer) and render it. Events (clicks, sliders) are passed back up to the Application Layer.

4.  **Infrastructure Layer**
    *   **Concept**: External tools, frameworks, and data sources.
    *   **Implementation**:
        *   **Data Access**: `d3.csv`, `fetch` API.
        *   **Build/Env**: Vite, `.env` configuration.
        *   **External Scripts**: `scripts/update-data.js` acts as an infrastructure tool to bridge the external data source (Global Carbon Project) to our internal static API.

### Custom Hooks
Logic for data fetching and state management is encapsulated in hooks (`useData`) to separate concerns and keep components clean.

### Context API
Global state (like Language) is shared using React Context to avoid prop drilling.

## Extending the Application

### Adding New Visualizations
To add a new chart type (e.g., `LineChart`):
1.  **Create Component**: Add `src/components/charts/LineChart.jsx`.
2.  **Data Logic**: Use the `useData` hook to retrieve emissions data.
3.  **D3 Integration**: Implement D3 logic within a `useEffect` hook (or `useLayoutEffect` for measurements).
4.  **Register**: Import and add the component to `App.jsx` or a specific container.

### Adding New Data Sources
To integrate a new dataset:
1.  **Update Script**: Modify `scripts/update-data.js` to fetch and clean the new data.
2.  **Manifest**: Ensure the new file is added to `manifest.json`.
3.  **Hook**: Update `src/hooks/useData.js` to fetch the new file key from the manifest.
