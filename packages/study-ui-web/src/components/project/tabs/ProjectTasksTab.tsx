import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectContextProps } from '../types';
import { Unit } from '@gritorquit/study-core';

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
        <div key={unit ? unit.id : 'new'} className="transform-gpu grid grid-cols-[40px_1fr_120px_120px_100px_100px_100px_70px] gap-4 px-8 py-4 border-b border-[var(--accent-color)]/30 bg-[var(--accent-color)]/5 items-center">
          <div className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] opacity-40">{unit ? String(index + 1).padStart(2, '0') : '+'}</div>
          <input 
            autoFocus
            type="text" 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="transform-gpu w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/10 outline-none shadow-sm italic uppercase tracking-tight"
            placeholder="Step name..."
          />
          <select 
            value={formData.phase} 
            onChange={e => setFormData({ ...formData, phase: e.target.value })}
            className="transform-gpu w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-[10px] font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none uppercase shadow-sm italic"
          >
            {phaseOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select 
            value={formData.status} 
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            className="transform-gpu w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-[10px] font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none uppercase shadow-sm italic"
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
            className="transform-gpu w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-[10px] font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none uppercase shadow-sm italic"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <div className="transform-gpu flex items-center gap-2">
            <input 
              type="number" 
              value={formData.durationMinutes} 
              onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
              className="transform-gpu w-16 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-2 py-2 text-[10px] font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none text-right shadow-sm italic"
            />
            <span className="transform-gpu text-[10px] text-[var(--text-secondary)] font-black italic">M</span>
          </div>
          <div className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] opacity-40">{unit?.actualTimeSpentMinutes || 0}m</div>
          <div className="transform-gpu flex items-center gap-2">
            <button onClick={() => handleSave(unit)} className="transform-gpu p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20"><Save size={14} /></button>
            <button onClick={handleCancel} className="transform-gpu p-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-all border border-[var(--border-color)]"><X size={14} /></button>
          </div>
        </div>
      );
    }

    if (!unit) return null;

    return (
      <div key={unit.id} className="transform-gpu grid grid-cols-[40px_1fr_120px_120px_100px_100px_100px_70px] gap-4 px-8 py-6 border-b border-[var(--border-color)]/50 hover:bg-[var(--accent-color)]/5 transition-colors group items-center cursor-default text-left">
        <div className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] opacity-20 group-hover:text-[var(--accent-color)] group-hover:opacity-100 transition-all italic">{String(index + 1).padStart(2, '0')}</div>
        <div className="transform-gpu text-sm font-black text-[var(--text-primary)] truncate pr-4 italic uppercase tracking-tight">{unit.title}</div>
        <div className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase truncate italic opacity-60">{(unit.metadata as { phase?: string })?.phase || 'Default'}</div>
        <div>
          <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border shadow-sm italic ${
            unit.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
            unit.status === 'IN_PROGRESS' || unit.status === 'TODAY' ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/20' :
            'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]'
          }`}>
            {unit.status.replace('_', ' ')}
          </span>
        </div>
        <div className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase italic opacity-60">{(unit.metadata as { priority?: string })?.priority || 'Medium'}</div>
        <div className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] italic opacity-40">{unit.durationMinutes || 0}M</div>
        <div className="transform-gpu text-[10px] font-black text-emerald-500 italic">{unit.actualTimeSpentMinutes || 0}M</div>
        <div className="transform-gpu flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={() => handleEditClick(unit)} 
            className="transform-gpu p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 rounded-lg transition-all"
            title="Edit Step"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => handleDelete(unit.id, unit.title)} 
            className="transform-gpu p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-500/30 rounded-lg transition-all"
            title="Delete Step"
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
      className="transform-gpu p-8 h-full flex flex-col text-left"
    >
      <div className="transform-gpu flex items-center justify-between mb-10 px-2">
        <h2 className="transform-gpu text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Path Steps</h2>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ title: '', phase: phaseOptions[0] || 'Default', status: 'BACKLOG', priority: 'Medium', durationMinutes: 30 });
          }}
          className="transform-gpu flex items-center gap-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 italic"
          disabled={isAdding}
        >
          <Plus size={18} strokeWidth={3} /> New Step
        </button>
      </div>

      <div className="transform-gpu flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] overflow-hidden flex flex-col">
        <div className="transform-gpu grid grid-cols-[40px_1fr_120px_120px_100px_100px_100px_70px] gap-4 px-8 py-6 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)] text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] shrink-0 italic opacity-40">
          <div>#</div>
          <div>Step Name</div>
          <div>Phase</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Est</div>
          <div>Log</div>
          <div>Actions</div>
        </div>
        
        <div className="transform-gpu flex-1 overflow-y-auto no-scrollbar pb-10">
          {isAdding && renderRow(null, units.length, true)}
          {units.map((unit, i) => renderRow(unit, i, editingId === unit.id))}
          {units.length === 0 && !isAdding && (
            <div className="transform-gpu flex flex-col items-center justify-center p-20 opacity-20">
              <Plus size={48} className="mb-6" />
              <p className="font-black text-sm uppercase tracking-widest italic">No steps added yet</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
