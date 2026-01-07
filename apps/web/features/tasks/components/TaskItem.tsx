// apps/web/features/tasks/components/TaskItem.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Task } from "@/types/plan";
import { 
  CheckCircle2, Clock, Trash2, Edit2, Play, Pause, Save, X, Circle 
} from "lucide-react";
import TaskCompletionModal from "./TaskCompletionModal";

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, updates: any) => void;
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
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      // Stop Timer -> Save immediately
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
      // If unchecking, just do it directly
      onUpdate(task.id, { status: "Pending" });
    } else {
      // If completing, open modal to confirm time
      setShowCompleteModal(true);
    }
  };

  const confirmCompletion = (finalMinutes: number) => {
    // 1. If timer was running, stop it and add its time logic
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setSessionSeconds(0);
    }
    
    // 2. Add any manual time user entered (subtracting what was already logged if needed, 
    //    but our modal logic just sends 'total', so we calculate diff or just update)
    //    Here we just log the *extra* time if any, or rely on the modal's logic.
    //    Actually, let's keep it simple: We log the session time + manual time.
    
    // Calculate difference between new total and existing recorded time
    const currentTotal = task.timeSpentMinutes || 0;
    const minutesToAdd = finalMinutes - currentTotal;
    
    if (minutesToAdd > 0) {
      onLogTime(task.id, minutesToAdd);
    }

    // 3. Mark Complete
    onUpdate(task.id, { status: "Completed" });
    setShowCompleteModal(false);
  };

  const isCompleted = task.status === "Completed";

  return (
    <>
      <div className={`group relative bg-white border rounded-xl transition-all duration-300 ${
        isCompleted ? "opacity-60 bg-gray-50 border-gray-100" : "hover:shadow-md border-slate-200"
      } ${isTimerRunning ? "ring-2 ring-blue-500 border-transparent shadow-lg" : ""}`}>
        
        {/* Active Timer Indicator (Pulse) */}
        {isTimerRunning && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}

        <div className="p-4 flex items-start gap-4">
          {/* Checkbox */}
          <button 
            onClick={handleCheckboxClick}
            className={`mt-1 min-w-[24px] h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isCompleted 
                ? "bg-green-500 border-green-500 scale-100" 
                : "border-slate-300 hover:border-green-500 hover:scale-110"
            }`}
          >
            {isCompleted && <CheckCircle2 size={14} className="text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex justify-between items-start mb-1">
              {isEditing ? (
                <div className="flex gap-2 w-full">
                  <input 
                    className="flex-1 border rounded px-2 py-1 text-sm font-medium"
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    autoFocus
                  />
                  <button onClick={() => { onUpdate(task.id, { title: editTitle }); setIsEditing(false); }} className="text-green-600"><Save size={16}/></button>
                </div>
              ) : (
                <h3 className={`font-medium text-slate-800 leading-snug ${isCompleted ? "line-through text-slate-400" : ""}`}>
                  {task.title}
                </h3>
              )}
            </div>

            {/* Time Badge / Timer */}
            <div className="flex items-center gap-3 mt-2">
              {isTimerRunning ? (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-mono font-bold animate-pulse">
                  <Clock size={12} />
                  {Math.floor(sessionSeconds / 60)}:{(sessionSeconds % 60).toString().padStart(2,'0')}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                  <Clock size={12} />
                  <span>
                    {Math.floor((task.timeSpentMinutes || 0) / 60)}h {(task.timeSpentMinutes || 0) % 60}m
                  </span>
                  {task.estimatedMinutes && (
                    <span className="text-slate-300">/ {task.estimatedMinutes}m</span>
                  )}
                </div>
              )}
            </div>

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-3 space-y-1 pl-1">
                {task.subtasks.map(st => (
                  <div key={st.id} 
                    className="flex items-center gap-2 text-xs text-slate-600 hover:bg-slate-50 p-1 -ml-1 rounded cursor-pointer group/st"
                    onClick={() => onToggleSubtask(st.id, !st.completed)}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${st.completed ? "bg-slate-400 border-slate-400" : "border-slate-300"}`}>
                      {st.completed && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <span className={st.completed ? "line-through opacity-50" : ""}>{st.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons (Right Side) */}
          <div className={`flex flex-col gap-1 ${isCompleted ? "invisible" : ""}`}>
            <button 
              onClick={handleToggleTimer}
              className={`p-2 rounded-lg transition-all ${
                isTimerRunning 
                  ? "bg-red-50 text-red-500 hover:bg-red-100" 
                  : "bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
              }`}
              title={isTimerRunning ? "Stop Timer" : "Start Timer"}
            >
              {isTimerRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
              <Edit2 size={16} />
            </button>
            
            <button onClick={() => onDelete(task.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 size={16} />
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