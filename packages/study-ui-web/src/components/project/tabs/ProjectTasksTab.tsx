import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectContextProps } from '../types';
import { Unit } from '@planner/study-core';

interface ProjectTasksTabProps extends Pick<ProjectContextProps, 'units' | 'phases'> {
  trackId: string;
  addUnit: (trackId: string, unit: any) => Promise<void>;
  updateUnit: (unitId: string, updates: any) => Promise<void>;
  deleteUnit: (unitId: string) => Promise<boolean>;
}

export function ProjectTasksTab({ trackId, units, phases, addUnit, updateUnit, deleteUnit }: ProjectTasksTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    phase: 'Default',
    status: 'BACKLOG',
    priority: 'Medium',
    durationMinutes: 30
  });

  const phaseOptions = Object.keys(phases).length > 0 ? Object.keys(phases) : ['Default'];

  const handleEditClick = (unit: Unit) => {
    setEditingId(unit.id);
    setFormData({
      title: unit.title,
      phase: (unit.metadata as any)?.phase || phaseOptions[0] || 'Default',
      status: unit.status,
      priority: (unit.metadata as any)?.priority || 'Medium',
      durationMinutes: unit.durationMinutes || 0
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async (unit?: Unit | null) => {
    if (!formData.title.trim()) {
      toast.error('Task name is required');
      return;
    }

    try {
      if (unit && unit.id) {
        // Merge existing metadata to preserve other fields
        const existingMetadata = (unit.metadata as Record<string, any>) || {};
        await updateUnit(unit.id, {
          title: formData.title,
          status: formData.status,
          durationMinutes: formData.durationMinutes,
          metadata: { ...existingMetadata, phase: formData.phase, priority: formData.priority }
        });
      } else {
        await addUnit(trackId, {
          title: formData.title,
          type: 'TASK',
          status: formData.status,
          durationMinutes: formData.durationMinutes,
          metadata: { phase: formData.phase, priority: formData.priority }
        });
      }
      handleCancel();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (unitId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteUnit(unitId);
    }
  };

  const renderRow = (unit: Unit | null, index: number, isEditing: boolean) => {
    if (isEditing) {
      return (
        <div key={unit ? unit.id : 'new'} className="transform-gpu grid grid-cols-[40px_1fr_120px_120px_100px_100px_100px_70px] gap-4 px-8 py-4 border-b border-rose-200 bg-rose-50/50 items-center">
          <div className="transform-gpu text-[10px] font-bold text-slate-400">{unit ? String(index + 1).padStart(2, '0') : '+'}</div>
          <input 
            autoFocus
            type="text" 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 focus:border-rose-400 outline-none shadow-sm"
            placeholder="Task name..."
          />
          <select 
            value={formData.phase} 
            onChange={e => setFormData({ ...formData, phase: e.target.value })}
            className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-800 focus:border-rose-400 outline-none uppercase shadow-sm"
          >
            {phaseOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select 
            value={formData.status} 
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-800 focus:border-rose-400 outline-none uppercase shadow-sm"
          >
            <option value="BACKLOG">BACKLOG</option>
            <option value="THIS_WEEK">THIS WEEK</option>
            <option value="TODAY">TODAY</option>
            <option value="IN_PROGRESS">IN PROG</option>
            <option value="DONE">DONE</option>
          </select>
          <select 
            value={formData.priority} 
            onChange={e => setFormData({ ...formData, priority: e.target.value })}
            className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-800 focus:border-rose-400 outline-none uppercase shadow-sm"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <div className="transform-gpu flex items-center gap-1">
            <input 
              type="number" 
              value={formData.durationMinutes} 
              onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
              className="transform-gpu w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-800 focus:border-rose-400 outline-none text-right shadow-sm"
            />
            <span className="transform-gpu text-[10px] text-slate-500 font-bold">m</span>
          </div>
          <div className="transform-gpu text-[10px] font-bold text-slate-400">{unit?.actualTimeSpentMinutes || 0}m</div>
          <div className="transform-gpu flex items-center gap-2">
            <button onClick={() => handleSave(unit)} className="transform-gpu p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-md transition-colors"><Save size={14} /></button>
            <button onClick={handleCancel} className="transform-gpu p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-md transition-colors"><X size={14} /></button>
          </div>
        </div>
      );
    }

    if (!unit) return null;

    return (
      <div key={unit.id} className="transform-gpu grid grid-cols-[40px_1fr_120px_120px_100px_100px_100px_70px] gap-4 px-8 py-5 border-b border-slate-100 hover:bg-rose-50/30 transition-colors group items-center cursor-default">
        <div className="transform-gpu text-[10px] font-bold text-slate-400 group-hover:text-rose-500">{String(index + 1).padStart(2, '0')}</div>
        <div className="transform-gpu text-sm font-bold text-slate-800 truncate pr-4">{unit.title}</div>
        <div className="transform-gpu text-[10px] font-bold text-slate-500 uppercase truncate">{(unit.metadata as { phase?: string })?.phase || 'Default'}</div>
        <div>
          <span className={`text-[8px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest border shadow-sm ${
            unit.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            unit.status === 'IN_PROGRESS' ? 'bg-rose-50 text-rose-600 border-rose-200' :
            'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            {unit.status.replace('_', ' ')}
          </span>
        </div>
        <div className="transform-gpu text-[10px] font-bold text-slate-500 uppercase">{(unit.metadata as { priority?: string })?.priority || 'Medium'}</div>
        <div className="transform-gpu text-[10px] font-bold text-slate-500">{unit.durationMinutes || 0}m</div>
        <div className="transform-gpu text-[10px] font-bold text-emerald-600">{unit.actualTimeSpentMinutes || 0}m</div>
        <div className="transform-gpu flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => handleEditClick(unit)} 
            className="transform-gpu p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Task"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => handleDelete(unit.id, unit.title)} 
            className="transform-gpu p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      key="tasks"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="transform-gpu p-8 h-full flex flex-col"
    >
      <div className="transform-gpu flex items-center justify-between mb-8">
        <h2 className="transform-gpu text-2xl font-bold text-slate-900 uppercase tracking-tight">Task List</h2>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ title: '', phase: phaseOptions[0] || 'Default', status: 'BACKLOG', priority: 'Medium', durationMinutes: 30 });
          }}
          className="transform-gpu flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          disabled={isAdding}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="transform-gpu flex-1 bg-white border border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col">
        <div className="transform-gpu grid grid-cols-[40px_1fr_120px_120px_100px_100px_100px_70px] gap-4 px-8 py-5 bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] shrink-0">
          <div>#</div>
          <div>Task Name</div>
          <div>Phase</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Estimate</div>
          <div>Logged</div>
          <div>Actions</div>
        </div>
        
        <div className="transform-gpu flex-1 overflow-y-auto no-scrollbar pb-10">
          {isAdding && renderRow(null, units.length, true)}
          {units.map((unit, i) => renderRow(unit, i, editingId === unit.id))}
          {units.length === 0 && !isAdding && (
            <div className="transform-gpu p-10 text-center text-slate-400 font-bold text-sm">
              No tasks yet. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
