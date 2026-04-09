"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BarChart3 } from 'lucide-react';
import DashboardUI from './DashboardUI';
import AnalyticsClientPage, { AnalyticsData } from './analytics/analytics-client';

type Tab = 'dashboard' | 'analytics';

interface InsightsHubProps {
  dashboardData: any;
  analyticsData: AnalyticsData;
  firstName: string;
}

export default function InsightsHub({ dashboardData, analyticsData, firstName }: InsightsHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="transform-gpu space-y-8">
      {/* Header with Tab Switcher */}
      <div className="transform-gpu flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="transform-gpu text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            Hello, <span className="transform-gpu text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">{firstName}</span> 👋
          </h1>
          <p className="transform-gpu text-slate-500 font-medium mt-2 text-lg">
            {activeTab === 'dashboard' ? "Let's make today productive." : "Your neural performance streams."}
          </p>
        </div>

        <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center shadow-inner relative overflow-hidden self-start md:self-auto">
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={16} />}
            label="Dashboard"
          />
          <TabButton 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
            icon={<BarChart3 size={16} />}
            label="Analytics"
          />
          
          <motion.div 
            className="absolute bg-white border border-slate-200 rounded-xl shadow-sm -z-0"
            initial={false}
            animate={{ 
              x: activeTab === 'dashboard' ? 0 : '100%',
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ 
              top: 4, 
              bottom: 4, 
              left: 4, 
              width: 'calc(50% - 4px)' 
            }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardUI data={dashboardData} />
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AnalyticsClientPage data={analyticsData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-xl transition-all duration-300 ${
        active 
          ? "text-indigo-600 font-bold" 
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <span className={active ? "scale-110 transition-transform" : ""}>{icon}</span>
      <span className="text-xs uppercase tracking-widest">{label}</span>
    </button>
  );
}
