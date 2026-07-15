import { lazy, Suspense } from "react";
import { useAuth } from "./features/auth/hooks/useAuth";
import AuthPage from "./features/auth/components/AuthPage";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TitleBar from "./components/layout/TitleBar";

import { DeepLinkHandler } from "./components/auth/DeepLinkHandler";
import { AppLayout } from "./layouts/AppLayout";
import { GlobalErrorBoundary } from "./components/shared/GlobalErrorBoundary";

const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const TracksPage = lazy(() => import("./pages/study/TracksPage"));
const StudySessionPage = lazy(() => import("./pages/study/StudySessionPage"));
const PlanDetailPage = lazy(() => import("./pages/plans/PlanDetailPage"));
const TodayPage = lazy(() => import("./pages/TodayPage"));
const ChecklistPage = lazy(() => import("./pages/ChecklistPage"));

const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const TrackerHubView = lazy(() => import("./features/tracker/views/TrackerHubView").then(m => ({ default: m.TrackerHubView })));
const TrackerProjectView = lazy(() => import("./features/tracker/views/TrackerProjectView").then(m => ({ default: m.TrackerProjectView })));

const CourseTrackerPage = lazy(() => import("./pages/study/CourseTrackerPage"));
const MediaTrackerPage = lazy(() => import("./pages/study/MediaTrackerPage"));
const RoadmapTrackerPage = lazy(() => import("./pages/plans/RoadmapTrackerPage"));

const YoutubeDetailView = lazy(() => import("./features/study/views/YoutubeDetailView").then((module) => ({ default: module.YoutubeDetailView })));
const CourseDetailView = lazy(() => import("./features/study/views/CourseDetailView").then((module) => ({ default: module.CourseDetailView })));

function RouteLoader() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-16 w-16 rounded-2xl bg-[var(--accent-color)] shadow-xl rotate-12" />
          <span className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] italic">
            Initializing Engine...
          </span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <DeepLinkHandler />
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/login" element={!user ? <><TitleBar /> <AuthPage view="login" /></> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!user ? <><TitleBar /> <AuthPage view="signup" /></> : <Navigate to="/" replace />} />
            <Route path="/forgot-password" element={!user ? <><TitleBar /> <AuthPage view="forgot-password" /></> : <Navigate to="/" replace />} />
            <Route path="/auth/update-password" element={<><TitleBar /> <AuthPage view="update-password" /></>} />
            <Route path="/support" element={<SupportPage />} />
            
            {/* Full-screen Immersive Study Environment (Outside standard layout) */}
            <Route path="/study/youtube/:trackId/unit/:unitId" element={user ? <><TitleBar /> <StudySessionPage /></> : <Navigate to="/login" replace />} />
            <Route path="/study/course/:trackId/unit/:unitId" element={user ? <><TitleBar /> <StudySessionPage /></> : <Navigate to="/login" replace />} />

            {/* Modular Layout for Main Application */}
            <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
              <Route path="/" element={<InsightsPage />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/daily-checklist" element={<ChecklistPage />} />
              <Route path="/study" element={<TracksPage />} />
              
              {/* Specialized Trackers */}
              <Route path="/project-tracker" element={<TrackerHubView />} />
              <Route path="/project-tracker/:projectId" element={<TrackerProjectView />} />
              <Route path="/course-tracker" element={<CourseTrackerPage />} />
              <Route path="/media-tracker" element={<MediaTrackerPage />} />
              <Route path="/roadmap-tracker" element={<RoadmapTrackerPage />} />

              {/* Redirect legacy tracker to new project-tracker */}
              <Route path="/tracker" element={<Navigate to="/project-tracker" replace />} />
              <Route path="/tracker/:projectId" element={<Navigate to="/project-tracker/:projectId" replace />} />

              <Route path="/study/youtube/:trackId" element={<YoutubeDetailView />} />
              <Route path="/study/course/:trackId" element={<CourseDetailView />} />

              {/* Redirect legacy generic paths to main study hub */}
              <Route path="/study/:trackId" element={<Navigate to="/study" replace />} />

              <Route path="/plans/:planId" element={<PlanDetailPage />} />
              <Route path="/analytics" element={<Navigate to="/" replace />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
