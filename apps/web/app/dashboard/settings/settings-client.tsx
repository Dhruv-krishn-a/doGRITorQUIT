"use client";

import React, { useState } from "react";
import { User, CreditCard, Shield, Clock, Check, Loader2, Lock, AlertCircle, ChevronRight, Laptop, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export interface UserSettings {
  id: string;
  email: string;
  name?: string | null;
  tier: string;
  provider: string;
}

interface SettingsClientProps {
  user: UserSettings;
}

export default function SettingsClientPage({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "billing">("profile");
  
  // -- PROFILE FORM --
  const [nameInput, setNameInput] = useState(user.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);

  // -- PASSWORD FORM --
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- Handlers ---
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    // Simulate DB Update
    await new Promise(r => setTimeout(r, 800));
    setSavedProfileSuccess(true);
    setSavingProfile(false);
    setTimeout(() => setSavedProfileSuccess(false), 2000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);
    
    if (newPassword.length < 6) {
        setPassMessage({ type: 'error', text: "Password must be at least 6 characters." });
        return;
    }
    if (newPassword !== confirmPassword) {
        setPassMessage({ type: 'error', text: "Passwords do not match." });
        return;
    }

    setSavingPass(true);
    
    const res = await fetch("/api/native-auth/password/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    const payload = await res.json();
    if (!res.ok) {
        setPassMessage({ type: 'error', text: payload?.error || "Failed to update password." });
    } else {
        setPassMessage({ type: 'success', text: "Password updated successfully!" });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowPasswordForm(false), 2000);
    }
    setSavingPass(false);
  };

  return (
    <div className="transform-gpu max-w-5xl mx-auto p-6 md:p-10 space-y-10 font-sans text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="transform-gpu flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
           <h1 className="transform-gpu text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Settings</h1>
           <p className="transform-gpu text-slate-500 mt-2 text-lg">Manage your personal preferences and plan.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="transform-gpu flex gap-1 p-1 bg-slate-100/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "profile"
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <User size={18} /> Profile
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "billing"
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <CreditCard size={18} /> Billing
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- PROFILE TAB --- */}
        {activeTab === "profile" && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="transform-gpu grid lg:grid-cols-3 gap-8"
          >
            {/* Left Column: General Info */}
            <div className="transform-gpu lg:col-span-2 space-y-6">
                
                {/* Personal Info Card */}
                <div className="transform-gpu bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="transform-gpu flex items-center gap-3 mb-6">
                        <div className="transform-gpu bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                            <User size={20} />
                        </div>
                        <h2 className="transform-gpu text-lg font-bold text-slate-900">Personal Information</h2>
                    </div>

                    <div className="transform-gpu space-y-6 max-w-lg">
                        <div>
                            <label className="transform-gpu block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="transform-gpu relative group">
                                <MailIcon className="transform-gpu absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    disabled
                                    value={user.email}
                                    className="transform-gpu w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed select-none"
                                />
                                <div className="transform-gpu absolute right-3.5 top-3.5">
                                    <Lock size={16} className="transform-gpu text-slate-400" />
                                </div>
                            </div>
                            <p className="transform-gpu text-xs text-slate-400 mt-2 ml-1">
                                Used for login and billing. Cannot be changed.
                            </p>
                        </div>
                        
                        <div>
                            <label className="transform-gpu block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                            <input
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="transform-gpu w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                                placeholder="e.g. Alex Maker"
                            />
                        </div>

                        <div className="transform-gpu pt-2">
                            <button 
                                onClick={handleSaveProfile}
                                disabled={savingProfile || savedProfileSuccess}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                    savedProfileSuccess 
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20"
                                }`}
                            >
                                {savingProfile ? <Loader2 className="transform-gpu animate-spin" size={18} /> : 
                                savedProfileSuccess ? <Check size={18} /> : null}
                                {savingProfile ? "Saving..." : savedProfileSuccess ? "Saved Successfully" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Password / Security Card */}
                <div className="transform-gpu bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="transform-gpu p-8 border-b border-slate-100">
                         <div className="transform-gpu flex items-center gap-3 mb-2">
                            <div className="transform-gpu bg-rose-50 p-2.5 rounded-xl text-rose-600">
                                <Shield size={20} />
                            </div>
                            <h2 className="transform-gpu text-lg font-bold text-slate-900">Security</h2>
                        </div>
                        <p className="transform-gpu text-slate-500 text-sm pl-13">Manage your password and authentication.</p>
                    </div>

                    <div className="transform-gpu p-8 bg-slate-50/50">
                        {!showPasswordForm ? (
                            <div className="transform-gpu flex items-center justify-between">
                                <div>
                                    <h3 className="transform-gpu font-bold text-slate-800">Password</h3>
                                    {/* ✅ FIX: Universal text that works for everyone */}
                                    <p className="transform-gpu text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
                                        Update your password, or set a new one if you signed in via Google.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowPasswordForm(true)}
                                    className="transform-gpu bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                >
                                    Manage Password
                                </button>
                            </div>
                        ) : (
                            <motion.form 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                onSubmit={handleUpdatePassword}
                                className="transform-gpu max-w-md space-y-4"
                            >
                                <div className="transform-gpu flex justify-between items-center mb-4">
                                     <h3 className="transform-gpu font-bold text-slate-800">Update Password</h3>
                                     <button 
                                        type="button" 
                                        onClick={() => setShowPasswordForm(false)}
                                        className="transform-gpu text-xs font-bold text-slate-400 hover:text-slate-600"
                                     >
                                        Cancel
                                     </button>
                                </div>

                                {passMessage && (
                                    <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                                        passMessage.type === 'success' 
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                            : "bg-rose-50 text-rose-700 border border-rose-100"
                                    }`}>
                                        {passMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        {passMessage.text}
                                    </div>
                                )}

                                <div>
                                    <input
                                        type="password"
                                        placeholder="New Password (min 6 chars)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="transform-gpu w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="transform-gpu w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                    />
                                </div>
                                <div className="transform-gpu flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={savingPass}
                                        className="transform-gpu bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {savingPass && <Loader2 className="transform-gpu animate-spin" size={14} />}
                                        Save Password
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Sessions / Other info */}
            <div className="transform-gpu space-y-6">
                 <div className="transform-gpu bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="transform-gpu font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Laptop size={18} className="transform-gpu text-slate-400" /> Active Session
                    </h3>
                    <div className="transform-gpu flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="transform-gpu mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <div>
                            <p className="transform-gpu text-sm font-bold text-slate-700">This Browser</p>
                            <p className="transform-gpu text-xs text-slate-400 mt-0.5">Online now</p>
                        </div>
                    </div>
                 </div>
            </div>
          </motion.div>
        )}

        {/* --- BILLING TAB --- */}
        {activeTab === "billing" && (
          <motion.div 
            key="billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="transform-gpu space-y-8"
          >
            {/* Current Plan Card */}
            <div className="transform-gpu bg-linear-to-br from-slate-900 to-indigo-950 rounded-4xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20">
              <div className="transform-gpu relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <div className="transform-gpu flex items-center gap-2 mb-3">
                         <div className="transform-gpu text-indigo-200 text-xs font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">Current Plan</div>
                         {user.tier !== "FREE" && (
                             <span className="transform-gpu bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase shadow-sm">Active</span>
                         )}
                    </div>
                    <div className="transform-gpu text-5xl font-bold flex items-center gap-3 tracking-tighter">
                      {user.tier}
                    </div>
                    <p className="transform-gpu text-indigo-100/80 mt-4 max-w-md leading-relaxed text-base font-medium">
                      {user.tier === "FREE" 
                        ? "Upgrade to Pro to unlock unlimited AI planning, advanced analytics, and team collaboration features." 
                        : "You have full access to all premium features including AI generation and team tools."}
                    </p>
                </div>
                
                <div className="transform-gpu flex flex-col gap-3 w-full md:w-auto">
                    {user.tier === "FREE" ? (
                        <Link href="/dashboard/subscriptions">
                            <button className="transform-gpu w-full md:w-auto bg-white text-indigo-950 px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2 group">
                            Upgrade Now <ChevronRight size={18} className="transform-gpu group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                    ) : (
                        <Link href="/dashboard/subscriptions">
                            <button className="transform-gpu w-full md:w-auto bg-white/10 text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-all backdrop-blur-sm">
                                Manage Subscription
                            </button>
                        </Link>
                    )}
                </div>
              </div>
              
              {/* Decorative Background */}
              <div className="transform-gpu absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-10 blur-3xl w-96 h-96 bg-indigo-500 rounded-full pointer-events-none" />
              <div className="transform-gpu absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 opacity-10 blur-3xl w-80 h-80 bg-rose-500 rounded-full pointer-events-none" />
            </div>

            {/* Invoices List */}
            <div>
              <h3 className="transform-gpu text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <Clock size={20} className="transform-gpu text-slate-400" /> Billing History
              </h3>
              <div className="transform-gpu bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="transform-gpu p-16 text-center flex flex-col items-center gap-4">
                    <div className="transform-gpu bg-slate-50 p-5 rounded-full text-slate-300 ring-8 ring-slate-50">
                         <Clock size={32} />
                    </div>
                    <div>
                        <p className="transform-gpu text-slate-900 font-bold text-lg">No past invoices found</p>
                        <p className="transform-gpu text-slate-500 text-sm mt-1">Once you subscribe, your receipts will appear here.</p>
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Helper Components
function MailIcon({ className }: { className?: string }) {
    return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
}
