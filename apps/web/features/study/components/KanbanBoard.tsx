"use client";

import React from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { UnitCard } from './UnitCard';
import { Unit, UnitStatus } from '@prisma/client';
import { Layers, Zap, Play, CheckCircle2, History } from 'lucide-react';

const COLUMNS: { id: UnitStatus; title: string; icon: any; color: string }[] = [
  { id: 'BACKLOG', title: 'Backlog', icon: Layers, color: 'text-slate-400 bg-slate-100' },
  { id: 'THIS_WEEK', title: 'This Week', icon: History, color: 'text-blue-500 bg-blue-50' },
  { id: 'TODAY', title: 'Today', icon: Zap, color: 'text-rose-500 bg-rose-50' },
  { id: 'IN_PROGRESS', title: 'In Progress', icon: Play, color: 'text-amber-500 bg-amber-50' },
  { id: 'DONE', title: 'Done', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
];

interface KanbanBoardProps {
  units: Unit[];
  onMoveUnit: (unitId: string, toStatus: UnitStatus, newIndex: number) => void;
  onCompleteUnit: (unit: Unit) => void;
  onStartSession?: (unit: Unit) => void;
  onStartTimer?: (unit: Unit) => void;
  onNotesClick?: (unit: Unit) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  units, 
  onMoveUnit, 
  onCompleteUnit, 
  onStartSession,
  onStartTimer,
  onNotesClick
}) => {
  const getColumnUnits = (status: UnitStatus) => {
    return units
      .filter((u) => u.status === status)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onMoveUnit(draggableId, destination.droppableId as UnitStatus, destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-8 h-[calc(100vh-320px)] min-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent px-1 pt-2">
        {COLUMNS.map((column) => {
          const columnUnits = getColumnUnits(column.id);
          const Icon = column.icon;
          
          return (
            <div key={column.id} className="shrink-0 w-[300px] flex flex-col group/column">
              <div className="flex items-center justify-between mb-5 px-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${column.color}`}>
                    <Icon size={16} />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    {column.title}
                  </h3>
                </div>
                <span className="bg-slate-100 text-slate-500 rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-xs border border-slate-200/50">
                  {columnUnits.length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto custom-scrollbar rounded-[2rem] transition-all duration-500 p-2 border-2 border-dashed ${
                      snapshot.isDraggingOver 
                        ? 'bg-rose-50/30 border-rose-200 scale-[1.02]' 
                        : 'bg-slate-50/30 border-transparent hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1">
                      {columnUnits.map((unit, index) => (
                        <UnitCard 
                          key={unit.id} 
                          unit={unit} 
                          index={index} 
                          onComplete={onCompleteUnit}
                          onStartSession={onStartSession}
                          onStartTimer={onStartTimer}
                          onNotesClick={onNotesClick}
                        />
                      ))}
                    </div>
                    {provided.placeholder}
                    
                    {columnUnits.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-32 flex flex-col items-center justify-center text-slate-300 gap-2">
                        <div className="w-12 h-1 px-4 bg-slate-100 rounded-full opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Empty</span>
                      </div>
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
};
