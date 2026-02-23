# Changes Document

## Overview
This document outlines the changes made to the project structure, dependencies, and configuration to improve consistency, stability, and build reliability within the monorepo.

## 1. Dependency Standardization
- **Workspace Protocol:** Updated all internal dependencies in `apps/*` and `packages/*` to use `workspace:*`. This ensures that local packages are always used during development and builds, preventing accidental fetches from npm registry and ensuring version consistency.
  - Affected files: `apps/web/package.json`, `apps/desktop/package.json`, `packages/study-ui-web/package.json`.
- **"latest" Version Replacement:** Replaced usage of `sonner: "latest"` with specific version `^2.0.7` in `@planner/study-core` and `@planner/study-ui-web`. This prevents potential breakage from breaking changes in upstream libraries.

## 2. Package Configuration
- **Build Scripts:** Added `"build": "tsc --noEmit"` scripts to multiple packages (`api`, `config`, `domain`, `study-core`, `study-ui-web`, `ui`).
  - **Reason:** Even though these packages are consumed as source (TypeScript) by the applications, adding a build script that runs type checking ensures they are integrated into the `turbo build` pipeline. This catches type errors in shared packages before they propagate to applications.

## 3. Naming Conventions
- **App Renaming:** Renamed `apps-cms` to `cms` in `apps/cms/package.json`.
  - **Reason:** To match the directory name and align with the naming convention of other apps (`web`, `desktop`, `mobile`).

## 4. Pipeline & CI/CD (Pending)
- Identified issues with the CI/CD pipeline (`.github/workflows/ci.yml`), including missing environment variables required for `turbo build` and potentially outdated action versions.
- **Action:** These issues have been noted but defered for later implementation as per instructions.

## Summary of Modified Files
- `apps/cms/package.json`
- `apps/desktop/package.json`
- `apps/web/package.json`
- `packages/api/package.json`
- `packages/config/package.json`
- `packages/domain/package.json`
- `packages/study-core/package.json`
- `packages/study-ui-web/package.json`
- `packages/ui/package.json`

## 5. Configuration & Quality Improvements (Added Phase)
- **TypeScript Configuration:**
  - Updated `packages/study-core/tsconfig.json` to extend `@repo/typescript-config/base.json` instead of being a standalone config. This ensures consistent compiler options across the workspace.
- **Dependency Alignment:**
  - Aligned `react` and `react-dom` versions in `apps/desktop` and `apps/cms` to `^19.2.0` (matching `apps/web`) to reduce duplicate installations and potential version conflicts.
- **Package Metadata:**
  - Added missing `"types": "index.ts"` to `packages/api/package.json`.
  - Added `"exports"` fields to `@planner/study-core` and `@planner/study-ui-web` `package.json` files. This ensures robust module resolution for modern bundlers and Node.js.

## Updated Summary of Modified Files
- `apps/cms/package.json`
- `apps/desktop/package.json`
- `apps/web/package.json`
- `packages/api/package.json`
- `packages/config/package.json`
- `packages/domain/package.json`
- `packages/study-core/package.json`
- `packages/study-core/tsconfig.json`
- `packages/study-ui-web/package.json`
- `packages/ui/package.json`
