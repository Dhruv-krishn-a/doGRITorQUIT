"use client";

import React, { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Unit } from '@planner/study-core';
import { UnitCard } from './UnitCard';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanBoardProps {
  units: Unit[];
  onAction: (type: 'SESSION' | 'TIMER' | 'COMPLETE', unit: any) => void;
  onDragEnd: (result: any) => void;
}

const ITEMS_PER_PAGE = 4;

export function KanbanBoard({ units, onAction, onDragEnd }: KanbanBoardProps) {
  // Pagination state mapping column ID to current page index
  const [pages, setPages] = useState<Record<string, number>>({
    LEFT: 0, THIS_WEEK: 0, TODAY: 0, STUDYING: 0, REVISE: 0, DONE: 0
  });

  const handlePageChange = (colId: string, direction: 'NEXT' | 'PREV', maxPage: number) => {
    setPages(prev => {
      const current = prev[colId] || 0;
      const next = direction === 'NEXT' ? Math.min(current + 1, maxPage) : Math.max(0, current - 1);
      return { ...prev, [colId]: next };
    });
  };

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
      <div className="transform-gpu flex flex-col md:flex-row gap-5 items-start w-full pb-10 overflow-x-auto md:overflow-x-visible snap-x custom-scrollbar">
        {columnConfigs.map((col) => {
          const allColUnits = (columns as any)[col.id] as Unit[];
          const totalPages = Math.ceil(allColUnits.length / ITEMS_PER_PAGE);
          
          // Safety check in case items are moved and the page index goes out of bounds
          const rawPage = pages[col.id] || 0;
          const safePage = Math.min(rawPage, Math.max(0, totalPages - 1));
          
          // Slice the items for pagination
          const visibleUnits = allColUnits.slice(safePage * ITEMS_PER_PAGE, (safePage + 1) * ITEMS_PER_PAGE);

          return (
            <div key={col.id} className="transform-gpu flex flex-col h-full w-full md:flex-1 min-w-[280px] md:min-w-0 snap-center">
              
              {/* Column Header */}
              <div className="transform-gpu flex items-center justify-between mb-4 px-2 shrink-0 group">
                <div className="transform-gpu flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.theme.dot} shadow-lg group-hover:animate-pulse transition-all duration-300`} />
                  <h3 className={`text-[10px] font-bold ${col.theme.text} uppercase tracking-widest truncate`}>{col.label}</h3>
                </div>
                <div className={`flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded-lg border ${col.theme.border} bg-white/60 backdrop-blur-sm shadow-sm`}>
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
                    className={`flex flex-col flex-1 min-h-[450px] rounded-[2.5rem] p-3 transition-all duration-500 border backdrop-blur-xl transform-gpu ${
                      snapshot.isDraggingOver 
                        ? col.theme.dragBg 
                        : `${col.theme.bg} ${col.theme.border} shadow-sm`
                    }`}
                  >
                    <div className="transform-gpu flex-1">
                      <AnimatePresence mode="popLayout">
                        {visibleUnits.length > 0 ? (
                          visibleUnits.map((unit: Unit, index: number) => (
                            <UnitCard 
                              key={unit.id} 
                              unit={{...unit, orderIndex: units.findIndex(u => u.id === unit.id)}} 
                              index={index} 
                              onAction={onAction}
                            />
                          ))
                        ) : (
                          /* Empty State Placeholder */
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="transform-gpu h-full min-h-[150px] flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-white/40 rounded-3xl mt-2"
                          >
                            <LayoutGrid size={24} className={`${col.theme.textMuted} mb-2 opacity-40`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${col.theme.textMuted} opacity-60`}>Drop Here</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>

                    {/* Glassmorphic Pagination Controls */}
                    {totalPages > 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="transform-gpu flex items-center justify-between mt-4 px-4 py-3 bg-white/80 border border-white rounded-2xl shadow-sm backdrop-blur-md"
                      >
                        <button 
                          onClick={() => handlePageChange(col.id, 'PREV', totalPages - 1)} 
                          disabled={safePage === 0}
                          className="transform-gpu p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all active:scale-95"
                        >
                          <ChevronLeft size={16} strokeWidth={3} />
                        </button>
                        
                        <div className="transform-gpu flex items-center gap-1">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${col.theme.text}`}>{safePage + 1}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${col.theme.textMuted}`}>/ {totalPages}</span>
                        </div>

                        <button 
                          onClick={() => handlePageChange(col.id, 'NEXT', totalPages - 1)} 
                          disabled={safePage === totalPages - 1}
                          className="transform-gpu p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all active:scale-95"
                        >
                          <ChevronRight size={16} strokeWidth={3} />
                        </button>
                      </motion.div>
                    )}
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