"use client";

import React, { useState, useEffect } from "react";
import { Task } from "@/types/plan";
import { 
  CheckCircle2, Clock, Trash2, Edit2, Play, Pause, Save 
} from "lucide-react";
import TaskCompletionModal from "./TaskCompletionModal";

// ✅ Extended the base Task type to include the missing property locally
type ExtendedTask = Task & { timeSpentMinutes?: number };

interface TaskItemProps {
  task: ExtendedTask;
  onUpdate: (taskId: string, updates: Partial<ExtendedTask>) => void;
  onDelete: (taskId: string) => void;
  onLogTime: (taskId: string, minutes: number) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
}

export default function TaskItem({ task, onUpdate, onDelete, onLogTime, onToggleSubtask }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  // Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      const minutes = Math.ceil(sessionSeconds / 60);
      if (minutes > 0) onLogTime(task.id, minutes);
      setSessionSeconds(0);
    } else {
      setIsTimerRunning(true);
    }
  };

  const handleCheckboxClick = () => {
    if (task.status === "Completed") {
      onUpdate(task.id, { status: "Pending" });
    } else {
      setShowCompleteModal(true);
    }
  };

  const confirmCompletion = (finalMinutes: number) => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setSessionSeconds(0);
    }
    
    const currentTotal = task.timeSpentMinutes || 0;
    const minutesToAdd = finalMinutes - currentTotal;
    
    if (minutesToAdd > 0) {
      onLogTime(task.id, minutesToAdd);
    }

    onUpdate(task.id, { status: "Completed" });
    setShowCompleteModal(false);
  };

  const isCompleted = task.status === "Completed";

  return (
    <>
      <div className={`group relative bg-[#14030b] border transition-all duration-300 rounded-2xl ${
        isCompleted ? "opacity-50 border-rose-900/20" : "hover:border-rose-500/40 border-rose-900/40 shadow-lg shadow-black/40"
      } ${isTimerRunning ? "ring-2 ring-rose-500 border-transparent" : ""}`}>
        
        {/* Active Timer Indicator */}
        {isTimerRunning && (
          <div className="transform-gpu absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
        )}

        <div className="transform-gpu p-4 flex items-start gap-4">
          {/* Checkbox */}
          <button 
            onClick={handleCheckboxClick}
            className={`mt-1 min-w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isCompleted 
                ? "bg-rose-500 border-rose-500 scale-100" 
                : "border-rose-900/60 hover:border-rose-500 hover:scale-110"
            }`}
          >
            {isCompleted && <CheckCircle2 size={14} className="transform-gpu text-white" />}
          </button>

          <div className="transform-gpu flex-1 min-w-0">
            {/* Title Row */}
            <div className="transform-gpu flex justify-between items-start mb-1">
              {isEditing ? (
                <div className="transform-gpu flex gap-2 w-full">
                  <input 
                    className="transform-gpu flex-1 bg-[#0a0105] border border-rose-900/40 rounded px-2 py-1 text-sm font-bold text-rose-50 focus:outline-none focus:border-rose-500"
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    autoFocus
                  />
                  <button onClick={() => { onUpdate(task.id, { title: editTitle }); setIsEditing(false); }} className="transform-gpu text-emerald-500 hover:text-emerald-400"><Save size={16}/></button>
                </div>
              ) : (
                <h3 className={`text-[14px] font-bold leading-snug tracking-tight ${isCompleted ? "line-through text-rose-500/40" : "text-rose-50"}`}>
                  {task.title}
                </h3>
              )}
            </div>

            {/* Metadata Row */}
            <div className="transform-gpu flex items-center gap-3 mt-2">
              {isTimerRunning ? (
                <div className="transform-gpu flex items-center gap-2 bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                  <Clock size={10} />
                  {Math.floor(sessionSeconds / 60)}:{(sessionSeconds % 60).toString().padStart(2,'0')}
                </div>
              ) : (
                <div className="transform-gpu flex items-center gap-1.5 text-[10px] font-bold text-rose-400/60 uppercase tracking-widest bg-[#1c0510] px-2 py-0.5 rounded border border-rose-900/40">
                  <Clock size={10} />
                  <span>
                    {Math.floor((task.timeSpentMinutes || 0) / 60)}H {(task.timeSpentMinutes || 0) % 60}M
                  </span>
                  {task.estimatedMinutes && (
                    <span className="transform-gpu text-rose-900/60">/ {task.estimatedMinutes}M</span>
                  )}
                </div>
              )}
              {task.priority && !isCompleted && (
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border ${
                  task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  'bg-rose-500/10 text-rose-400/60 border-rose-500/20'
                }`}>
                  {task.priority}
                </div>
              )}
            </div>

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="transform-gpu mt-3 space-y-1.5 pl-1">
                {task.subtasks.map(st => (
                  <div key={st.id} 
                    className="transform-gpu flex items-center gap-2 text-xs font-bold text-rose-200/50 hover:text-rose-200 transition-colors cursor-pointer group/st"
                    onClick={() => onToggleSubtask(st.id, !st.completed)}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${st.completed ? "bg-rose-500/40 border-rose-500/40" : "border-rose-900/60"}`}>
                      {st.completed && <CheckCircle2 size={10} className="transform-gpu text-rose-50" />}
                    </div>
                    <span className={st.completed ? "line-through opacity-30" : ""}>{st.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex flex-col gap-1.5 ${isCompleted ? "invisible" : ""}`}>
            <button 
              onClick={handleToggleTimer}
              className={`p-2.5 rounded-xl transition-all border ${
                isTimerRunning 
                  ? "bg-rose-500/20 text-rose-500 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]" 
                  : "bg-[#1c0510] text-rose-400/40 hover:text-rose-400 border-rose-900/40 hover:border-rose-500/40"
              }`}
              title={isTimerRunning ? "Stop Timer" : "Start Timer"}
            >
              {isTimerRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            
            <button onClick={() => setIsEditing(true)} className="transform-gpu p-2.5 text-rose-400/30 hover:text-rose-400 hover:bg-[#1c0510] rounded-xl transition-all border border-transparent hover:border-rose-900/40">
              <Edit2 size={14} />
            </button>
            
            <button onClick={() => onDelete(task.id)} className="transform-gpu p-2.5 text-rose-400/30 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all border border-transparent hover:border-red-900/40">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <TaskCompletionModal 
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={confirmCompletion}
        taskTitle={task.title}
        loggedMinutes={(task.timeSpentMinutes || 0) + Math.ceil(sessionSeconds / 60)}
      />
    </>
  );
}
