# Architecture of the `apps/` folder

The `apps/` folder contains the primary applications of the platform, including the web, mobile, desktop, and administrative (CMS) interfaces. Each application provides a different platform-specific experience while sharing the core business logic and data structures from the `packages/` directory.

## Application Descriptions

- **`web/`**: The primary Next.js application for users to manage their productivity on the web.
- **`mobile/`**: A React Native Expo application for on-the-go productivity management.
- **`desktop/`**: A Tauri-based application providing a native desktop experience with Rust-powered backend integrations.
- **`cms/`**: An administrative Next.js application for managing products, features, and platform content.

## Interactions and Communication

- **Internal Packages**: All applications in the `apps/` directory import shared packages such as `@gritorquit/db` for database access, `@gritorquit/domain` for business logic, and `@gritorquit/api` for input validation.
- **Consistency**: By using the shared configuration from `@gritorquit/config`, all applications maintain a consistent navigation structure and system-wide settings.
- **Data Sharing**: All applications interact with the same backend database via the shared `@gritorquit/db` package (either directly or via an API), ensuring that user data is synchronized across all platforms.
- **Authentication**: Applications utilize a common authentication strategy, typically using Supabase SSR or a shared authentication context to maintain user sessions securely.
- **Platform-Specific Features**: While sharing core logic, each application is optimized for its platform (e.g., mobile-specific UI components, desktop-specific native APIs, and web-specific server actions).
