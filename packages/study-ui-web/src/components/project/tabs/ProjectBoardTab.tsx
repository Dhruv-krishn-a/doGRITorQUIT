import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Search, Filter } from 'lucide-react';
import { Unit } from '@gritorquit/study-core';
import { KanbanBoard } from '../../shared/KanbanBoard';
import { UnitCard } from '../../shared/UnitCard';

interface ProjectBoardTabProps {
  units: Unit[];
  viewMode: 'KANBAN' | 'LIST';
  setViewMode: (mode: 'KANBAN' | 'LIST') => void;
  handleAction: (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: Unit) => void;
  handleDragEnd: (result: any) => void;
}

export function ProjectBoardTab({ units, viewMode, setViewMode, handleAction, handleDragEnd }: ProjectBoardTabProps) {
  return (
    <motion.div 
      key="board"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="transform-gpu h-full flex flex-col p-8 text-left"
    >
      <div className="transform-gpu flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="transform-gpu flex items-center gap-6">
          <h2 className="transform-gpu text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Project Board</h2>
          <div className="transform-gpu flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-xl shadow-inner">
            <button 
              onClick={() => setViewMode('KANBAN')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm' : 'text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)]'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm' : 'text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)]'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
        
        <div className="transform-gpu flex items-center gap-4">
          <div className="transform-gpu relative group flex-1 md:flex-none">
            <Search size={14} className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]/40 group-focus-within:text-[var(--accent-color)] transition-colors" />
            <input type="text" placeholder="FILTER VECTORS..." className="transform-gpu w-full md:w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-inner rounded-xl pl-11 pr-4 py-3 text-[10px] font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 outline-none transition-all placeholder:text-[var(--text-secondary)]/20 italic tracking-widest" />
          </div>
          <button className="transform-gpu p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 transition-all active:scale-95"><Filter size={20} /></button>
        </div>
      </div>

      <div className="transform-gpu flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'KANBAN' ? (
            <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="transform-gpu h-full">
              <KanbanBoard 
                units={units} 
                onAction={handleAction}
                onDragEnd={handleDragEnd}
              />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="transform-gpu grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto no-scrollbar pb-10">
              {units.map((unit, idx) => (
                <UnitCard 
                  key={unit.id}
                  unit={unit}
                  index={idx}
                  onAction={handleAction}
                  isDraggable={false}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
