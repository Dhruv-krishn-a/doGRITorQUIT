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
    slate: { bg: 'bg-slate-50/60', border: 'border-slate-200/60', text: 'text-slate-800', textMuted: 'text-slate-400', dragBg: 'bg-slate-100/90 border-slate-300 shadow-[0_0_30px_rgba(148,163,184,0.2)]', dot: 'bg-slate-400 shadow-slate-400/40' },
    indigo: { bg: 'bg-indigo-50/60', border: 'border-indigo-200/60', text: 'text-indigo-800', textMuted: 'text-indigo-400', dragBg: 'bg-indigo-100/90 border-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.2)]', dot: 'bg-indigo-400 shadow-indigo-400/40' },
    fuchsia: { bg: 'bg-fuchsia-50/60', border: 'border-fuchsia-200/60', text: 'text-fuchsia-800', textMuted: 'text-fuchsia-400', dragBg: 'bg-fuchsia-100/90 border-fuchsia-300 shadow-[0_0_30px_rgba(217,70,239,0.2)]', dot: 'bg-fuchsia-400 shadow-fuchsia-400/40' },
    rose: { bg: 'bg-rose-50/60', border: 'border-rose-200/60', text: 'text-rose-800', textMuted: 'text-rose-400', dragBg: 'bg-rose-100/90 border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.2)]', dot: 'bg-rose-400 shadow-rose-400/40' },
    amber: { bg: 'bg-amber-50/60', border: 'border-amber-200/60', text: 'text-amber-800', textMuted: 'text-amber-400', dragBg: 'bg-amber-100/90 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]', dot: 'bg-amber-400 shadow-amber-400/40' },
    emerald: { bg: 'bg-emerald-50/60', border: 'border-emerald-200/60', text: 'text-emerald-800', textMuted: 'text-emerald-400', dragBg: 'bg-emerald-100/90 border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]', dot: 'bg-emerald-400 shadow-emerald-400/40' }
  };

  const columnConfigs = [
    { id: 'LEFT', label: 'Backlog', theme: themeStyles.slate },
    { id: 'THIS_WEEK', label: 'This Week', theme: themeStyles.indigo },
    { id: 'TODAY', label: 'Today', theme: themeStyles.fuchsia },
    { id: 'STUDYING', label: 'Active', theme: themeStyles.rose },
    { id: 'REVISE', label: 'Review', theme: themeStyles.amber },
    { id: 'DONE', label: 'Mastered', theme: themeStyles.emerald }
  ];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-2 items-start w-full overflow-hidden">
        {columnConfigs.map((col) => {
          const allColUnits = (columns as any)[col.id] as Unit[];
          const isEmpty = allColUnits.length === 0;

          return (
            <div 
              key={col.id} 
              className={`flex flex-col h-[70vh] min-h-[500px] transition-all duration-300 ${isEmpty ? 'flex-[0.5] md:flex-[0.8]' : 'flex-1 md:flex-[1.5]'} min-w-0`}
            >
              
              {/* Column Header */}
              <div className="flex items-center justify-between mb-2 px-2 shrink-0 group">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 shrink-0 rounded-full ${col.theme.dot} shadow-sm transition-all duration-300`} />
                  <h3 className={`text-[10px] font-bold ${col.theme.text} uppercase tracking-widest truncate`}>{col.label}</h3>
                </div>
                <div className={`flex shrink-0 items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-md border ${col.theme.border} bg-white/60 backdrop-blur-sm shadow-sm`}>
                  <span className={`text-[9px] font-bold ${col.theme.textMuted}`}>
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
                    className={`flex flex-col flex-1 rounded-2xl p-2 transition-all duration-300 border backdrop-blur-md overflow-y-auto custom-scrollbar ${
                      snapshot.isDraggingOver 
                        ? col.theme.dragBg 
                        : `${col.theme.bg} ${col.theme.border} shadow-sm`
                    }`}
                  >
                    <div className="flex-1 flex flex-col gap-2">
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
                            className="h-full flex flex-col items-center justify-center text-center p-2 opacity-60"
                          >
                            <span className="text-xl mb-1">📭</span>
                            {!isEmpty || snapshot.isDraggingOver ? (
                              <span className={`text-[8px] font-bold uppercase tracking-widest ${col.theme.textMuted}`}>Drop Here</span>
                            ) : (
                              <div className="flex flex-col gap-0.5 truncate w-full px-2">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${col.theme.textMuted} truncate`}>No lessons</span>
                                <span className={`text-[7px] font-medium uppercase tracking-widest ${col.theme.textMuted} opacity-60 truncate`}>Drag here</span>
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