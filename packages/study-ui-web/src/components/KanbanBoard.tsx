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
      <div className="flex overflow-x-auto pb-10 gap-6 custom-scrollbar h-full items-start min-h-[600px]">
        {columnConfigs.map((col) => (
          <div key={col.id} className="flex flex-col w-[320px] shrink-0 h-full">
            <div className="flex items-center justify-between mb-6 px-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{col.label}</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-xl shadow-sm">
                {(columns as any)[col.id].length}
              </span>
            </div>
            
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-h-[400px] overflow-y-auto custom-scrollbar rounded-[2.5rem] p-3 transition-all duration-500 border border-transparent ${
                    snapshot.isDraggingOver ? `${col.color} border-slate-200/50 shadow-inner` : 'bg-slate-50/40'
                  }`}
                >
                  <div className="space-y-4">
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
