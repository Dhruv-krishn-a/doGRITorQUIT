import React, { useState, useEffect } from "react";
import { 
    User, CreditCard, Shield, Clock, Check, Loader2, Lock, 
    AlertCircle, ChevronRight, Laptop, Palette,
    Globe, Fingerprint, Mail, Save, RefreshCw, Zap,
    Cpu, AppWindow, HardDrive, BellRing
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme, THEMES } from "../hooks/useTheme";
import { useDeveloperMode } from "../hooks/useDeveloperMode";
import { toast } from "sonner";
import { authService } from "../features/auth/hooks/useAuth";
import { api } from "../services/api";
import { cn } from "../lib/utils";

type TabID = "profile" | "billing" | "security" | "appearance" | "desktop";

interface ExtendedUser {
    id: string;
    email: string;
    tier: string;
    name: string | null;
    bio?: string | null;
    timezone?: string | null;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabID>("profile");
  const { theme, changeTheme, themes } = useTheme();
  const { isDevMode, toggleDevMode } = useDeveloperMode();
  const session = authService.getSession();
  const user = session?.user;

  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('dhruv') || user?.email?.includes('test') || true;

  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  // -- PROFILE FORM --
  const [profileData, setProfileData] = useState({
      name: user?.user_metadata?.full_name || "",
      bio: "",
      timezone: "UTC"
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // -- DESKTOP PREFERENCES --
  const [desktopPrefs, setDesktopPrefs] = useState({
      autoStart: true,
      minimizeToTray: true,
      hardwareAcceleration: true,
      syncInterval: "5"
  });

  useEffect(() => {
    async function loadData() {
        try {
            const data = await api.get("/api/auth/me"); 
            if (data) {
                setExtendedUser(data);
                setProfileData({
                    name: data.name || user?.user_metadata?.full_name || "",
                    bio: data.bio || "",
                    timezone: data.timezone || "UTC"
                });
            }
        } catch (err) {
            console.error("Failed to load extended profile", err);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [user?.user_metadata?.full_name]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
        await api.post("/api/user/profile", profileData);
        toast.success("Profile updated successfully.");
    } catch (err) {
        toast.error("Failed to update profile.");
    } finally {
        setSavingProfile(false);
    }
  };

  const tabs: { id: TabID; label: string; icon: any }[] = [
      { id: "profile", label: "Profile", icon: User },
      { id: "billing", label: "Plan", icon: CreditCard },
      { id: "desktop", label: "App Settings", icon: Cpu },
      { id: "security", label: "Security", icon: Shield },
      { id: "appearance", label: "Appearance", icon: Palette },
  ];

  if (loading) {
      return (
          <div className="h-full w-full flex items-center justify-center bg-[var(--bg-primary)]">
              <Loader2 className="animate-spin text-[var(--accent-color)]" size={32} />
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row min-h-[calc(100vh-160px)] gap-6 lg:gap-12 p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 antialiased">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <div className="lg:mb-8 px-2 md:px-4">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Settings</h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">Application Preferences</p>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar px-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                        "flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all group border whitespace-nowrap lg:w-full lg:justify-between",
                        activeTab === tab.id
                        ? "bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/20 shadow-lg shadow-[var(--accent-color)]/5"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border-transparent"
                    )}
                >
                    <div className="flex items-center gap-3 md:gap-4">
                        <tab.icon size={16} className={cn("shrink-0", activeTab === tab.id ? "text-[var(--accent-color)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]")} />
                        {tab.label}
                    </div>
                    {activeTab === tab.id && <ChevronRight size={14} className="hidden lg:block" />}
                </button>
            ))}
        </nav>

        <div className="hidden lg:block mt-10 p-6 bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-3xl">
            <div className="flex items-center gap-3 mb-4 text-[var(--accent-color)]">
                <Fingerprint size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">User ID</span>
            </div>
            <p className="text-[10px] font-mono text-[var(--text-secondary)] break-all leading-relaxed">
                {user?.id}
            </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
            {activeTab === "profile" && (
                <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 md:space-y-8"
                >
                    <SectionHeader title="Profile Settings" description="Manage your personal information." />
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl md:rounded-4xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 block px-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={profileData.name}
                                        onChange={e => setProfileData(s => ({ ...s, name: e.target.value }))}
                                        className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)]/50 focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 block px-1">Bio / Role</label>
                                    <textarea 
                                        rows={3}
                                        value={profileData.bio}
                                        onChange={e => setProfileData(s => ({ ...s, bio: e.target.value }))}
                                        className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)]/50 focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 block px-1">Timezone</label>
                                    <select 
                                        value={profileData.timezone}
                                        onChange={e => setProfileData(s => ({ ...s, timezone: e.target.value }))}
                                        className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)]/50 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="UTC">Universal Time (UTC)</option>
                                        <option value="America/New_York">New York (EST)</option>
                                        <option value="Europe/London">London (GMT)</option>
                                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                                        <option value="Asia/Kolkata">Mumbai (IST)</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveProfile}
                                disabled={savingProfile}
                                className="w-full flex items-center justify-center gap-3 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {savingProfile ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                                Save Changes
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-3xl md:rounded-4xl p-6 md:p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-2.5 md:p-3 bg-[var(--bg-card)] rounded-xl md:rounded-2xl border border-[var(--border-color)]">
                                        <Mail size={20} className="text-[var(--text-secondary)]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest truncate">Email Address</p>
                                        <p className="text-xs md:text-sm font-bold text-[var(--text-primary)] mt-1 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="p-3 md:p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl md:rounded-2xl flex items-start gap-3">
                                    <Zap size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-[9px] md:text-[10px] font-bold text-emerald-500/80 leading-relaxed uppercase tracking-wide">
                                        Verified Connection. All systems operational.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Mobile User ID View */}
                            <div className="lg:hidden p-6 bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-3xl">
                                <div className="flex items-center gap-3 mb-2 text-[var(--accent-color)]">
                                    <Fingerprint size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">User ID</span>
                                </div>
                                <p className="text-[9px] font-mono text-[var(--text-secondary)] break-all leading-relaxed">
                                    {user?.id}
                                </p>
                            </div>

                            {isAdmin && (
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-sky-400">
                                            <Cpu size={20} />
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest block">Admin Diagnostics</span>
                                                <span className="text-[8px] text-slate-500 uppercase tracking-widest">Show live sync & lease overlay</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={toggleDevMode}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isDevMode ? 'bg-sky-500' : 'bg-slate-700'}`}
                                        >
                                            <span className={`${isDevMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === "desktop" && (
                <motion.div
                    key="desktop"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 md:space-y-8"
                >
                    <SectionHeader title="App Settings" description="Configure how the application behaves on your computer." />
                    
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl md:rounded-4xl p-6 md:p-10 space-y-8 shadow-xl">
                        <ToggleSetting 
                            icon={Zap} 
                            label="Launch on Startup" 
                            description="Automatically start the app when you turn on your computer." 
                            enabled={desktopPrefs.autoStart}
                            onToggle={() => setDesktopPrefs(s => ({...s, autoStart: !s.autoStart}))}
                        />
                        <ToggleSetting 
                            icon={AppWindow} 
                            label="Minimize to Tray" 
                            description="Keep the app running in the background when closed." 
                            enabled={desktopPrefs.minimizeToTray}
                            onToggle={() => setDesktopPrefs(s => ({...s, minimizeToTray: !s.minimizeToTray}))}
                        />
                        <ToggleSetting 
                            icon={HardDrive} 
                            label="Hardware Acceleration" 
                            description="Use your graphics card to improve performance." 
                            enabled={desktopPrefs.hardwareAcceleration}
                            onToggle={() => setDesktopPrefs(s => ({...s, hardwareAcceleration: !s.hardwareAcceleration}))}
                        />

                        <div className="pt-4 border-t border-[var(--border-color)]">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)] shadow-inner">
                                        <RefreshCw size={18} className="text-[var(--text-secondary)]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">Sync Frequency</p>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5 italic opacity-60">How often data is updated</p>
                                    </div>
                                </div>
                                <select 
                                    value={desktopPrefs.syncInterval}
                                    onChange={e => setDesktopPrefs(s => ({...s, syncInterval: e.target.value}))}
                                    className="w-full sm:w-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[10px] font-black uppercase text-[var(--accent-color)] outline-none cursor-pointer"
                                >
                                    <option value="1">1 Minute</option>
                                    <option value="5">5 Minutes</option>
                                    <option value="15">15 Minutes</option>
                                    <option value="60">1 Hour</option>
                                </select>
                             </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 bg-indigo-600/10 border border-indigo-600/20 rounded-3xl md:rounded-4xl flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 rounded-xl md:rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                            <BellRing size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">Desktop Notifications</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Notifications are integrated with your operating system.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === "billing" && (
                <motion.div
                    key="billing"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 md:space-y-8"
                >
                    <SectionHeader title="Subscription Plan" description="Manage your account level and features." />
                    
                    <div className="bg-gradient-to-br from-obsidian to-slate-900 border border-[var(--border-color)] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4 md:mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Current Plan</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">{extendedUser?.tier || "FREE"}</h2>
                                <p className="text-white/40 mt-3 md:mt-4 max-w-sm text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    Your plan determines available features and limits.
                                </p>
                            </div>

                            <Link to="/subscriptions" className="w-full md:w-auto">
                                <button className="w-full md:w-auto bg-[var(--accent-color)] text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl active:scale-95 border border-white/10">
                                    Upgrade Plan
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-6">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-color)] shadow-inner">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic">Transaction history is available on the web</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-2">Please visit the web portal to view full billing records.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === "appearance" && (
                <motion.div
                    key="appearance"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 md:space-y-8"
                >
                    <SectionHeader title="Appearance Settings" description="Customize how the application looks." />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => changeTheme(t.id as any)}
                                className={cn(
                                    "group relative p-0.5 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500 overflow-hidden border-2",
                                    theme === t.id 
                                    ? "border-[var(--accent-color)] scale-[1.02] lg:scale-105 shadow-2xl shadow-[var(--accent-color)]/20" 
                                    : "border-transparent hover:border-[var(--border-color)]"
                                )}
                            >
                                <div className={cn(
                                    "h-full w-full rounded-[1.9rem] md:rounded-[2.3rem] p-6 md:p-8 flex flex-col items-start gap-4 md:gap-6 text-left transition-all duration-500",
                                    t.id === 'noir' ? "bg-[#050508] text-white" : 
                                    t.id === 'dark' ? "bg-[#111111] text-white" : "bg-[#faf9f5] text-slate-900"
                                )}>
                                    <span className="text-2xl md:text-3xl">{t.emoji}</span>
                                    <div>
                                        <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2">{t.name}</h4>
                                        <p className="text-[9px] md:text-[10px] font-bold opacity-60 uppercase tracking-widest leading-relaxed">{t.description}</p>
                                    </div>
                                </div>
                                {theme === t.id && (
                                    <div className="absolute top-4 right-4 md:top-6 md:right-6 w-5 h-5 md:w-6 md:h-6 bg-[var(--accent-color)] rounded-full flex items-center justify-center text-white border-2 border-white/20">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl md:rounded-4xl p-6 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[var(--accent-color)]/10 flex items-center justify-center border border-[var(--accent-color)]/20 transition-all group-hover:scale-110 shrink-0">
                                <Globe size={24} className="text-[var(--accent-color)]" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest italic">Language Settings</h3>
                                <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Application display language</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-4 p-3 bg-[var(--bg-secondary)]/50 rounded-xl border border-[var(--border-color)] sm:border-none sm:bg-transparent sm:p-0">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">English (System)</span>
                            <ChevronRight size={14} className="text-[var(--text-secondary)]" />
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === "security" && (
                <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 md:space-y-8"
                >
                    <SectionHeader title="Security Settings" description="Manage your account security." />
                    
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl md:rounded-4xl p-8 md:p-12 text-center flex flex-col items-center gap-6 shadow-xl">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                            <Shield size={28} />
                        </div>
                        <div className="max-w-md">
                            <p className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight italic">Password Management</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-4 leading-relaxed opacity-70">
                                To change your password or update security settings, please use our secure web portal. 
                                Desktop security settings are limited for your protection.
                            </p>
                            <button className="mt-8 w-full sm:w-auto px-10 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/50 transition-all">
                                Open Web Portal
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="mb-6 md:mb-10 px-1 md:px-2">
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic leading-tight">{title}</h2>
            <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] md:tracking-[0.4em] mt-2 ml-0.5 md:ml-1 opacity-70">{description}</p>
        </div>
    );
}

function ToggleSetting({ icon: Icon, label, description, enabled, onToggle }: { icon: any, label: string, description: string, enabled: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between gap-4 group">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)] shadow-inner transition-all group-hover:scale-110 shrink-0">
                    <Icon size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)]" />
                </div>
                <div>
                    <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{label}</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5 opacity-60">{description}</p>
                </div>
            </div>
            <button 
                onClick={onToggle}
                className={`w-12 h-6 rounded-full relative transition-all duration-500 border shrink-0 ${
                    enabled ? "bg-[var(--accent-color)] border-[var(--accent-color)]" : "bg-[var(--bg-secondary)] border-[var(--border-color)]"
                }`}
            >
                <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-500 ${
                    enabled ? "left-6.5" : "left-1"
                }`} />
            </button>
        </div>
    );
}
