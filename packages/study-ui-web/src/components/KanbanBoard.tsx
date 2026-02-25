"use client";

import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Unit } from '@planner/study-core';
import { UnitCard } from './UnitCard';

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

  const columnConfigs = [
    { id: 'LEFT', label: 'Left', color: 'bg-slate-50', dotColor: 'bg-slate-300' },
    { id: 'THIS_WEEK', label: 'This Week', color: 'bg-blue-50', dotColor: 'bg-blue-500' },
    { id: 'TODAY', label: 'Today', color: 'bg-indigo-50', dotColor: 'bg-indigo-500' },
    { id: 'STUDYING', label: 'Studying', color: 'bg-rose-50', dotColor: 'bg-rose-500' },
    { id: 'DONE', label: 'Completed', color: 'bg-emerald-50', dotColor: 'bg-emerald-500' },
    { id: 'REVISE', label: 'Needs Revision', color: 'bg-amber-50', dotColor: 'bg-amber-500' }
  ];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-3 items-start min-h-[600px] w-full pb-10 overflow-x-auto md:overflow-x-visible">
        {columnConfigs.map((col) => (
          <div key={col.id} className="flex flex-col h-full w-full md:flex-1 min-w-[160px] md:min-w-0">
            <div className="flex items-center justify-between mb-4 px-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dotColor} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                <h3 className="text-[9px] font-black text-rose-100/70 uppercase tracking-widest truncate">{col.label}</h3>
              </div>
              <span className="text-[8px] font-black text-rose-400/50 bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg shadow-sm">
                {(columns as any)[col.id].length}
              </span>
            </div>
            
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-h-[400px] rounded-3xl p-2 transition-all duration-500 border ${
                    snapshot.isDraggingOver 
                      ? 'bg-rose-500/5 border-rose-500/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]' 
                      : 'bg-[#14030b]/40 border-white/5'
                  }`}
                >
                  <div className="space-y-3">
                    {(columns as any)[col.id].map((unit: Unit, index: number) => (
                      <UnitCard 
                        key={unit.id} 
                        unit={unit} 
                        index={index} 
                        onAction={onAction}
                      />
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
