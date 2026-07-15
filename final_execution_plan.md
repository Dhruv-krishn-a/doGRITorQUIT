# Final Execution Plan — V1.0 Polish

This is the concrete 4-phase plan to complete the last remaining 5% of the monorepo and make it 100% production-ready.

---

## Phase 1: Mobile UI (Study & Habits) 📱
**Goal:** Replace the native stub screens with real UI components hooked up to the WatermelonDB syncing engine.

*   **1.1 Habits Tracker (`apps/mobile/app/(drawer)/checklist.tsx`)**
    *   **Action:** Build out the Daily Checklist UI in React Native using NativeWind (v3).
    *   **Logic:** Use `@nozbe/watermelondb/react` `useDatabase` and `withObservables` to stream the `Habit` and `HabitLog` models to the UI in real-time. Connect the checkbox toggles to `Habit.markCompleted()`.
*   **1.2 Study Trackers (`apps/mobile/app/(drawer)/course-tracker.tsx` & `media-tracker.tsx`)**
    *   **Action:** Build the UI to render `StudyTrack` cards and their nested `StudyUnit` records.
    *   **Logic:** Implement the same "Focus Session" initialization logic used in the Web app, but adapt it for mobile, storing the temporary session in `UnitSession`.

## Phase 2: CMS Admin Wiring 🎛️
**Goal:** Connect the CMS admin UI to the server actions so you can manage your customers.

*   **2.1 Manage Subscriptions (`apps/cms/app/(admin)/users/actions.ts`)**
    *   **Action:** Ensure `assignPlanAction` actually triggers a Stripe/Razorpay backend update or manually grants a specific `productId` to the user's metadata in Supabase/Prisma.
*   **2.2 Refunds & Manual Intervention**
    *   **Action:** Add a `processRefundAction(userId, paymentId)` server action.
    *   **UI:** Update the `apps/cms/app/(admin)/users/page.tsx` data table to include a "Refund" button in the row dropdown that hits this action.

## Phase 3: Desktop Analytics Integration 📈
**Goal:** The Desktop `InsightsPage` currently renders `AnalyticsUI`, but it needs live DB metrics.

*   **3.1 Data Hydration (`apps/desktop/src/features/analytics/components/AnalyticsUI.tsx`)**
    *   **Action:** Import `db` from `@gritorquit/notes-ui-web` or your local Dexie instance.
    *   **Logic:** Calculate the number of notes created this week, the number of habits checked, and the study hours logged. Feed these real integers into the Recharts components instead of hardcoded numbers.

## Phase 4: Backend Push Notifications 🔔
**Goal:** Automatically ping mobile users when they haven't completed their daily habits.

*   **4.1 Mobile Token Registration**
    *   **Action:** The mobile app already calls `registerForPushNotificationsAsync()`. Modify this to send the `ExpoPushToken` to the Next.js backend and save it on the Prisma `User` model.
*   **4.2 Vercel CRON Job (`apps/web/app/api/cron/reminders/route.ts`)**
    *   **Action:** Create a Next.js API route secured by a CRON secret.
    *   **Logic:** Query the DB for all users who have not completed their habits today, batch their Expo push tokens, and send a request to `https://exp.host/--/api/v2/push/send`.
