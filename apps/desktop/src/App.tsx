import { useAuth } from "./features/auth/hooks/useAuth";
import { LoginForm } from "./features/auth/components/LoginForm";
import { TracksList } from "./features/study/components/TracksList";
import { Toaster } from "sonner";
import { LogOut, LayoutDashboard, Layers, Bell } from "lucide-react";
import { supabase } from "./lib/supabase";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const { user, loading } = useAuth();

  const handleLogout = () => supabase.auth.signOut();

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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <LoginForm />
        <Toaster position="bottom-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-600 rounded-lg shrink-0" />
          <span className="hidden lg:block text-white font-black tracking-tight text-xl">PLANNER</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Layers size={20} />} label="Study Tracks" />
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <TracksList />
        </div>
      </main>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${active ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
      {icon}
      <span className="hidden lg:block">{label}</span>
    </button>
  );
}

export default App;
