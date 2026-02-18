# Architecture of the `apps/desktop` folder

The `apps/desktop` folder contains the project's desktop application, built using Tauri, Vite, and React. It provides a native desktop experience, allowing users to manage their productivity with features that leverage desktop platform capabilities.

## File and Directory Descriptions

- **`src/`**: Contains the React frontend logic for the desktop application, including components and application state.
- **`src-tauri/`**: The Rust-based backend for the desktop application, defining its core logic, capabilities, and native integrations.
- **`public/`**: Stores static assets such as SVG icons and other publicly accessible files.
- **`vite.config.ts`**: Vite-specific configuration for building and developing the desktop application's frontend.
- **`tauri.conf.json`**: (Located in `src-tauri/`) The main configuration file for Tauri, defining window settings, capabilities, and build parameters.
- **`Cargo.toml`**: (Located in `src-tauri/`) The Rust package manager's configuration for the desktop backend.
- **`package.json`**: Defines the desktop application's dependencies and build scripts.

## Interactions and Communication

- **Frontend-Backend Bridge**: Uses Tauri's `invoke` API to communicate between the React frontend and the Rust backend for native operations.
- **Internal Packages**: The desktop app imports shared packages such as `@planner/api` and `@planner/config` to ensure data and configuration consistency with other platforms.
- **Webview Architecture**: The desktop app's frontend is rendered in a secure webview provided by Tauri, allowing for a consistent UI experience with the web application.
- **Consistency**: Centralized configuration from `@planner/config` ensures that navigation and site structures are consistent with the web and mobile platforms.
