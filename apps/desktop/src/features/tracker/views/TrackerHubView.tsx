import React, { useState, useEffect } from "react";
import { Plus, Github, ArrowRight, Loader2, Server, RefreshCw, ShieldCheck, Target, Trash2, Sparkles } from "lucide-react";
import { GithubProject, ProjectLifecycle, ProjectStage } from "@gritorquit/domain/github-projects/types";
import { api } from "../../../services/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CreateProjectModal } from "../components/CreateProjectModal";

const getLifecycleIcon = (lifecycle: string, stage: string) => {
  if (stage !== 'EXECUTION') return Sparkles;
  switch (lifecycle) {
    case ProjectLifecycle.WATERFALL: return Server;
    case ProjectLifecycle.V_MODEL: return ShieldCheck;
    case ProjectLifecycle.SPIRAL: return Target;
    case ProjectLifecycle.AGILE: 
    default: return RefreshCw;
  }
};

const getLifecycleColor = (lifecycle: string, stage: string) => {
  if (stage !== 'EXECUTION') return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  switch (lifecycle) {
    case ProjectLifecycle.WATERFALL: return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case ProjectLifecycle.V_MODEL: return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    case ProjectLifecycle.SPIRAL: return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    case ProjectLifecycle.AGILE: 
    default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
  }
};

export function TrackerHubView() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<GithubProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setProjects(prev => {
      if (prev.length === 0) setIsLoading(true);
      return prev;
    });
    try {
      const data = await api.get("/api/github-projects");
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (projectId: string) => {
    setIsModalOpen(false);
    navigate(`/project-tracker/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/github-projects/${projectId}`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success("Project Deleted");
      setProjectToDelete(null);
    } catch (err: any) {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin" />
          <div className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-xs">Initializing Tracker...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full text-[var(--text-primary)] font-sans overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--accent-color)]/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-12 pt-10 pb-24 px-6 md:px-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-8 pb-8 border-b border-[var(--border-color)]">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter uppercase italic">
              Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-sky-500">Tracker</span>
            </h1>
            <p className="text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
              Unified Execution & Lifecycle OS
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--accent-color)] text-[var(--bg-primary)] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all duration-300 shadow-xl shadow-[var(--accent-color)]/20 hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={16} /> New Project
          </button>
        </header>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] border-2 border-dashed border-[var(--border-color)] rounded-[3.5rem] bg-[var(--bg-card)]/30 backdrop-blur-sm p-10 text-center">
             <div className="p-6 bg-[var(--bg-secondary)] rounded-3xl text-[var(--accent-color)] mb-6 shadow-sm border border-[var(--border-color)]">
               <Github size={40} />
             </div>
             <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-2">Initialize First Project</h3>
             <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest max-w-md mx-auto mb-8 leading-relaxed opacity-60">
               Connect your vision to execution. Build, Track, and Scale your ideas.
             </p>
             <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3 px-8 py-4 rounded-full border border-[var(--accent-color)]/50 text-[var(--accent-color)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)] transition-all shadow-sm"
              >
                Start New Project <ArrowRight size={14} />
              </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {projects.map((project) => {
              const Icon = getLifecycleIcon(project.lifecycle, project.projectStage);
              const colorClass = getLifecycleColor(project.lifecycle, project.projectStage);
              
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project-tracker/${project.id}`)}
                  className="group flex flex-col text-left bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-color)] p-6 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 shadow-xl hover:shadow-[var(--accent-color)]/10 hover:-translate-y-1 hover:border-[var(--accent-color)]/30 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${colorClass} shadow-inner`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                        {project.projectStage === 'EXECUTION' ? (project.methodology || 'AGILE') : project.projectStage}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setProjectToDelete(project.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-2 line-clamp-1 group-hover:text-[var(--accent-color)] transition-colors">
                    {project.name}
                  </h3>
                  
                  {project.description && (
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60 mb-6 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto pt-6 border-t border-[var(--border-color)] flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                      {project.githubRepo ? <><Github size={12} /> {project.githubRepo}</> : <span className="opacity-40">No Repo</span>}
                    </div>
                    <div className="text-[var(--accent-color)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectCreated={handleProjectCreated} 
      />

      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md bg-[var(--bg-primary)] border border-rose-500/20 rounded-[2.5rem] p-10 text-center shadow-2xl">
               <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 text-rose-500"><Trash2 size={24} /></div>
               <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-primary)] italic mb-3">Terminate Project?</h3>
               <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] leading-relaxed mb-10 opacity-60">This will permanently delete all blueprints, roadmaps, and technical evidence. This action is final.</p>
               <div className="flex items-center gap-4">
                 <button onClick={() => setProjectToDelete(null)} className="flex-1 py-4 border border-[var(--border-color)] rounded-2xl text-[10px] font-black uppercase tracking-widest">Keep</button>
                 <button onClick={() => handleDeleteProject(projectToDelete)} disabled={isDeleting} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">{isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Delete Forever"}</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
