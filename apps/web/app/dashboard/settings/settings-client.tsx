"use client";

import React, { useState, useEffect } from "react";
import { 
    User, CreditCard, Shield, Clock, Check, Loader2, Lock, 
    AlertCircle, ChevronRight, Laptop, CheckCircle2, Palette,
    Globe, Fingerprint, Mail, Save, RefreshCw, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme, THEMES } from "../../../shared/hooks/useTheme";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface UserSettings {
  id: string;
  email: string;
  name?: string | null;
  bio?: string | null;
  timezone?: string | null;
  locale?: string | null;
  tier: string;
  provider: string;
  avatarUrl?: string;
}

interface SettingsClientProps {
  user: UserSettings;
}

type TabID = "profile" | "billing" | "security" | "appearance";

export default function SettingsClientPage({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabID>("profile");
  const { theme, changeTheme } = useTheme();
  
  // -- PROFILE FORM --
  const [profileData, setProfileData] = useState({
      name: user.name || "",
      bio: user.bio || "",
      timezone: user.timezone || "UTC",
      avatarUrl: user.avatarUrl || ""
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 1024 * 1024) {
              toast.error("Image must be smaller than 1MB.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setProfileData(s => ({ ...s, avatarUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  // -- PASSWORD FORM --
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [savingPass, setSavingPass] = useState(false);

  // --- Handlers ---
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
        const res = await fetch("/api/user/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData)
        });
        if (res.ok) {
            toast.success("Profile updated successfully.");
            if (profileData.timezone !== user.timezone) {
                setTimeout(() => window.location.reload(), 1000);
            }
        } else {
            toast.error("Failed to update profile.");
        }
    } catch (err) {
        toast.error("Error updating profile.");
    } finally {
        setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
    }
    if (passwords.new !== passwords.confirm) {
        toast.error("Passwords do not match.");
        return;
    }

    setSavingPass(true);
    try {
        const res = await fetch("/api/native-auth/password/set", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwords.new }),
        });
        if (res.ok) {
            toast.success("Password updated successfully.");
            setPasswords({ new: "", confirm: "" });
            setShowPasswordForm(false);
        } else {
            toast.error("Failed to update password.");
        }
    } catch (err) {
        toast.error("Error updating password.");
    } finally {
        setSavingPass(false);
    }
  };

  const tabs: { id: TabID; label: string; icon: any }[] = [
      { id: "profile", label: "Profile", icon: User },
      { id: "billing", label: "Subscription", icon: CreditCard },
      { id: "security", label: "Security", icon: Shield },
      { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row min-h-[calc(100vh-160px)] gap-6 lg:gap-12 p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 antialiased">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <div className="lg:mb-8 px-2 md:px-4">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Settings</h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">Personal Preferences</p>
        </div>

        {/* Tab Navigation - Horizontal scroll on mobile, vertical list on desktop */}
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
                {user.id}
            </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
            {activeTab === "profile" && (
                <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 md:space-y-8"
                >
                    <SectionHeader title="Profile Settings" description="Update your personal information." />
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl md:rounded-4xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
                             {/* Static background glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-4 border-b border-[var(--border-color)]">
                                        <div className="relative shrink-0">
                                            {profileData.avatarUrl ? (
                                                <img src={profileData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover border-2 border-[var(--accent-color)]/20 shadow-xl" />
                                            ) : (
                                                <div className="w-24 h-24 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center border-2 border-[var(--border-color)] shadow-xl">
                                                    <User size={36} className="text-[var(--text-secondary)] opacity-50" />
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" id="avatar-upload" />
                                            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-[var(--accent-color)] text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-[var(--accent-color)]/30 border-2 border-[var(--bg-card)] cursor-pointer hover:scale-110 transition-transform">
                                                <Palette size={14} />
                                            </label>
                                        </div>
                                    <div className="flex-1 w-full text-center sm:text-left space-y-3 mt-2">
                                        <div>
                                            <label className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 block px-1">Avatar URL</label>
                                            <input 
                                                type="url" 
                                                value={profileData.avatarUrl}
                                                onChange={e => setProfileData(s => ({ ...s, avatarUrl: e.target.value }))}
                                                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)]/50 focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all placeholder:opacity-50"
                                                placeholder="https://example.com/avatar.png"
                                            />
                                        </div>
                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60 px-1">Provide an image URL for your profile picture.</p>
                                    </div>
                                </div>

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
                                        value={profileData.bio || ""}
                                        onChange={e => setProfileData(s => ({ ...s, bio: e.target.value }))}
                                        className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)]/50 focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 block px-1">Timezone</label>
                                    <select 
                                        value={profileData.timezone || "UTC"}
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
                                        <p className="text-xs md:text-sm font-bold text-[var(--text-primary)] mt-1 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="p-3 md:p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl md:rounded-2xl flex items-start gap-3">
                                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[9px] md:text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-wide">
                                        Your email is used for account identification and cannot be changed.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl md:rounded-4xl p-6 md:p-8 flex items-center justify-between group cursor-help">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <Zap size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">Sync Status</p>
                                        <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">Operational</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                            </div>
                            
                            {/* Mobile User ID View */}
                            <div className="lg:hidden p-6 bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-3xl">
                                <div className="flex items-center gap-3 mb-2 text-[var(--accent-color)]">
                                    <Fingerprint size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">User ID</span>
                                </div>
                                <p className="text-[9px] font-mono text-[var(--text-secondary)] break-all leading-relaxed">
                                    {user.id}
                                </p>
                            </div>
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
                    <SectionHeader title="Account Plan" description="Manage your subscription and features." />
                    
                    <div className="bg-gradient-to-br from-[var(--accent-color)] to-indigo-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-[var(--accent-color)]/20 border border-white/10">
                        {/* Decorative background effects */}
                        <div className="absolute top-0 right-0 w-[50%] h-full bg-white/5 skew-x-[-20deg] translate-x-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-4 md:mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Active Plan</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">{user.tier}</h2>
                                <p className="text-white/60 mt-3 md:mt-4 max-w-sm text-xs md:text-sm font-bold uppercase tracking-wide leading-relaxed">
                                    {user.tier === "FREE" 
                                        ? "Standard plan. Limited AI features and cloud storage."
                                        : "Pro plan enabled. Unlimited access to all premium features."
                                    }
                                </p>
                            </div>

                            <Link href="/dashboard/subscriptions" className="w-full md:w-auto">
                                <button className="w-full md:w-auto bg-white text-[var(--accent-color)] px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl active:scale-95">
                                    Change Plan
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <StatCard label="AI Credits" value="Unlimited" color="text-[var(--accent-color)]" />
                        <StatCard label="Cloud Storage" value="50.0 GB" color="text-[var(--text-primary)]" />
                        <StatCard label="Connection" value="High Speed" color="text-emerald-500" />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] px-1">Billing History</h3>
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl md:rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-6">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-color)] shadow-inner">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">No invoices yet</p>
                                <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-2">When you subscribe, your receipts will show up here.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === "security" && (activeTab === "security") && (
                <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 md:space-y-8"
                >
                    <SectionHeader title="Security Settings" description="Manage your password and active sessions." />
                    
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl md:rounded-4xl p-6 md:p-10 space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--border-color)] pb-8">
                            <div className="flex gap-4 md:gap-6 items-start">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                                    <Lock size={24} className="text-rose-500" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base md:text-lg font-black text-[var(--text-primary)] uppercase tracking-tight italic">Account Password</h3>
                                    <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Keep your account secure</p>
                                </div>
                            </div>
                            {!showPasswordForm && (
                                <button 
                                    onClick={() => setShowPasswordForm(true)}
                                    className="w-full sm:w-auto px-6 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/50 transition-all"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>

                        {showPasswordForm && (
                            <form onSubmit={handleUpdatePassword} className="space-y-6 pt-2 max-w-md animate-in slide-in-from-top-4 duration-300">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 block">New Password</label>
                                        <input 
                                            type="password" 
                                            value={passwords.new}
                                            onChange={e => setPasswords(s => ({ ...s, new: e.target.value }))}
                                            className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl px-4 md:px-5 py-3 md:py-4 text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)]/50 focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 block">Confirm Password</label>
                                        <input 
                                            type="password" 
                                            value={passwords.confirm}
                                            onChange={e => setPasswords(s => ({ ...s, confirm: e.target.value }))}
                                            className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl px-4 md:px-5 py-3 md:py-4 text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)]/50 focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={savingPass}
                                        className="flex-1 bg-[var(--accent-color)] text-white px-5 md:px-6 py-3.5 md:py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {savingPass && <RefreshCw className="animate-spin" size={14} />}
                                        Update Password
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPasswordForm(false)}
                                        className="px-5 md:px-6 py-3.5 md:py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                        
                        <div className="pt-4 space-y-4">
                            <h4 className="text-[9px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Active Sessions</h4>
                            <div className="flex items-center justify-between p-4 md:p-5 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl md:rounded-2xl group">
                                <div className="flex items-center gap-4">
                                    <Laptop size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">Current Device</p>
                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">Online Now</p>
                                    </div>
                                </div>
                                <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full shrink-0">
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                </div>
                            </div>
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
                        {THEMES.map((t) => (
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
                                        <p className="text-[9px] md:text-[10px] font-bold opacity-60 uppercase tracking-widest leading-relaxed">
                                            {t.description}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex gap-1.5">
                                        <div className={cn("w-2.5 h-2.5 rounded-full", t.id === 'noir' ? 'bg-indigo-500' : t.id === 'dark' ? 'bg-amber-500' : 'bg-slate-900')} />
                                        <div className={cn("w-2.5 h-2.5 rounded-full opacity-30", t.id === 'noir' ? 'bg-indigo-500' : t.id === 'dark' ? 'bg-amber-500' : 'bg-slate-900')} />
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
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">English (US)</span>
                            <ChevronRight size={14} className="text-[var(--text-secondary)]" />
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

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
            <p className="text-[8px] md:text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-lg md:text-xl font-black italic uppercase tracking-tighter ${color}`}>{value}</p>
        </div>
    );
}
