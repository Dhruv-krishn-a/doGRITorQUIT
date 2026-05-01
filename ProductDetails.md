# ProductDetails.md

## 1. Project Overview
**doGRITorQUIT** (internal name `gritorquit`) is a comprehensive health, habit, study tracking, and project execution platform. It is designed to be a holistic "Execution OS" for individuals who want to manage their professional development (software projects), personal learning ("Upgrade OS"), and daily habits in a single, integrated environment.

The project solves the problem of fragmented tracking by combining:
- **Software Development Lifecycle (SDLC) Management**: Moving from PRD to technical execution with AI assistance.
- **Deep Learning (Upgrade OS)**: Structured study tracks, YouTube integration, and cognitive load management.
- **Habit and Health Tracking**: Daily routines, streaks, and reflections.
- **Content Management**: A built-in CMS for managing courses, blogs, and product features.

It is targeted at "power users," developers, and students who require a more rigorous and technically-integrated approach to productivity than standard habit trackers offer.

## 2. Core Features
- **Project Journey (Execution OS)**: 
    - AI-powered generation of PRDs, User Flows, and System Flows.
    - **Blueprint Versioning**: Immutable snapshots of project requirements to prevent "scope creep."
    - **Drift Detection**: Alerts when the implementation roadmap deviates from the sealed requirements.
    - **SDLC Mapping**: Tasks are categorized into phases (Design, Dev, Test, etc.) based on chosen methodologies (Agile, Waterfall, etc.).
- **Upgrade OS (Study Feature)**:
    - **Track Management**: Organizes learning into Playlists, Courses, Projects, or Skills.
    - **Focus Tube**: Integrated YouTube player with note-taking (BlockNote/Tiptap) and resource tracking.
    - **Spaced Repetition**: Automatic revision scheduling for study units.
    - **Cognitive Load Calculation**: Algorithms to track energy levels, fatigue, and burnout risk.
- **Habit & Task Tracking**:
    - Recurring habits with streak tracking.
    - Flexible task management with priority levels and plan-based grouping.
- **Multi-Platform Support**: Web, Desktop (Tauri), and Mobile (Expo/React Native).
- **Enterprise Capabilities**: 
    - Full-featured CMS for content and product management.
    - Billing system with Razorpay integration and granular feature entitlements.

## 3. How It Works
### Project Flow
1. **Requirements Phase**: User writes a PRD (often AI-assisted).
2. **Design Phase**: System generates/user defines User and System flows.
3. **Sealing**: The requirements are "sealed" as a `BlueprintVersion`.
4. **Planning**: AI generates a hierarchical "Master Plan" of Epics and Technical Tasks.
5. **Execution**: User works through SDLC phases. "Stage Gates" prevent moving to the next phase (e.g., Dev) until current phase tasks (e.g., Design) are complete.
6. **Iteration**: If requirements change, "Drift" is detected, and a new versioned iteration is started.

### Study Flow
1. **Track Creation**: User imports a YouTube playlist or creates a manual course track.
2. **Session**: User watches videos/reads units in a focused environment, taking notes that are tied to specific timestamps or units.
3. **Revision**: Spaced repetition schedules tasks for units based on user confidence scores.
4. **Reflection**: Weekly reflections track mood, stress, and energy levels to adjust cognitive load suggestions.

## 4. Architecture
### High-Level System Architecture
The project uses a **Turborepo monorepo** structure to share logic and UI components across three distinct frontend platforms and a backend API layer.

### Major Modules/Components
- **`apps/web`**: The primary interface, built with Next.js 15+ (React 19). Handles the complex Project and Study dashboards.
- **`apps/desktop`**: A Tauri-wrapped Vite/React application for a focused, distraction-free native experience.
- **`apps/mobile`**: An Expo-based React Native app for on-the-go habit tracking and study reflection.
- **`apps/cms`**: A dedicated Next.js app for administrative content and product management.
- **`packages/domain`**: The "Heart" of the system. Contains all platform-agnostic business logic (AI routing, billing, task management).
- **`packages/db`**: Centralized Prisma schema and database client.
- **`packages/study-core` & `study-ui-web`**: Specialized shared packages for the Upgrade OS feature.

### Folder Structure Overview
- `apps/`: Web, Desktop, Mobile, and CMS applications.
- `packages/`:
    - `domain/`: Business logic services.
    - `db/`: Prisma schema and migrations.
    - `ui/`: Shared React component library.
    - `study-core/`: Logic for study tracking.
    - `study-ui-web/`: Presentational components for study.
- `scripts/`: Maintenance scripts (e.g., data backfilling).

