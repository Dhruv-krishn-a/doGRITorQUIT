# Architecture of the `packages/eslint-config` folder

The `packages/eslint-config` folder provides shared ESLint configurations for the project's monorepo. It ensures consistent code quality and styling across all applications and internal packages.

## File Descriptions

- **`base.js`**: The foundational ESLint configuration, including common rules for JavaScript and TypeScript.
- **`next.js`**: A specialized ESLint configuration for Next.js applications, building upon the base rules and incorporating Next.js-specific linting.
- **`react-internal.js`**: A configuration for React components used within internal packages (e.g., `@planner/ui`).
- **`package.json`**: Defines the `@planner/eslint-config` package and its dependencies.

## Interactions and Communication

- **Consumption**: All applications in the `apps/` directory and internal packages in the `packages/` directory extend these shared configurations in their own `.eslintrc` or `eslint.config.js` files.
- **Consistency**: Centralizing linting rules ensures that all code in the monorepo follows the same style and quality standards.
- **Maintainability**: Changes to the project's linting rules are made in one place and automatically applied across all environments.
