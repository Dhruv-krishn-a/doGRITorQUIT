import { useAuth } from "./features/auth/hooks/useAuth";
import AuthPage from "./features/auth/components/AuthPage";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TracksPage from "./pages/study/TracksPage";
import TrackDetailPage from "./pages/study/TrackDetailPage";
import StudySessionPage from "./pages/study/StudySessionPage";
import PlanDetailPage from "./pages/plans/PlanDetailPage";
import TodayPage from "./pages/TodayPage";
import ChecklistPage from "./pages/ChecklistPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import SettingsPage from "./pages/SettingsPage";

import { DeepLinkHandler } from "./components/auth/DeepLinkHandler";
import { AppLayout } from "./layouts/AppLayout";
import { GlobalErrorBoundary } from "./components/shared/GlobalErrorBoundary";

// Import new track specific views
import { YoutubeDetailView } from "./features/study/views/YoutubeDetailView";
import { CourseDetailView } from "./features/study/views/CourseDetailView";
import { ProjectDetailView } from "./features/study/views/ProjectDetailView";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="transform-gpu flex min-h-screen items-center justify-center bg-slate-50">
        <div className="transform-gpu flex flex-col items-center gap-4 animate-pulse">
          <div className="transform-gpu w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl rotate-12" />
          <span className="transform-gpu text-slate-400 font-bold tracking-widest uppercase text-xs">Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <DeepLinkHandler />
        <Routes>
          <Route path="/login" element={!user ? <AuthPage view="login" /> : <Navigate to="/" replace />} />
          <Route path="/signup" element={!user ? <AuthPage view="signup" /> : <Navigate to="/" replace />} />
          
          {/* Full-screen Immersive Study Environment (Outside standard layout) */}
          <Route path="/study/youtube/:trackId/unit/:unitId" element={user ? <StudySessionPage /> : <Navigate to="/login" replace />} />
          <Route path="/study/course/:trackId/unit/:unitId" element={user ? <StudySessionPage /> : <Navigate to="/login" replace />} />
          <Route path="/study/project/:trackId/unit/:unitId" element={user ? <StudySessionPage /> : <Navigate to="/login" replace />} />
          <Route path="/study/:trackId/unit/:unitId" element={user ? <StudySessionPage /> : <Navigate to="/login" replace />} />

          {/* Modular Layout for Main Application */}
          <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/daily-checklist" element={<ChecklistPage />} />
            <Route path="/study" element={<TracksPage />} />
            
            <Route path="/study/youtube/:trackId" element={<YoutubeDetailView />} />
            <Route path="/study/course/:trackId" element={<CourseDetailView />} />
            <Route path="/study/project/:trackId" element={<ProjectDetailView />} />
            
            <Route path="/study/:trackId" element={<TrackDetailPage />} />
            <Route path="/plans/:planId" element={<PlanDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