### Data Flow
- **Web/Desktop**: Interact with the database via Next.js Server Actions or API routes defined in `apps/web` or `packages/api`.
- **Mobile**: Uses WatermelonDB for offline-first performance, syncing with the main database.

## 5. Technologies Used
- **Languages**: TypeScript (Strict mode).
- **Frontend**: React 19, Next.js 15, React Native (Expo), Tailwind CSS v4 (Web/Desktop), NativeWind (Mobile).
- **Backend**: Next.js API Routes, Prisma ORM.
- **Database**: PostgreSQL (Supabase), WatermelonDB (Mobile local).
- **AI**: Groq (Llama 3.1 8B for structure), OpenRouter (Mistral Small 3 for logic), OpenAI.
- **Desktop**: Tauri v2.
- **Styling/UI**: Framer Motion, GSAP, Lucide Icons.
- **Payments**: Razorpay.
- **Auth**: NextAuth v5 (Web), Supabase Auth.

## 6. Strengths
- **Cohesive Ecosystem**: Seamlessly transitions from high-level "why" (PRD) to low-level "how" (code/tasks).
- **Rigorous Engineering Standards**: Use of versioned blueprints and drift detection mirrors real-world professional development.
- **Optimized for Learning**: Spaced repetition and cognitive load tracking are scientifically grounded.
- **Shared Logic**: The `@gritorquit/domain` package ensures that complex rules (like billing or AI routing) are identical across all platforms.
- **Modern Tech Stack**: Uses the latest versions of React, Next.js, and Tailwind, benefiting from performance improvements like React Server Components.

## 7. Weaknesses / Gaps
- **Testing Coverage**: Automated tests are sparse and concentrated in only a few packages (`notes-ui-web`).
- **Complexity**: The sheer number of models and domains may be overwhelming for new developers.
- **Mobile Sync**: The synchronization between WatermelonDB and the main PostgreSQL DB via Prisma is a complex area with potential for edge-case conflicts.
- **Generic Root README**: The root `README.md` is a generic Turborepo starter and does not reflect the project's complexity.

## 8. Improvements Needed
- **Testing**: Implement a comprehensive integration testing suite for the `domain` package and E2E tests for the Project Journey flow.
- **Documentation**: Update the root `README.md` and provide more detailed API documentation for the domain services.
- **Onboarding**: Simplify the initial setup for developers, particularly around the multiple API keys required (Groq, OpenRouter, Supabase, Razorpay).
- **Performance**: Monitor the performance of the "Blueprint Drift" detection as JSON snapshots grow in size.

## 9. Functionality Details
### Important Modules
- **`AIPlanService` (`packages/domain/ai`)**: A multi-client router that uses Groq for fast structural generation and Mistral for detailed technical logic.
- **`Entitlements` (`packages/domain/billing`)**: A granular permission system that toggles features based on product keys and user tiers.
- **`StudyService`**: Manages the complex state transitions of YouTube videos, tracking `progressSec` vs `timeSpentSec`.

### Notable Algorithms
- **Cognitive Load Calculation**: 
    - `Load = (Effort * BaseWeight) + ModalityPenalty + ComplexityPenalty + RetentionPenalty`.
    - Adjusts suggested "Modes" (Light, Normal, Focus) based on burnout risk.

## 10. System Design Notes
- **Pattern**: Domain-Driven Design (DDD) influences the `packages/domain` structure, where each subdomain is isolated.
- **State Management**: Uses TanStack Query (React Query) for server state on Web/Desktop and Observables (WatermelonDB) on Mobile.
- **Security**: Strict stage gates for project execution and centralized permission checks in the billing service.

## 11. Known Issues / Risks
- **Data Integrity**: The backfill script (`scripts/backfill-study-to-tracks.ts`) is a high-risk operation for existing users.
- **AI Hallucinations**: Reliance on AI for generating technical tasks could lead to invalid implementation suggestions.
- **Third-Party Dependency**: High dependency on YouTube's API and multiple AI providers.

## 12. Testing and Quality
- **Current Tests**: Native Node.js test runner is used for `notes-ui-web`. Jest is used for `mobile`.
- **Validation**: Project uses ESLint and Prettier for code style consistency. Prisma's type safety is used extensively to prevent runtime DB errors.

## 13. Final Summary
doGRITorQUIT is an ambitious, high-quality productivity suite that bridges the gap between personal growth and professional project management. Its architecture is robust and follows modern best practices for monorepo development. While testing coverage needs improvement, the project stands out for its unique features like SDLC-driven execution and cognitive-load-aware learning tracks. The next steps should focus on stabilizing the mobile sync logic and expanding the test suite to match the complexity of the domain logic.
