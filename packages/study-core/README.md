# @gritorquit/study-core

Shared client orchestration layer for the Study (Upgrade OS) feature.

## Purpose
This package contains platform-agnostic business logic, React hooks, and API clients for the Study feature. It is shared between:
- `apps/web` (Next.js)
- `apps/desktop` (Tauri)
- `apps/mobile` (React Native)

## Key Exports
- **Hooks**: `useStudyDashboard`, `useTrack`, etc.
- **APIs**: `studyApi` (thin wrapper around `fetch`).
- **Types**: Shared interfaces for Tracks, Units, and Dashboard data.

## Usage
```tsx
import { useStudyDashboard } from '@gritorquit/study-core';

function MyDashboard() {
  const { tracks, dashboard, loading } = useStudyDashboard();
  // ...
}
```
