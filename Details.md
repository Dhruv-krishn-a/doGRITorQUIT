# Project Details & Architecture Guide

Welcome to the **Planner / Upgrade OS** project! 

This document is designed to help anyone—regardless of coding experience—understand what this project is, how it is built, and how the different parts work together.

---

## 1. High-Level Architecture (The "Big Picture")

Imagine this project as a **large, multi-department company**. Instead of having separate buildings for every team, everyone works in one giant headquarters. In software terms, this is called a **Monorepo**.

### The Structure
The project is split into two main areas:
1.  **Apps (The Departments)**: These are the user-facing products. Just like a company has a Customer Service desk, a Shipping department, and an Executive suite, this project has a Website, a Mobile App, and an Admin Panel.
2.  **Packages (The Shared Resources)**: These are the internal teams that support the Apps. Think of them like "Human Resources" or "IT Support." They provide data, logic, and design elements that all the Apps use so that we don't have to reinvent the wheel for every department.

### Why this design?
*   **Consistency**: If we change the color of a button in the "Design" package, it updates in the Web App, Mobile App, and Admin Panel simultaneously.
*   **Efficiency**: We write the complex logic (like "how to calculate burnout risk") once in a shared package, and every app can use it.

---

## 2. The Ecosystem (The "Apps")

These are located in the `apps/` folder.

*   **`apps/web` (The Main Headquarters)**:
    *   **What it is**: The main website where users log in to manage their day, track habits, and use the "Upgrade OS" study system.
    *   **Tech**: Built with Next.js (a framework for building fast websites).
*   **`apps/cms` (The Control Room)**:
    *   **What it is**: A Content Management System for administrators. This is where you might see stats, manage users, or update content that appears on the main site.
*   **`apps/mobile` (The Field Agent)**:
    *   **What it is**: An app for your phone (iPhone/Android). It allows users to track things on the go.
    *   **Tech**: React Native (allows us to write code once and run it on both iOS and Android).
*   **`apps/desktop` (The Power Station)**:
    *   **What it is**: A dedicated application installed on your computer (Mac/Windows/Linux). It's meant for deep work sessions, potentially offering features like blocking distractions.
    *   **Tech**: Tauri (makes the app extremely lightweight and fast).

---

## 3. The Shared Brain (The "Packages")

These are located in the `packages/` folder.

*   **`packages/db` (The Filing Cabinet)**:
    *   **Job**: Stores all the data. Users, passwords, study tracks, progress logs—it all lives here.
    *   **Key Tool**: **Prisma**. Think of Prisma as the librarian who knows exactly where every file is. When the App asks for "User John's data," Prisma retrieves it from the database.
*   **`packages/domain` (The Rule Book)**:
    *   **Job**: This contains the "Business Logic." It defines the rules of the system.
    *   **Example**: "If a user studies for 4 hours without a break, mark them as 'Fatigued'." This rule is written here so the Web, Mobile, and Desktop apps all follow the same rule.
*   **`packages/ui` (The Lego Set)**:
    *   **Job**: A collection of pre-made design elements (Buttons, Text Inputs, Cards, Modals).
    *   **Benefit**: Ensures the Mobile App looks similar to the Web App, maintaining a consistent brand identity.
*   **`packages/config` & `packages/typescript-config`**:
    *   **Job**: The rule enforcers. They ensure everyone writes code in the same style and format.

---

## 4. Feature Management (The Toggle Switches)

One of the most powerful parts of this project is how we turn features on and off without changing the code.

### How it works:
1.  **The CMS**: Administrators use the **CMS Admin Panel** to manage "Products" (like the Free Tier or Pro Plan).
2.  **Feature Keys**: Inside each product, admins can add "Feature Keys."
    *   **`ACCESS_PLANS`**: Turns on the Plans page.
    *   **`ACCESS_TASKS`**: Turns on the Tasks page.
    *   **`ACCESS_STUDY`**: Turns on the new **Upgrade OS** feature.
    *   **`AI_GEN_LIMIT`**: Sets a number for how many AI credits a user has.
3.  **Instant Updates**: When an admin adds `ACCESS_STUDY` to the "Pro Plan" in the CMS, every user on that plan instantly sees the "Upgrade OS" link in their sidebar on the main website.

---

## 5. How It Works (A User Story)

Let's trace a simple action: **A user completes a Study Unit.**

1.  **The Action**: The user is on the **Web App** (`apps/web`) and clicks the "Complete" button on a video lesson.
2.  **The Request**: The Web App sends a message (an "API Request") to the server saying, "User X just finished Unit Y."
3.  **The Logic**: The server receives this and checks the **Domain Package** (`packages/domain`).
    *   The Domain Package calculates: "Did this finish the track? How much energy did it cost? Should we schedule a revision for tomorrow?"
4.  **The Storage**: The Domain Package tells the **Database Package** (`packages/db`) to:
    *   Mark the unit as "Done".
    *   Add points to the user's daily score.
    *   Save the next revision date.
5.  **The Result**: The Database confirms the save. The Web App updates the screen to show a green checkmark and increases the user's streak count.

---

## 6. File & Folder Dictionary

Here is a guide to the specific files you see in the root directory:

### Root Files
*   **`package.json`**: The ID card for the project. It lists the project's name, version, and the "dependencies" (other software packages it needs to run).
*   **`pnpm-workspace.yaml`**: The map of the Monorepo. It tells the system, "Hey, look in `apps/` and `packages/` to find the different parts of this project."
*   **`turbo.json`**: The engine configuration. We use a tool called "Turbo" to speed up tasks. This file tells Turbo how to run things efficiently (e.g., "Don't re-test code that hasn't changed").
*   **`tsconfig.json`**: The grammar rulebook for TypeScript (the programming language we use). It ensures the code is written correctly.
*   **`.gitignore`**: The "Do Not Enter" list. It tells Git (our version control system) which files to ignore (like temporary files or passwords).
*   **`README.md`**: The instruction manual (usually for developers).
*   **`UPGRADE_OS_README.md`**: A specific manual I created for the new "Upgrade OS" feature, explaining how to run the new study system.

### Scripts Folder (`scripts/`)
These are small robots designed to do one specific job.
*   **`backfill-study-to-tracks.ts`**: A migration robot. It takes old study playlist data and converts it into the new "Track" format.
*   **`init-free-tier.ts`**: Likely a robot that sets up default settings for new users on the free plan.

### Key Configuration Files (Inside Apps)
*   **`next.config.js` / `next.config.mjs`**: Settings for the Next.js web framework.
*   **`tailwind.config.ts`**: Settings for the styling engine (colors, fonts, spacing).
*   **`schema.prisma` (in `packages/db`)**: The blueprint of the database. It defines what a "User" looks like, what a "Track" looks like, etc.

---

## Summary
This project is a sophisticated, modern application designed to be scalable (grow big easily) and maintainable (easy to fix). By separating **Data** (DB), **Rules** (Domain), and **Visuals** (Apps/UI), it ensures that the system is robust and that different features can interact seamlessly without breaking each other.
