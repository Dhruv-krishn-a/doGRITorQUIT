# Architecture of the `apps/cms` folder

The `apps/cms` folder is the administrative Next.js application for the platform. It provides a Content Management System (CMS) interface for administrators to manage products, features, blog posts, and other system-level content.

## File and Directory Descriptions

- **`app/`**: Contains the Next.js App Router structure, including layout, components, and administrative pages.
- **`components/`**: Reusable administrative components, such as `AdminSidebar`, `AdminNav`, `ConfirmModal`, and `ClientActions`.
- **`lib/`**: CMS-specific utility logic, including authentication helpers and database interaction wrappers.
- **`middleware.ts`**: Handles route protection, ensuring only authenticated administrators can access CMS features.
- **`next.config.mjs`**: Next.js-specific configuration for the CMS application.
- **`package.json`**: Defines the CMS application's dependencies and build scripts.
- **`tsconfig.json`**: TypeScript configuration for the CMS application.

## Interactions and Communication

- **Internal Packages**: The CMS app imports shared packages such as `@planner/db` for database management and `@planner/config` for system-wide settings.
- **Authentication**: Uses `lib/auth.ts` and Supabase for secure administrator logins and session management.
- **Content Management**: Interacts with the shared `packages/db` package to perform CRUD operations on products, features, and CMS-specific content types (e.g., blog posts).
- **Consistency**: Centralized navigation and common UI components (where possible) from `@planner/ui` ensure a consistent experience for administrators.
