# Architecture of the `apps/web` folder

The `apps/web` folder is the primary Next.js application for the platform. It provides a web interface for users to manage their tasks, plans, habits, and overall productivity, while leveraging the shared core logic from the `packages/` directory.

## File and Directory Descriptions

- **`app/`**: Contains the Next.js App Router structure, including layouts, pages, and server components.
- **`features/`**: Modular logic and components for specific application features (e.g., tasks, plans, habits).
- **`shared/`**: Common UI components and utilities that are specific to the web application.
- **`lib/`**: Integration logic for connecting the web app with shared services (e.g., Supabase authentication).
- **`config/`**: Web-specific configuration, constants, and settings.
- **`middleware.ts`**: Next.js middleware for handling authentication redirects and route protection.
- **`next.config.js`**: Next.js-specific configuration for building and running the application.
- **`package.json`**: Defines the web application's dependencies and build scripts.
- **`tailwind.config.ts`**: Web-specific Tailwind CSS configuration for styling.

## Interactions and Communication

- **Internal Packages**: The web app imports shared packages such as `@planner/db` for data access, `@planner/domain` for business logic, and `@planner/api` for data validation.
- **Authentication**: Uses `lib/auth.ts` and Supabase SSR to manage user sessions and protect routes.
- **Database Access**: Direct database interaction via Prisma is typically handled in server components or server actions using the shared `@planner/db` package.
- **Consistency**: By using the `siteNav` configuration from `@planner/config`, the web application's navigation is always in sync with other applications in the monorepo.
