# Architecture of the `lib/` folder

The `lib/` folder contains shared utility modules for authentication and database interaction. These modules are intended to be used across different applications in the `apps/` directory and shared packages in the `packages/` directory.

## File Descriptions

- **`auth.ts`**: Handles authentication logic using Supabase SSR (`@supabase/ssr`) and Next.js. It provides a `getServerUser` function that retrieves the user session and profile from Prisma, with caching support for better performance.
- **`prisma.ts`**: Manages the Prisma Client instance. It uses a singleton pattern for development environments to prevent exhaustion of database connections during hot reloads.

## Interactions and Communication

- `auth.ts` imports and uses the `prisma` client from `prisma.ts` to fetch user profiles after session validation with Supabase.
- These files are imported by other parts of the monorepo (e.g., `apps/cms`, `apps/web`) to manage database access and user identity consistently across the platform.
