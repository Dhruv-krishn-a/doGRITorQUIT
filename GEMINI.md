# GEMINI.md - Project Context & Instructions

## Project Overview
**doGRITorQUIT** (internal name `gritorquit`) is a comprehensive health, habit, and study tracking platform. It is structured as a Turborepo monorepo, supporting Web, Desktop, and Mobile applications with shared business logic and UI components.

### Core Architecture
- **Web App (`apps/web`)**: Next.js 16 (React 19), NextAuth v5, Supabase, Prisma, Tailwind CSS 4.
- **Desktop App (`apps/desktop`)**: Tauri v2, Vite, React 19, Tailwind CSS 4.
- **Mobile App (`apps/mobile`)**: Expo/React Native, NativeWind (Tailwind 3), WatermelonDB.
- **CMS (`apps/cms`)**: Next.js app for content management.
- **Shared Packages (`packages/`)**:
    - `@gritorquit/domain`: Core business logic, types, and subdomains (auth, habits, study, tasks, etc.).
    - `@gritorquit/db`: Prisma-based database layer.
    - `@gritorquit/study-core`: Shared logic for the "Upgrade OS" (Study) feature.
    - `@gritorquit/study-ui-web`: Shared presentational UI for Study, used by Web and Desktop.
    - `@repo/ui`: Base shared React component library.
    - `@repo/eslint-config` & `@repo/typescript-config`: Shared configurations.

### Key Technologies
- **Frontend**: React 19, React Native, Tailwind CSS (v4 for Web/Desktop, v3 for Mobile), Framer Motion, GSAP.
- **Backend/Data**: Next.js API Routes, Prisma ORM, Supabase (Auth/Storage), PostgreSQL.
- **Mobile DB**: WatermelonDB (optimized for offline-first React Native).
- **AI Integration**: Google Gemini (`@google/generative-ai`), OpenAI, Groq.
- **Payments**: Razorpay.

---

## Building and Running

### Prerequisites
- Node.js >= 18
- `pnpm` (Package Manager)
- `turbo` (Global installation recommended: `npm install -g turbo`)

### Key Commands
- **Install Dependencies**: `pnpm install`
- **Development**: `pnpm dev` (runs all apps)
- **Build All**: `pnpm build`
- **Lint All**: `pnpm lint`
- **Type Check**: `pnpm type-check`
- **Database Generation**: `pnpm db:generate` (runs `prisma generate` in `@gritorquit/db`)
- **Format Code**: `pnpm format`
- **Testing**: `pnpm test` (Runs Node.js native tests for `@gritorquit/notes-ui-web`)

### App-Specific Commands
- **Web**: `pnpm build --filter=web` or `pnpm dev --filter=web`
- **Desktop**: `pnpm dev --filter=desktop` (Tauri dev mode)
- **Mobile**: `pnpm android` or `pnpm ios` (via Expo)

---

## Development Conventions

### Monorepo Workflow
- Always use `pnpm` for package management.
- Add new shared logic to `packages/domain` or a specialized package in `packages/`.
- Use Turborepo filters (`--filter`) to run tasks for specific apps or packages.

### Coding Standards
- **TypeScript**: Mandatory for all new code. Use shared `tsconfig` from `@repo/typescript-config`.
- **Styling**: Prefer Tailwind CSS. Web and Desktop use Tailwind 4; Mobile uses Tailwind 3 via NativeWind.
- **State Management**: 
    - Web/Desktop: React Query (TanStack Query) and local React state.
    - Mobile: WatermelonDB with observables for reactive data.
- **Architecture**: Follow the pattern of extracting platform-agnostic logic into shared packages (e.g., `study-core`) and UI components into shared UI packages where applicable.

### Environment Variables
Key variables required for the full stack (refer to `turbo.json` for task-specific requirements):
- `DATABASE_URL` (PostgreSQL)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Testing
- Existing tests use the native Node.js test runner (`node --test`).
- Mobile tests use Jest (`pnpm exec jest` in `apps/mobile`).
- When adding new features, add corresponding tests in the relevant package or app.
