"use client";

import React, { useState, useEffect } from "react";
import { User, CreditCard, Shield, Clock, Check, Loader2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface UserSettings {
  id: string;
  email: string;
  name?: string | null;
  tier: "FREE" | "PRO" | "TEAM";
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "billing">("profile");
  const [user, setUser] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Fetch user details
    fetch("/api/auth/me")
      .then((res) => {
          if (!res.ok) throw new Error("Failed");
          return res.json();
      })
      .then((data) => {
          setUser(data);
          setNameInput(data.name || "");
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setSavedSuccess(true);
    setSaving(false);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and subscription.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === "profile"
              ? "text-slate-900"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <User size={18} className={activeTab === "profile" ? "text-blue-600" : "text-slate-400"} /> 
          Profile
          {activeTab === "profile" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === "billing"
              ? "text-slate-900"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <CreditCard size={18} className={activeTab === "billing" ? "text-blue-600" : "text-slate-400"} /> 
          Billing & Plan
          {activeTab === "billing" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      <div className="py-2">
        <AnimatePresence mode="wait">
            {activeTab === "profile" && (
            <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
            >
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Personal Information
                </h2>
                <div className="grid gap-6 max-w-lg">
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                        <input
                            disabled
                            value={user?.email || ""}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed pl-10"
                        />
                        <Lock className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Shield size={10} /> Email is managed by your provider and cannot be changed here.
                    </p>
                    </div>
                    
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                    <input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800"
                        placeholder="Enter your name"
                    />
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={handleSaveProfile}
                            disabled={saving || savedSuccess}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                savedSuccess 
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20"
                            }`}
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : 
                             savedSuccess ? <Check size={18} /> : null}
                            {saving ? "Saving..." : savedSuccess ? "Saved!" : "Save Changes"}
                        </button>
                    </div>
                </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800">Account Security</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage your password and authentication methods.</p>
                </div>
                <button className="text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                    Manage Security
                </button>
                </div>
            </motion.div>
            )}

            {activeTab === "billing" && (
            <motion.div 
                key="billing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
            >
                {/* Current Plan Card */}
                <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/10">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Current Plan</div>
                             {user?.tier !== "FREE" && (
                                 <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                             )}
                        </div>
                        <div className="text-4xl font-bold flex items-center gap-3 tracking-tight">
                        {user?.tier} TIER
                        </div>
                        <p className="text-slate-400 mt-3 max-w-md leading-relaxed text-sm">
                        {user?.tier === "FREE" 
                            ? "You are on the Free plan. Upgrade to unlock unlimited AI plans, advanced habit tracking, and team collaboration features." 
                            : "You have full access to all premium features including AI generation and team tools."}
                        </p>
                    </div>
                    {user?.tier === "FREE" ? (
                        <button className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-white/10">
                        Upgrade Now
                        </button>
                    ) : (
                        <button className="bg-white/10 text-white border border-white/20 px-6 py-2 rounded-lg font-medium text-sm hover:bg-white/20 transition-colors">
                            Manage Subscription
                        </button>
                    )}
                </div>
                {/* Decor */}
                <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><Shield size={300} /></div>
                </div>

                {/* Invoices List */}
                <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-slate-400" /> Billing History
                </h3>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                        <div className="bg-slate-50 p-4 rounded-full text-slate-300">
                             <Clock size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">No past invoices found.</p>
                        <p className="text-slate-400 text-sm">Once you subscribe, your receipts will appear here.</p>
                    </div>
                </div>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="flex gap-6 border-b border-slate-200 pb-4">
                <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-96 w-full bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
        </div>
    )
}