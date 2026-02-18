# Architecture of the `packages/config` folder

The `packages/config` folder serves as a centralized hub for shared project-wide configuration data, constants, and navigation structures.

## File Descriptions

- **`index.ts`**: The main entry point for the package, which re-exports shared configuration from other modules like `siteNav.ts`.
- **`siteNav.ts`**: Defines the project's standard navigation structure using TypeScript types (`NavItem`) and a constant (`siteNav`) that includes labels, paths, icons, and groups.
- **`package.json`**: Defines the internal package `@planner/config` (or similar).

## Interactions and Communication

- **Frontend Applications**: `apps/web` and `apps/cms` import the `siteNav` configuration to dynamically generate sidebars, headers, and dashboard menus.
- **Type Safety**: By exporting the `NavItem` type, it ensures that all applications handle navigation data consistently.
- **Consistency**: Centralizing navigation ensures that changes to a path or label are automatically reflected across all applications in the monorepo.
