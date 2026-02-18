// apps/web/features/study/components/EnergySelector.tsx
"use client";

import React from 'react';
import { Zap, LucideIcon } from 'lucide-react';
import { EnergyLevel } from '@prisma/client';

interface EnergySelectorProps {
  currentLevel: EnergyLevel;
  onSelect: (level: EnergyLevel) => void;
}

export const EnergySelector: React.FC<EnergySelectorProps> = ({ currentLevel, onSelect }) => {
  const levels: { id: EnergyLevel; label: string; color: string; icon: LucideIcon }[] = [
    { id: 'LOW', label: 'Low Energy', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Zap },
    { id: 'MEDIUM', label: 'Optimal', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Zap },
    { id: 'HIGH', label: 'Hyper Focus', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: Zap },
  ];

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Cognitive State</label>
      <div className="flex gap-3">
        {levels.map((level) => {
          const Icon = level.icon;
          const isActive = currentLevel === level.id;
          return (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 text-xs font-black transition-all duration-300 ${
                isActive 
                  ? `${level.color} shadow-lg shadow-current/5 scale-105 border-current` 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
              }`}
            >
              <Icon size={14} fill={isActive ? "currentColor" : "none"} className={isActive ? 'opacity-80' : 'text-slate-300'} />
              <span className="uppercase tracking-tight">{level.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
