"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Activity } from 'lucide-react';
import DashboardUI from './DashboardUI';
import AnalyticsClientPage, { AnalyticsData } from './analytics/analytics-client';
import { cn } from '@/lib/utils';
import { getSession } from 'next-auth/react';

type Tab = 'overview' | 'activity';

interface InsightsHubProps {
  dashboardData: any;
  analyticsData: AnalyticsData | null;
  firstName: string;
}

export default function InsightsHub({ dashboardData, analyticsData, firstName: initialFirstName }: InsightsHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [firstName, setFirstName] = useState(initialFirstName);

  useEffect(() => {
    async function fetchName() {
      try {
        const session = await getSession();
        if (session?.user) {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            const name = data.name || session.user.name || null;
            if (name) {
              setFirstName(name.split(' ')[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch fresh name in hub", err);
      }
    }
    fetchName();
  }, []);

  return (
    <div className="transform-gpu space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      {/* Personalized Header with Tab Switcher */}
      <div className="transform-gpu flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8">
        <div className="space-y-1 md:space-y-2 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] opacity-50">Personal Dashboard</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-tight">
            Hello, <span className="text-[var(--accent-color)]">{firstName}</span>
          </h1>
        </div>

        <div className="bg-[var(--bg-secondary)]/50 p-1 rounded-xl md:rounded-2xl border border-[var(--border-color)] flex items-center shadow-xl relative overflow-hidden self-stretch lg:self-auto min-w-[260px]">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<LayoutDashboard size={16} />}
            label="Overview"
          />
          <TabButton 
            active={activeTab === 'activity'} 
            onClick={() => setActiveTab('activity')}
            icon={<Activity size={16} />}
            label="Activity"
          />
          
          {/* Animated background pill */}
          <motion.div 
            layoutId="activeTabPill"
            className="absolute bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg md:rounded-xl shadow-lg -z-0"
            initial={false}
            animate={{ 
              x: activeTab === 'overview' ? '0%' : '100%',
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
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DashboardUI data={dashboardData} />
            </motion.div>
          ) : (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <AnalyticsClientPage initialData={analyticsData} />
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
      className={cn(
        "relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl transition-all duration-300",
        active 
          ? "text-[var(--accent-color)]" 
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      )}
    >
      <span className={cn("transition-transform duration-300", active && "scale-110")}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
