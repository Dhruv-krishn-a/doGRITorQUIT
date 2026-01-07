// apps/web/app/dashboard/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { User, CreditCard, Shield, Clock } from "lucide-react";
import SubscriptionPanel from "@/features/billing/components/SubscriptionPanel";
import { useAuth } from "@/features/auth/hooks/useAuth"; // Assuming you have this or similar hook
// If no hook, fetch user from an API route like /api/auth/me

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "billing">("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user details + subscription status
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

      <div className="flex gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-colors ${
            activeTab === "profile"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <User size={16} /> Profile
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-colors ${
            activeTab === "billing"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard size={16} /> Billing & Plan
        </button>
      </div>

      <div className="py-6">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Personal Information</h2>
              <div className="grid gap-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                  <input
                    disabled
                    value={user?.email || ""}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Display Name</label>
                  <input
                    defaultValue={user?.name || ""}
                    className="w-full p-2 border border-slate-200 rounded focus:border-blue-500 outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <button className="bg-slate-900 text-white py-2 px-4 rounded-lg font-medium self-start hover:bg-slate-800 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
               <div>
                 <h3 className="font-bold text-slate-800">Account Security</h3>
                 <p className="text-sm text-slate-500">Manage password and security settings via Supabase.</p>
               </div>
               <button className="text-slate-600 border border-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50">
                 Manage Security
               </button>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-8">
            {/* Current Plan Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
               <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Current Plan</div>
                    <div className="text-3xl font-bold flex items-center gap-3">
                      {user?.tier} TIER
                      {user?.tier !== "FREE" && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Active</span>}
                    </div>
                    <p className="text-slate-400 mt-2 max-w-md">
                      {user?.tier === "FREE" 
                        ? "Upgrade to unlock unlimited AI plans, habit tracking, and team features." 
                        : "You have full access to all premium features."}
                    </p>
                  </div>
                  {user?.tier === "FREE" && (
                    <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                      Upgrade Now
                    </button>
                  )}
               </div>
               {/* Decor */}
               <div className="absolute top-0 right-0 p-8 opacity-10"><Shield size={180} /></div>
            </div>

            {/* Invoices List */}
            <div>
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Clock size={18} className="text-slate-400" /> Billing History
               </h3>
               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                 {/* This would fetch from /api/billing/invoices in a real app */}
                 <div className="p-8 text-center text-slate-400 text-sm">
                   No past invoices found.
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}