# Architecture of the `packages/api` folder

The `packages/api` folder provides a shared layer for API-related utilities, specifically focusing on Supabase client initialization and shared data validation schemas. This package ensures consistent validation logic and client configuration across the web, mobile, and other internal services.

## File Descriptions

- **`index.ts`**: The main entry point for the package. It exports:
  - `createSupabaseClient`: A helper function to initialize a standard Supabase client.
  - **Shared Zod Schemas**: Schemas for common data structures like `SignUpSchema`, `LoginSchema`, `CreateTaskSchema`, and `UpdateTaskSchema`.
  - **Inferred Types**: TypeScript types derived from the Zod schemas (e.g., `SignUpInput`, `CreateTaskInput`) to ensure type safety throughout the codebase.
- **`package.json`**: Defines dependencies (`zod`, `@supabase/supabase-js`) and exports the package under the `@gritorquit/api` name (or similar).

## Interactions and Communication

- **Applications**: `apps/web` and `apps/mobile` import this package to validate form inputs and API responses, ensuring that data structures are consistent across platforms.
- **Validation**: By centralizing Zod schemas, the system guarantees that a "Task" created in the web app follows the same rules as one created in the mobile app.
- **Supabase**: Provides a standard way to interact with Supabase authentication and storage across different environments.
