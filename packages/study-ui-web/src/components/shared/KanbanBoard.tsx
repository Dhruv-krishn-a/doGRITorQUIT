"use client";

import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Unit } from '@gritorquit/study-core';
import { UnitCard } from './UnitCard';
import { LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanBoardProps {
  units: Unit[];
  onAction: (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: any) => void;
  onDragEnd: (result: any) => void;
}

export function KanbanBoard({ units, onAction, onDragEnd }: KanbanBoardProps) {
  const columns = {
    LEFT: units.filter(u => u.status === 'BACKLOG'),
    THIS_WEEK: units.filter(u => u.status === 'THIS_WEEK'),
    TODAY: units.filter(u => u.status === 'TODAY'),
    STUDYING: units.filter(u => u.status === 'IN_PROGRESS'),
    REVISE: units.filter(u => (u.status === 'COMPLETED' || u.status === 'DONE') && (u.confidenceRating || 0) <= 2),
    DONE: units.filter(u => (u.status === 'COMPLETED' || u.status === 'DONE') && (u.confidenceRating || 0) >= 3)
  };

  // Premium Theme Mapping for the glassmorphic look
  const themeStyles = {
    backlog: { bg: 'bg-[var(--bg-secondary)]/30', border: 'border-[var(--border-color)]', text: 'text-[var(--text-secondary)]', textMuted: 'text-[var(--text-secondary)]/40', dragBg: 'bg-[var(--bg-secondary)]/80 border-[var(--accent-color)]/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]', dot: 'bg-[var(--text-secondary)]/40' },
    thisWeek: { bg: 'bg-sky-500/5', border: 'border-sky-500/20', text: 'text-sky-500', textMuted: 'text-sky-500/40', dragBg: 'bg-sky-500/10 border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.1)]', dot: 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]' },
    today: { bg: 'bg-[var(--accent-color)]/5', border: 'border-[var(--accent-color)]/20', text: 'text-[var(--accent-color)]', textMuted: 'text-[var(--accent-color)]/40', dragBg: 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]', dot: 'bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)]' },
    active: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', text: 'text-indigo-400', textMuted: 'text-indigo-400/40', dragBg: 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]', dot: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' },
    review: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-500', textMuted: 'text-amber-500/40', dragBg: 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]', dot: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
    done: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-500', textMuted: 'text-emerald-500/40', dragBg: 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]', dot: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' }
  };

  const columnConfigs = [
    { id: 'LEFT', label: 'Backlog', theme: themeStyles.backlog },
    { id: 'THIS_WEEK', label: 'Week', theme: themeStyles.thisWeek },
    { id: 'TODAY', label: 'Today', theme: themeStyles.today },
    { id: 'STUDYING', label: 'Active', theme: themeStyles.active },
    { id: 'REVISE', label: 'Review', theme: themeStyles.review },
    { id: 'DONE', label: 'Resolved', theme: themeStyles.done }
  ];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-4 items-start w-full overflow-hidden text-left">
        {columnConfigs.map((col) => {
          const allColUnits = (columns as any)[col.id] as Unit[];
          const isEmpty = allColUnits.length === 0;

          return (
            <div 
              key={col.id} 
              className={`flex flex-col h-[70vh] min-h-[550px] transition-all duration-300 ${isEmpty ? 'flex-[0.5] md:flex-[0.8]' : 'flex-1 md:flex-[1.5]'} min-w-0`}
            >
              
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2 shrink-0 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1.5 h-4 shrink-0 rounded-full ${col.theme.dot} transition-all duration-300`} />
                  <h3 className={`text-[10px] font-black ${col.theme.text} uppercase tracking-[0.2em] truncate italic`}>{col.label}</h3>
                </div>
                <div className={`flex shrink-0 items-center justify-center min-w-[24px] h-[24px] px-2 rounded-lg border ${col.theme.border} bg-[var(--bg-card)] shadow-sm`}>
                  <span className={`text-[10px] font-black ${col.theme.text} italic`}>
                    {allColUnits.length}
                  </span>
                </div>
              </div>
              
              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col flex-1 rounded-[2.5rem] p-3 transition-all duration-300 border backdrop-blur-md overflow-y-auto no-scrollbar ${
                      snapshot.isDraggingOver 
                        ? col.theme.dragBg 
                        : `${col.theme.bg} ${col.theme.border} shadow-inner`
                    }`}
                  >
                    <div className="flex-1 flex flex-col gap-3">
                      <AnimatePresence mode="popLayout">
                        {allColUnits.length > 0 ? (
                          allColUnits.map((unit: Unit, index: number) => (
                            <UnitCard 
                              key={unit.id} 
                              unit={unit} 
                              index={index} 
                              onAction={onAction}
                            />
                          ))
                        ) : (
                          /* Empty State Placeholder */
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center p-6 opacity-20"
                          >
                            <LayoutGrid size={32} strokeWidth={1} className={`mb-4 ${col.theme.text}`} />
                            {!isEmpty || snapshot.isDraggingOver ? (
                              <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${col.theme.text}`}>Add Step</span>
                            ) : (
                              <div className="flex flex-col gap-1 truncate w-full px-4">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${col.theme.text} truncate`}>Zero Neural Load</span>
                                <span className={`text-[7px] font-black uppercase tracking-[0.3em] italic ${col.theme.text} opacity-60 truncate`}>Awaiting Sequence</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}