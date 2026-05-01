"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Server, RefreshCw, ShieldCheck, Target, Loader2, Github, Search, Lock, Plus, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "../../../services/api";

export enum ProjectLifecycle {
  AGILE = "AGILE",
  WATERFALL = "WATERFALL",
  V_MODEL = "V_MODEL",
  SPIRAL = "SPIRAL"
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

const LIFECYCLE_OPTIONS = [
  {
    id: ProjectLifecycle.AGILE,
    name: "Agile (Iterative)",
    icon: RefreshCw,
    description: "Best for startups, SaaS, and evolving products. Iterative loops.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    id: ProjectLifecycle.WATERFALL,
    name: "Waterfall (Linear)",
    icon: Server,
    description: "Best for fixed-scope, predictable client projects. Strict progression.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    id: ProjectLifecycle.V_MODEL,
    name: "V-Model (Testing)",
    icon: ShieldCheck,
    description: "Best for high-security, mission-critical systems. Test-driven.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    id: ProjectLifecycle.SPIRAL,
    name: "Spiral (Risk-driven)",
    icon: Target,
    description: "Best for large, risky projects needing constant prototyping.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  }
];

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"SELECT" | "EXISTING" | "NEW">("SELECT");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [lifecycle, setLifecycle] = useState<ProjectLifecycle>(ProjectLifecycle.AGILE);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkGithubConnection();
      
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") resetModal();
      };
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);

  const resetModal = () => {
    setMode("SELECT");
    setName("");
    setDescription("");
    setGithubRepo("");
    onClose();
  };

  const checkGithubConnection = async () => {
    setIsFetchingRepos(true);
    try {
      const data = await api.get("/api/github/repos");
      setGithubConnected(data.connected);
      if (data.connected) {
        setRepos(data.repos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const handleConnectGithub = () => {
    // Open in browser or handle via deep link
    window.open(`${import.meta.env.VITE_API_URL}/auth/github`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Project name is required.");
    
    setIsLoading(true);
    try {
      const isConsultation = mode === "NEW";
      const body = isConsultation 
        ? { name, description, isConsultation: true }
        : { name, description, githubRepo, lifecycle };

      const data = await api.post("/api/github-projects", body);
      toast.success(isConsultation ? "Consultation Initialized" : "Project Seeded Successfully");
      onProjectCreated(data.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || typeof document === 'undefined') return null;
  const target = document.body;

  const filteredRepos = repos.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  const content = (
    <AnimatePresence>
      {isOpen && (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4 md:p-6 text-left italic">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={resetModal}
                className="absolute inset-0 bg-black/80 z-0"
            />
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 modal-backdrop-blur z-0 pointer-events-none"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={springConfig}
              className="relative w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] antialiased z-10"
            >
                {/* Animated Background Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[var(--accent-color)]/5 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 md:p-10 border-b border-[var(--border-color)]">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">New Project</h2>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-2 italic opacity-60">
                                {mode === "SELECT" ? "Choose your entry path" : mode === "EXISTING" ? "Sync with Legacy Code" : "Begin New Consultation"}
                            </p>
                        </div>
                        <button 
                            onClick={resetModal}
                            className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        {mode === "SELECT" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <button 
                                onClick={() => setMode("EXISTING")}
                                className="group flex flex-col text-left p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 rounded-[2.5rem] transition-all shadow-sm hover:shadow-xl active:scale-[0.98] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[var(--accent-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center mb-6 shadow-inner border border-[var(--border-color)] text-[var(--text-secondary)] group-hover:bg-[var(--accent-color)] group-hover:text-[var(--bg-primary)] group-hover:border-[var(--accent-color)] transition-all relative z-10">
                                    <Github size={28} />
                                </div>
                                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-2 relative z-10">Existing Repo</h3>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed opacity-50 italic relative z-10">
                                    Connect an established GitHub project. We will scan your code and auto-map your current progress.
                                </p>
                            </button>

                            <button 
                                onClick={() => setMode("NEW")}
                                className="group flex flex-col text-left p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 rounded-[2.5rem] transition-all shadow-sm hover:shadow-xl active:scale-[0.98] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[var(--accent-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center mb-6 shadow-inner border border-[var(--border-color)] text-[var(--text-secondary)] group-hover:bg-[var(--accent-color)] group-hover:text-[var(--bg-primary)] group-hover:border-[var(--accent-color)] transition-all relative z-10">
                                    <Plus size={28} />
                                </div>
                                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-2 relative z-10">New Blank Project</h3>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed opacity-50 italic relative z-10">
                                    Start from zero. Our AI Product Manager will consult with you to generate professional requirements first.
                                </p>
                            </button>
                            </div>
                        ) : (
                            <form id="create-project-form-desktop" onSubmit={handleSubmit} className="space-y-10">
                            <div className="space-y-6">
                                <div>
                                <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 ml-1 italic opacity-40">Project Name *</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. GRIT Health Tracker"
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-color)] text-[var(--text-primary)] px-6 py-5 rounded-2xl outline-none transition-all placeholder:text-[var(--text-secondary)]/30 font-black italic tracking-tight uppercase shadow-inner"
                                    autoFocus
                                />
                                </div>

                                {mode === "EXISTING" && (
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 ml-1 italic opacity-40">GitHub Repository</label>
                                    {isFetchingRepos ? (
                                    <div className="flex items-center gap-3 px-6 py-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
                                        <Loader2 size={16} className="animate-spin text-[var(--text-secondary)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Fetching Repositories...</span>
                                    </div>
                                    ) : githubConnected ? (
                                    <div className="relative">
                                        <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-color)] text-[var(--text-primary)] px-6 py-5 rounded-2xl outline-none transition-all font-black italic tracking-tight shadow-inner"
                                        >
                                        <span className="flex items-center gap-3 uppercase">
                                            <Github size={18} /> 
                                            {githubRepo ? githubRepo : <span className="text-[var(--text-secondary)]/50">Select a repository...</span>}
                                        </span>
                                        <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 right-0 mt-3 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-2xl z-50 overflow-hidden backdrop-blur-xl"
                                            >
                                            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 flex items-center gap-3">
                                                <Search size={18} className="text-[var(--text-secondary)]" />
                                                <input 
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    placeholder="Search repositories..."
                                                    className="w-full bg-transparent outline-none text-xs font-black uppercase tracking-widest"
                                                />
                                            </div>
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                                                {filteredRepos.map(repo => (
                                                    <button
                                                    key={repo.id}
                                                    type="button"
                                                    onClick={() => { setGithubRepo(repo.name); setIsDropdownOpen(false); }}
                                                    className="w-full text-left p-4 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center gap-4 transition-all active:scale-[0.98]"
                                                    >
                                                        <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-sm">
                                                            {repo.private ? <Lock size={14} className="text-amber-500" /> : <Github size={14} className="text-[var(--text-secondary)]" />}
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest">{repo.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </div>
                                    ) : (
                                    <button type="button" onClick={handleConnectGithub} className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all italic">
                                        <Github size={18} /> Link GitHub Account
                                    </button>
                                    )}
                                </div>
                                )}

                                <div>
                                <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 ml-1 italic opacity-40">
                                    {mode === "NEW" ? "Project Description *" : "Brief Description"}
                                </label>
                                <textarea 
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={mode === "NEW" ? "Explain your vision in detail. What are the core goals? Who are the users? What specific features do you imagine?" : "What is this project about?"}
                                    rows={mode === "NEW" ? 6 : 3}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-color)] text-[var(--text-primary)] px-6 py-5 rounded-2xl outline-none transition-all placeholder:text-[var(--text-secondary)]/30 font-black italic tracking-tight resize-none shadow-inner"
                                />
                                {mode === "NEW" && (
                                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-3 ml-1 opacity-40 italic">
                                    The more details you provide, the more accurate the AI-generated requirements will be.
                                    </p>
                                )}
                                </div>
                            </div>

                            {mode === "EXISTING" && (
                                <div>
                                <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-5 ml-1 italic opacity-40">Lifecycle Model</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {LIFECYCLE_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setLifecycle(option.id)}
                                        className={`flex flex-col text-left p-6 rounded-[2rem] border transition-all ${lifecycle === option.id ? `${option.border} ${option.bg} shadow-lg shadow-${option.color.replace('text-', '')}/10` : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] hover:border-[var(--accent-color)]/30 shadow-sm'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2.5 rounded-xl ${lifecycle === option.id ? `${option.color} bg-[var(--bg-primary)] shadow-sm` : 'text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-color)]'}`}>
                                            <option.icon size={20} />
                                        </div>
                                        <span className={`text-sm font-black uppercase tracking-tight italic ${lifecycle === option.id ? option.color : 'text-[var(--text-primary)]'}`}>{option.name}</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] leading-relaxed mt-3 opacity-60 italic">{option.description}</p>
                                    </button>
                                    ))}
                                </div>
                                </div>
                            )}
                            </form>
                        )}
                    </div>

                    {mode !== "SELECT" && (
                        <div className="p-8 md:p-10 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex justify-between items-center gap-4">
                            <button onClick={() => setMode("SELECT")} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all italic bg-[var(--bg-secondary)] border border-[var(--border-color)] active:scale-95 shadow-sm">← Back</button>
                            <button 
                            type="submit"
                            form="create-project-form-desktop"
                            disabled={isLoading || !name.trim() || (mode === "NEW" && !description.trim())}
                            className="flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-xl shadow-[var(--accent-color)]/20 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 italic"
                            >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : mode === "NEW" ? "Start Planning" : "Create Project"}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
          </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, target);
}
