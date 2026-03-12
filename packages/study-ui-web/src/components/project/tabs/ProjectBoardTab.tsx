import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Search, Filter } from 'lucide-react';
import { Unit } from '@planner/study-core';
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
      className="transform-gpu h-full flex flex-col p-8"
    >
      <div className="transform-gpu flex items-center justify-between mb-8">
        <div className="transform-gpu flex items-center gap-4">
          <h2 className="transform-gpu text-2xl font-bold text-slate-900 uppercase tracking-tight">Project Board</h2>
          <div className="transform-gpu flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            <button 
              onClick={() => setViewMode('KANBAN')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'KANBAN' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'LIST' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
        
        <div className="transform-gpu flex items-center gap-3">
          <div className="transform-gpu relative group">
            <Search size={14} className="transform-gpu absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
            <input type="text" placeholder="Filter tasks..." className="transform-gpu bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-rose-300 focus:shadow-md outline-none transition-all placeholder:text-slate-400" />
          </div>
          <button className="transform-gpu p-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"><Filter size={18} /></button>
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
