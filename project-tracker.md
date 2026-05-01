# Project Tracker - Delta-Aware SDLC Engine

## Overview
The Project Tracker has been transformed from a static task list into a professional, version-controlled **Execution OS**. It now follows a hierarchical, phase-driven approach to software development, allowing users to move from high-level requirements (PRD) to granular technical execution across both Web and Desktop platforms.

## Core Architecture

### 1. The "Git for Requirements" (Versioning)
We introduced a robust versioning layer for project blueprints.
- **Blueprint Snapshotting**: When a user "Seals" an archive (PRD, User Flow, or System Flow), the system creates an immutable `BlueprintVersion` record.
- **Drift Detection**: The UI compares the active "Sealed" version against the current draft. If changes are detected, it flags a **"Blueprint Drift"**, warning the user that their execution roadmap is out of sync with their requirements.
- **Agile Iterations**: Users can spawn new iterations (e.g., V1.1, V2.0) to handle new features added to the PRD later in the project lifecycle, preventing "task bloat" in the current run.

### 2. Hierarchical Execution Model
Tasks are no longer flat. They follow a strict engineering hierarchy:
- **Epics (Parent Features)**: Large, functional blocks derived directly from the PRD and flows (e.g., "User Authentication System").
- **Technical Tasks (Sub-tasks)**: Granular, actionable items nested under Epics (e.g., "Implement JWT Middleware").
- **SDLC Mapping**: Every sub-task is explicitly bound to a specific phase of the chosen methodology (e.g., DESIGN, DEV, TEST).

### 3. Delta-Aware AI Engine
The AI task generation logic was overhauled to be contextually aware:
- **Master Strategy Generation**: Instead of dumping generic tasks, the AI generates a complete **Master Plan** consisting of Epics and their nested tasks across the entire SDLC.
- **Phase-Specific Extraction**: In the Phase Dashboard, the AI can be triggered to generate highly technical, low-level tasks specifically for the *active* phase (e.g., extracting just the DB schema changes for the "Design" phase).
- **Technology Injection**: The AI injects specific implementation details (API routes, table names, pattern recommendations) into task descriptions based on the provided technical blueprints.

## Key UI Components

### Execution Planner
A top-down, bird's-eye view of the entire project roadmap. It displays the AI-generated Epics and the technical graph of tasks required to complete them. This serves as the "contract" before execution begins.

### Phase Dashboard
The primary workspace for daily development.
- **Subway Map**: A project-level progress bar showing the active SDLC phase (Backlog -> Design -> Dev -> Test -> etc.).
- **Epic Sidebar**: Allows users to focus on one feature at a time.
- **Filtered Task List**: Shows only the sub-tasks for the selected Epic that belong to the *current* active phase.
- **Hard Stage Gates**: The "Advance to Next Phase" button is physically locked until **all** tasks in the current phase (across all Epics) are marked as `DONE`.

## Database Schema (Prisma)
- `BlueprintVersion`: Stores JSON snapshots of notes.
- `ProjectIteration`: Manages the lifecycle of a specific version run (SDLC Phase, Methodology).
- `GithubFeature`: Upgraded with `parentId` and `sdlcPhaseId` to support the Epic -> Task hierarchy.

## How it Works (User Flow)
1. **Define**: Write the PRD and generate Flows.
2. **Seal**: Archive the versions to lock the requirements.
3. **Plan**: Select an SDLC (Agile, Waterfall, etc.) and generate the Master Plan (Epics).
4. **Execute**: Enter the Phase Dashboard. Generate technical tasks for the "Design" phase. Complete them to unlock "Development".
5. **Iterate**: If a new feature is needed, update the PRD, detect the drift, and spawn a new Iteration to build the new delta.
