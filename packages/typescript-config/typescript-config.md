# Architecture of the `packages/typescript-config` folder

The `packages/typescript-config` folder provides shared TypeScript configurations for the project's monorepo. It ensures consistent build settings and type-checking rules across all applications and internal packages.

## File Descriptions

- **`base.json`**: The foundational TypeScript configuration, defining common compiler options and build settings.
- **`nextjs.json`**: A specialized TypeScript configuration for Next.js applications, building upon the base configuration and incorporating Next.js-specific compiler options.
- **`react-library.json`**: A configuration for React components used within internal packages (e.g., `@planner/ui`).
- **`package.json`**: Defines the `@planner/typescript-config` package and its dependencies.

## Interactions and Communication

- **Consumption**: All applications in the `apps/` directory and internal packages in the `packages/` directory extend these shared configurations in their own `tsconfig.json` files.
- **Consistency**: Centralizing TypeScript settings ensures that all code in the monorepo is compiled and checked according to the same standards.
- **Maintainability**: Changes to the project's TypeScript configuration are made in one place and automatically applied across all environments.
