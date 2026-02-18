"use client";
import React, { useState, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  Code, 
  Brain, 
  Layout, 
  Settings, 
  ArrowRight, 
  ArrowLeft,
  Clock,
  Rocket,
  Globe
} from 'lucide-react';
import { TrackType } from '@prisma/client';
import { toast } from 'sonner';

interface CreateTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const TRACK_TYPES = [
  { id: 'COURSE', label: 'Course', icon: Globe, description: 'Online or offline courses (Udemy, Coursera, etc.)' },
  { id: 'SKILL', label: 'Skill Roadmap', icon: Brain, description: 'Structured paths for mastering new abilities' },
  { id: 'PROJECT', label: 'Personal Project', icon: Code, description: 'Goal-oriented building and research' },
  { id: 'PLAYLIST', label: 'YouTube Playlist', icon: Layout, description: 'Convert YouTube lists into learning tracks' },
];

export const CreateTrackModal: React.FC<CreateTrackModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'COURSE' as TrackType,
    title: '',
    description: '',
    link: '',
    targetDate: '',
    dailyAllocationMinutes: 30
  });

  if (!isOpen) return null;

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/study/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Learning container initialized!");
      onCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create track");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 flex">
          <div className={`h-full bg-rose-500 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
        </div>

        <div className="p-10 relative">
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>

          {/* STEP 1: CHOOSE TYPE */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Select Track Architecture</h2>
                <p className="text-slate-500 font-medium">Choose the container that best fits your learning objective.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {TRACK_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setFormData({ ...formData, type: type.id as TrackType });
                      nextStep();
                    }}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all group ${
                      formData.type === type.id 
                        ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-100' 
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl mb-4 inline-block ${
                      formData.type === type.id ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 group-hover:text-rose-500 shadow-sm'
                    }`}>
                      <type.icon size={24} />
                    </div>
                    <h3 className="font-black text-slate-900 mb-1">{type.label}</h3>
                    <p className="text-[11px] text-slate-400 font-bold leading-tight uppercase tracking-tighter">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Core Metadata</h2>
                <p className="text-slate-500 font-medium">Define the parameters for your <span className="text-rose-600 font-bold">{formData.type}</span> track.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Track Title</label>
                  <input 
                    autoFocus
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Advanced React Patterns or Deep Work Mastery"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-rose-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 h-24 resize-none font-medium text-slate-700 focus:border-rose-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course URL (Optional)</label>
                    <input 
                      type="text"
                      value={formData.link}
                      onChange={e => setFormData({...formData, link: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-rose-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target End Date</label>
                    <input 
                      type="date"
                      value={formData.targetDate}
                      onChange={e => setFormData({...formData, targetDate: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-rose-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <ArrowLeft size={18} /> BACK
                </button>
                <button 
                  onClick={nextStep} 
                  disabled={!formData.title}
                  className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  NEXT STEP <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: COMMITMENT */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configure Your Pace</h2>
                <p className="text-slate-500 font-medium">How many minutes per day will you dedicate?</p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-3">
                  {[15, 30, 45, 60, 90].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({...formData, dailyAllocationMinutes: m})}
                      className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all ${
                        formData.dailyAllocationMinutes === m ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 text-slate-400 bg-white'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                <div className="bg-rose-600 rounded-3xl p-8 text-white shadow-xl shadow-rose-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-rose-100 text-xs font-bold uppercase tracking-widest">Velocity Simulation</p>
                    <p className="text-xl font-bold leading-tight">
                      At <span className="underline decoration-2 underline-offset-4">{formData.dailyAllocationMinutes} mins/day</span>, you'll maintain peak cognitive retention.
                    </p>
                    <p className="text-[10px] text-rose-200 font-bold uppercase mt-2">ETA will calibrate as you add modules.</p>
                  </div>
                  <Rocket className="opacity-20 shrink-0" size={64} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <ArrowLeft size={18} /> BACK
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-[2] py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-rose-200 disabled:opacity-50"
                >
                  {loading ? 'INITIALIZING...' : 'START TRACK'}
                  <Rocket size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
