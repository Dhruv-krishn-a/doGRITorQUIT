import { useAuth } from "./features/auth/hooks/useAuth";
import AuthPage from "./features/auth/components/AuthPage";
import { Toaster } from "sonner";
import { LogOut, LayoutDashboard, Layers, Bell, Target, CheckSquare } from "lucide-react";
import { supabase } from "./lib/supabase";
import { invoke } from "@tauri-apps/api/core";
import { BrowserRouter, Routes, Route, Link, useLocation, matchPath, Navigate, Outlet } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TracksPage from "./pages/study/TracksPage";
import TrackDetailPage from "./pages/study/TrackDetailPage";
import PlansPage from "./pages/plans/PlansPage";
import PlanDetailPage from "./pages/plans/PlanDetailPage";
import StudySessionPage from "./pages/study/StudySessionPage";
import TasksPage from "./pages/tasks/TasksPage";
import { StudyFeatureProvider } from "./providers/StudyFeatureProvider";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl rotate-12" />
          <span className="text-slate-400 font-black tracking-widest uppercase text-xs">Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <AuthPage view="login" /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <AuthPage view="signup" /> : <Navigate to="/" replace />} />
        
        <Route element={user ? <AppLayout user={user} /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/:planId" element={<PlanDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/study" element={<TracksPage />} />
          <Route path="/study/:trackId" element={<TrackDetailPage />} />
          <Route path="/study/:trackId/unit/:unitId" element={<StudySessionPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" richColors />
    </BrowserRouter>
  );
}

function AppLayout({ user }: { user: any }) {
  const location = useLocation();
  const handleLogout = () => supabase.auth.signOut();

  const isDashboard = !!matchPath("/", location.pathname);
  const isPlans = !!matchPath("/plans/*", location.pathname);
  const isTasks = !!matchPath("/tasks/*", location.pathname);
  const isStudy = !!matchPath("/study/*", location.pathname);

  const sendNotification = async () => {
    try {
      await invoke("notify", { 
        title: "Planner Desktop", 
        body: "Neural synchronization complete." 
      });
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  };

  return (
    // root wrapper: occupy full viewport and hide overflow so children can't poke out
    <div className="h-screen w-screen bg-white flex overflow-hidden app-root">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col app-sidebar">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-600 rounded-lg shrink-0" />
          <span className="hidden lg:block text-white font-black tracking-tight text-xl">PLANNER</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={isDashboard} 
            />
          </Link>
          <Link to="/plans">
            <NavItem 
              icon={<Target size={20} />} 
              label="Plans" 
              active={isPlans} 
            />
          </Link>
          <Link to="/tasks">
            <NavItem 
              icon={<CheckSquare size={20} />} 
              label="Tasks" 
              active={isTasks} 
            />
          </Link>
          <Link to="/study">
            <NavItem 
              icon={<Layers size={20} />} 
              label="Study Tracks" 
              active={isStudy} 
            />
          </Link>
          <button 
            onClick={sendNotification}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-bold"
          >
            <Bell size={20} />
            <span className="hidden lg:block">Test Alert</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="hidden lg:block px-3 py-2">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signed in as</p>
             <p className="text-xs font-bold text-slate-200 truncate">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold"
          >
            <LogOut size={20} />
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 app-main min-h-0 min-w-0">
        <div className="flex-1 overflow-auto relative h-full w-full min-h-0 min-w-0">
          <StudyFeatureProvider>
            <Outlet />
          </StudyFeatureProvider>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold cursor-pointer ${active ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
      {icon}
      <span className="hidden lg:block">{label}</span>
    </div>
  );
}

export default App;
