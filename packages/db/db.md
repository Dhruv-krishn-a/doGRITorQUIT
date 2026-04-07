# Architecture of the `packages/db` folder

The `packages/db` folder is the primary data access layer for the entire monorepo. It contains the Prisma schema, client initialization logic, and seeding scripts to populate the database with essential system data and default configuration tiers.

## File Descriptions

- **`index.ts`**: Standardizes the Prisma Client initialization. It uses a global singleton pattern to prevent connection exhaustion during development (hot reloads) and exports the `prisma` instance for use in other packages and applications.
- **`seed.ts`**: A comprehensive seeding script that populates the database with:
  - **System Features**: Access gates (e.g., `ACCESS_TASKS`, `ACCESS_ANALYTICS`) and numeric limits (e.g., `AI_GEN_LIMIT`).
  - **Product Tiers**: Configures "Free" and "Pro" tiers with specific feature sets and pricing.
  - **CMS Content Types**: Defines schemas for `blog_post` and `changelog` content.
- **`prisma/schema.prisma`**: (Located in the `prisma/` subdirectory) Defines the database schema, including models for Users, Plans, Tasks, Habits, Products, Features, and CMS content.
- **`test-prisma.ts`**: A utility script for testing database connectivity and basic operations.
- **`package.json`**: Exports the `@gritorquit/db` package and defines scripts for migrations and seeding.

## Interactions and Communication

- **Applications**: `apps/web`, `apps/cms`, and `apps/mobile` (via API) depend on this package for all database operations.
- **Migrations**: Developers use this package to run `prisma migrate` commands to update the database schema across all environments.
- **Seeding**: The `seed.ts` script is typically run during initial setup or deployment to ensure the system has the necessary metadata to function.
- **Type Safety**: Prisma automatically generates TypeScript types based on the schema, providing end-to-end type safety from the database to the frontend.
