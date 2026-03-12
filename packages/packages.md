# Architecture of the `packages/` folder

The `packages/` folder is the foundation of the project's monorepo architecture. It contains shared internal packages that centralize common code, configuration, and business logic. These packages are consumed by all applications in the `apps/` directory and by each other.

## Internal Package Descriptions

- **`api/`**: Centralizes shared API schemas (Zod) and Supabase client initialization to ensure consistent data validation across platforms.
- **`config/`**: Stores project-wide configuration data, constants, and shared navigation structures (e.g., `siteNav`).
- **`db/`**: Manages the database schema (Prisma), client instantiation, migrations, and initial seeding.
- **`domain/`**: Houses the core business logic of the entire system, organized into modular services (tasks, plans, billing, AI, etc.).
- **`eslint-config/`**: Provides shared ESLint configurations for the project's applications and internal packages.
- **`typescript-config/`**: Contains shared TypeScript configurations to maintain consistent build settings across the monorepo.
- **`ui/`**: A library of reusable UI components and styling (Tailwind CSS) for the project's frontend applications.
- **`habits-core/`**: Core logic and React contexts for the habit tracking and daily checklist features.
- **`habits-ui-web/`**: Web-specific UI components for habits, including the daily checklist interface.
- **`study-core/`**: Core logic for the study tracking, course management, and "Upgrade OS" features.
- **`study-ui-web/`**: Web-specific UI components for the study dashboard and track views.
- **`dashboard-core/`**: Shared logic for the main dashboard and analytics calculations.
- **`dashboard-ui-web/`**: Web-specific UI components for the main dashboard layout and widgets.

## Interactions and Communication

- **Consumption**: Applications in `apps/` (web, mobile, cms, desktop) import these packages using their internal names (e.g., `@planner/db`, `@planner/domain`).
- **Dependencies**: Packages often depend on each other. For example, `@planner/domain` depends on `@planner/db` for data access, and `@planner/api` is used by all frontend apps for input validation.
- **Consistency**: This modular approach ensures that shared logic (like billing checks or task schemas) is updated in one place and reflected throughout the entire system.
- **Scalability**: By separating concerns into distinct packages, the project can scale more easily, as each part of the system is isolated and independently maintainable.
