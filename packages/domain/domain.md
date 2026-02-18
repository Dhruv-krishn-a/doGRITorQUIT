# Architecture of the `packages/domain` folder

The `packages/domain` folder is the heart of the project's business logic. It contains modular services and utilities that define how the platform's features (tasks, plans, habits, billing, etc.) operate. This package is shared across all applications to ensure consistent logic and behavior.

## Modular Subdirectories

- **`ai/`**: Services for AI-powered feature generation, such as plan creation and task suggestions.
- **`analytics/`**: Logic for calculating user productivity metrics and generating data for dashboards.
- **`auth/`**: Authentication services and helpers that complement the low-level logic in `lib/auth.ts`.
- **`billing/`**: Manages entitlements (checking if a user has access to a feature) and payment processing.
- **`cms/`**: Logic for content management, including blog posts, changelogs, and dynamic features.
- **`dashboard/`**: Aggregates data from multiple domains (tasks, habits, plans) to provide a unified dashboard view.
- **`habits/`**: Services for managing and tracking recurring user habits.
- **`plans/`**: Core logic for project planning, including complex task relationships and progress tracking.
- **`study/`**: Specialized features for learning, including playlist management and video tracking (incorporating YouTube API integrations).
- **`tasks/`**: Standard task management logic (creation, updates, completion).

## File Descriptions

- **`index.ts`**: The main entry point that exports all domain services under named namespaces (e.g., `export * as plans from "./plans/service"`).
- **`package.json`**: Defines the `@planner/domain` package and its dependencies.

## Interactions and Communication

- **Frontend Applications**: `apps/web` and `apps/mobile` call these services directly (via server actions or API endpoints) to perform actions like creating a plan or checking billing status.
- **Cross-Domain Communication**: Services often call each other. For example, the `plans` service might call the `billing` service to check if a user has reached their plan limit.
- **Database Access**: All domain services depend on `packages/db` to persist and retrieve data.
- **Consistency**: Centralizing this logic prevents code duplication and ensures that business rules (like how XP is calculated) are applied identically across the platform.
