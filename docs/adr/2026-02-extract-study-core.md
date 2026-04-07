# ADR: Extract Study Core to Shared Package

## Status
Accepted

## Context
The Study feature (Upgrade OS) is currently implemented entirely within `apps/web`.
We are building a Desktop (Tauri) and eventually a Mobile (React Native) application that need to use the same Study logic (session management, XP calculation, planning).
Duplicating this logic across apps will lead to divergence and maintenance overhead.

## Decision
We will extract the platform-agnostic business logic and data orchestration into a new package: `@gritorquit/study-core`.
We will also extract presentational UI components into `@gritorquit/study-ui-web`.

### Architecture
- **@gritorquit/study-core**: Contains hooks, API clients, and pure logic. No UI dependencies (React is allowed for hooks).
- **@gritorquit/study-ui-web**: Contains presentational components. Reusable by Desktop.
- **apps/web**: Consumes `study-core` and `study-ui-web`. Handles routing and server-side rendering.
- **apps/desktop**: Consumes `study-core` and `study-ui-web`. Handles routing and native integration.

## Consequences
- **Positive**: Shared logic ensures consistency across platforms.
- **Negative**: Adds indirection. Changes to core logic require updating and publishing the package (in a monorepo context, just rebuilding).
- **Risk**: Regression in the Web app during extraction. We will mitigate this with incremental extraction and testing.
