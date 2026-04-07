# Architecture of the `packages/ui` folder

The `packages/ui` folder contains a reusable React component library and shared styling (Tailwind CSS) for the project's frontend applications. It ensures a consistent design and user experience across the web, desktop, and other UI-based interfaces.

## File and Directory Descriptions

- **`src/`**: Contains the React component source code, including common elements like buttons, inputs, modals, and complex UI patterns.
- **`package.json`**: Defines the `@gritorquit/ui` package and its peer dependencies (e.g., `react`, `react-dom`, `tailwindcss`).
- **`tsconfig.json`**: TypeScript configuration for the UI library.
- **`eslint.config.mjs`**: ESLint configuration specifically for the UI package to maintain code quality.

## Interactions and Communication

- **Consumption**: The web application (`apps/web`) and CMS application (`apps/cms`) import these components to build their interfaces.
- **Consistency**: Centralizing UI components ensures that changes to a component's design or behavior are automatically reflected across all consuming applications.
- **Styling**: Leverages Tailwind CSS for efficient and flexible styling, allowing applications to customize their appearance while maintaining a shared design system.
- **Modularity**: Components are designed to be independent and reusable, promoting a clean and maintainable codebase.
