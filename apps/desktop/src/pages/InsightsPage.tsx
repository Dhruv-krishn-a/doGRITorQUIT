import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import DashboardPage from './DashboardPage';
import AnalyticsUI from '../features/analytics/components/AnalyticsUI';

type Tab = 'dashboard' | 'analytics';

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header with Tab Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2">Neural Hub</p>
          <h1 className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
            Insights
          </h1>
        </div>

        <div className="bg-[var(--bg-secondary)] p-1.5 rounded-2xl border border-[var(--border-color)] flex items-center shadow-inner relative overflow-hidden">
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={16} />}
            label="Control"
          />
          <TabButton 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
            icon={<BarChart3 size={16} />}
            label="Streams"
          />
          
          {/* Animated background pill */}
          <motion.div 
            layoutId="activeTabPill"
            className="absolute bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg -z-0"
            initial={false}
            animate={{ 
              x: activeTab === 'dashboard' ? '0%' : '100%',
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ 
              top: 6, 
              bottom: 6, 
              left: 6, 
              width: 'calc(50% - 6px)' 
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
              transition={{ duration: 0.3 }}
            >
              <DashboardPage />
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsUI />
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
        "relative z-10 flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all duration-300",
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
