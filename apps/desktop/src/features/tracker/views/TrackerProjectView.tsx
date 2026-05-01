import React, { useState, Suspense, useMemo, useEffect, lazy } from "react";
import { ArrowLeft, Plus, RefreshCw, ShieldCheck, Target, Loader2, CheckCircle2, Circle, Sparkles, Trash2, Lock, RotateCcw, Layers, Users, Cpu, ChevronRight, Zap, AlertTriangle, Settings2, Info } from "lucide-react";
import { GithubProject, GithubFeature, ProjectLifecycle, ProjectMethodology } from "@gritorquit/domain/github-projects/types";
import { SDLC_CONFIGS, getStagesForMethodology } from "@gritorquit/domain/github-projects/sdlc.config";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../services/api";
import { GithubEvidencePanel } from "../components/GithubEvidencePanel";
import { motion, AnimatePresence } from "framer-motion";

const NoteEditor = lazy(() =>
  import("@gritorquit/notes-ui-web").then((mod) => ({ default: mod.NoteEditor }))
);

type ViewMode = "BLUEPRINT" | "EXECUTION_PLANNER" | "PHASE_DASHBOARD";
type BlueprintType = "REQUIREMENTS" | "USER_FLOW" | "SYSTEM_FLOW";

export function TrackerProjectView() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState<(GithubProject & { features: GithubFeature[], requirementsNote?: any, userFlowNote?: any, systemFlowNote?: any, iterations?: any[] }) | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>("BLUEPRINT");
  const [blueprintType, setBlueprintType] = useState<BlueprintType>("REQUIREMENTS");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [featureToDelete, setFeatureToDelete] = useState<string | null>(null);
  const [featureToEdit, setFeatureToEdit] = useState<string | null>(null);
  const [editFeatureTitle, setEditFeatureTitle] = useState("");

  const activeIteration = useMemo(() => project?.iterations?.find(i => i.id === project.activeIterationId) || null, [project?.iterations, project?.activeIterationId]);
  const STAGES = useMemo(() => getStagesForMethodology(project?.methodology || null), [project?.methodology]);
  
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [activeEpicId, setActiveEpicId] = useState<string | null>(null);

  useEffect(() => {
    if (activeIteration?.sdlcPhaseId && !activePhaseId) {
      setActivePhaseId(activeIteration.sdlcPhaseId);
    } else if (STAGES.length > 0 && !activePhaseId) {
      setActivePhaseId(STAGES[0].id);
    }
  }, [activeIteration?.sdlcPhaseId, STAGES, activePhaseId]);

  const hasDrift = useMemo(() => {
    if (!activeIteration || viewMode !== "BLUEPRINT") return false;
    return true; 
  }, [activeIteration, blueprintType, project?.requirementsNote, project?.userFlowNote, project?.systemFlowNote, viewMode]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const data = await api.get(`/api/github-projects/${projectId}`);
        setProject(data);
        
        if (data.projectStage === "USER_FLOW") setBlueprintType("USER_FLOW");
        if (data.projectStage === "SYSTEM_FLOW") setBlueprintType("SYSTEM_FLOW");
        if (data.projectStage === "EXECUTION") setViewMode("PHASE_DASHBOARD");
        
        if (data.activeIterationId) {
           const iter = data.iterations?.find((i: any) => i.id === data.activeIterationId);
           if (iter) setActivePhaseId(iter.sdlcPhaseId);
        }
      } catch (err) {
        toast.error("Failed to load project");
        navigate("/tracker");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId, navigate]);
  
  useEffect(() => {
    if (project?.projectStage === "EXECUTION" && viewMode === "BLUEPRINT" && activeIteration) {
      setViewMode("PHASE_DASHBOARD");
      setActivePhaseId(activeIteration.sdlcPhaseId);
    }
  }, [project?.projectStage, activeIteration?.sdlcPhaseId]);

  const handleUpdateProject = async (updates: Partial<GithubProject>) => {
    if (!project) return;
    try {
      const updated = await api.patch(`/api/github-projects/${project.id}`, updates);
      setProject(updated);
      return updated;
    } catch (err) {
      toast.error("Database sync failed");
    }
  };

  const handleSaveNote = async (title: string, content: any) => {
    if (!project) return;
    let noteId = null;
    if (blueprintType === "REQUIREMENTS") noteId = project.requirementsNoteId;
    if (blueprintType === "USER_FLOW") noteId = project.userFlowNoteId;
    if (blueprintType === "SYSTEM_FLOW") noteId = project.systemFlowNoteId;
    
    if (!noteId) return;
    setIsSavingNote(true);
    try {
      await api.patch(`/api/notes/${noteId}`, { title, content });
      toast.success("Blueprint Saved");
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSealBlueprint = async () => {
    if (!project) return;
    let noteId = null;
    if (blueprintType === "REQUIREMENTS") noteId = project.requirementsNoteId;
    if (blueprintType === "USER_FLOW") noteId = project.userFlowNoteId;
    if (blueprintType === "SYSTEM_FLOW") noteId = project.systemFlowNoteId;
    
    if (!noteId) return;
    setIsSealing(true);
    try {
      await api.post(`/api/github-projects/${project.id}/notes/${noteId}/seal`, {});
      toast.success("Blueprint Sealed for Versioning");
    } catch (err) {
      toast.error("Seal failed");
    } finally {
      setIsSealing(false);
    }
  };

  const handleAdvanceProjectStage = async () => {
    if (!project) return;
    setIsGenerating(true);
    try {
      if (project.projectStage === "REQUIREMENTS") {
        const note = await api.post(`/api/github-projects/${project.id}/blueprint/generate`, { type: "USER_FLOW" });
        await handleUpdateProject({ projectStage: "USER_FLOW", prdVerified: true, userFlowNoteId: note.id });
        setBlueprintType("USER_FLOW");
        toast.success("User Flow Generated");
      } else if (project.projectStage === "USER_FLOW") {
        const note = await api.post(`/api/github-projects/${project.id}/blueprint/generate`, { type: "SYSTEM_FLOW" });
        await handleUpdateProject({ projectStage: "SYSTEM_FLOW", userFlowVerified: true, systemFlowNoteId: note.id });
        setBlueprintType("SYSTEM_FLOW");
        toast.success("System Architecture Generated");
      } else if (project.projectStage === "SYSTEM_FLOW") {
        await handleUpdateProject({ projectStage: "METHODOLOGY", systemFlowVerified: true });
        setViewMode("PHASE_DASHBOARD");
        toast.success("Architecture Finalized");
      } else if (project.projectStage === "METHODOLOGY") {
        if (!project.methodology) {
          toast.error("Please select a methodology first.");
          return;
        }
        toast.info("Initializing Iteration & Generating Master Plan...", { duration: 5000 });
        const iteration = await api.post(`/api/github-projects/${project.id}/iterations`, { 
          name: "V1.0", methodology: project.methodology, sdlcPhaseId: STAGES[0].id 
        });
        
        const epics = await api.post(`/api/github-projects/${project.id}/iterations/${iteration.id}/tasks/generate`, {
          methodology: project.methodology
        });

        const updatedProj = await handleUpdateProject({ projectStage: "EXECUTION" });
        if(updatedProj) {
          setProject(prev => prev ? ({ 
             ...prev, 
             activeIterationId: iteration.id, 
             iterations: [...(prev.iterations || []), iteration],
             features: [...prev.features, ...epics.flatMap((e: any) => [e, ...(e.subTasks || [])])]
          }) : null);
          setActivePhaseId(iteration.sdlcPhaseId);
          setViewMode("EXECUTION_PLANNER");
          toast.success("Execution Strategy Ready");
        }
      }
    } catch (err) {
      toast.error("Transition failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePhaseTasks = async () => {
    if (!project || !activeIteration || !activePhaseId) return;
    setIsGenerating(true);
    try {
      const newFeatures = await api.post(`/api/github-projects/${project.id}/iterations/${activeIteration.id}/tasks/generate`, {
        phaseId: activePhaseId 
      });
      setProject(prev => prev ? ({ ...prev, features: [...prev.features, ...newFeatures] }) : null);
      toast.success("Phase Tasks Generated");
    } catch (err) {
      toast.error("Task generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !activeIteration || !activePhaseId) return;
    const form = e.currentTarget as any;
    const title = form.elements.namedItem("title").value;
    if (!title.trim()) return;
    setIsCreatingFeature(true);
    try {
      const feature = await api.post(`/api/github-projects/${project.id}/features`, { 
        title, sdlcPhaseId: activePhaseId, iterationId: activeIteration.id, parentId: activeEpicId 
      });
      setProject(prev => prev ? ({ ...prev, features: [...prev.features, feature] }) : null);
      form.elements.namedItem("title").value = "";
    } catch (err) {
      toast.error("Failed to add task");
    } finally {
      setIsCreatingFeature(false);
    }
  };

  const handleUpdateFeatureStatus = async (featureId: string, status: string) => {
    if (!project) return;
    try {
      const updated = await api.patch(`/api/github-projects/${project.id}/features/${featureId}/status`, { status });
      setProject(prev => prev ? ({ ...prev, features: prev.features.map(f => f.id === featureId ? updated : f) }) : null);
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleUpdateFeatureEvidence = async (featureId: string, updates: any) => {
    if (!project) return;
    try {
      const updated = await api.patch(`/api/github-projects/${project.id}/features/${featureId}/evidence`, updates);
      setProject(prev => prev ? ({ ...prev, features: prev.features.map(f => f.id === featureId ? updated : f) }) : null);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleEditFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !featureToEdit || !editFeatureTitle.trim()) return;
    setIsEditing(true);
    try {
      const updatedFeature = await api.patch(`/api/github-projects/${project.id}/features/${featureToEdit}/rename`, { title: editFeatureTitle });
      setProject(prev => prev ? ({ ...prev, features: prev.features.map(f => f.id === featureToEdit ? updatedFeature : f) }) : null);
      setFeatureToEdit(null);
      toast.success("Task updated");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/github-projects/${project.id}/features/${id}`);
      setProject(prev => prev ? ({ ...prev, features: prev.features.filter(f => f.id !== id) }) : null);
      setFeatureToDelete(null);
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateRetrospective = async (featureId: string) => {
    if (!project) return;
    setIsGeneratingAI(true);
    try {
      const updatedFeature = await api.post(`/api/github-projects/${project.id}/features/${featureId}/retrospective`, {});
      setProject(prev => prev ? ({ ...prev, features: prev.features.map(f => f.id === featureId ? updatedFeature : f) }) : null);
      toast.success("AI Retrospective Ready");
    } catch (err) {
      toast.error("AI generation failed");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const getLifecycleIcon = () => {
    if (project?.projectStage !== "EXECUTION") return <Sparkles size={16} />;
    switch (project?.lifecycle) {
      case ProjectLifecycle.WATERFALL: return <Layers size={14} />;
      case ProjectLifecycle.V_MODEL: return <ShieldCheck size={14} />;
      case ProjectLifecycle.SPIRAL: return <RotateCcw size={14} />;
      default: return <RefreshCw size={14} />;
    }
  };

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
         <Loader2 size={32} className="animate-spin text-[var(--accent-color)]" />
      </div>
    );
  }

  const phaseTasks = project.features.filter(f => f.sdlcPhaseId === activePhaseId && f.iterationId === activeIteration?.id && f.parentId !== null && (activeEpicId ? f.parentId === activeEpicId : true));
  const allPhaseTasks = project.features.filter(f => f.sdlcPhaseId === activePhaseId && f.iterationId === activeIteration?.id && f.parentId !== null);
  const allTasksDone = allPhaseTasks.length > 0 && allPhaseTasks.every(f => f.status === "DONE");

  return (
    <div className="relative w-full h-full text-[var(--text-primary)] font-sans overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--accent-color)]/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      {/* HEADER */}
      <header className="relative z-10 px-6 md:px-8 py-3.5 border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/project-tracker')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-all shadow-sm active:scale-95"><ArrowLeft size={16} /></button>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black tracking-tighter uppercase italic leading-none">{project.name}</h1>
            <span className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border italic ${project.projectStage !== "EXECUTION" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-[var(--accent-color)] bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20"}`}>
              {getLifecycleIcon()} {project.projectStage === "EXECUTION" ? (project.methodology || "AGILE") : (project.projectStage || "PLANNING").replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {project.projectStage !== "EXECUTION" && (
          <button onClick={handleAdvanceProjectStage} disabled={isGenerating || (project.projectStage === "METHODOLOGY" && !project.methodology)} className="px-6 py-2.5 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-[var(--accent-color)]/20 hover:opacity-90 transition-all active:scale-95 italic flex items-center gap-2 disabled:opacity-30">
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
            {project.projectStage === "REQUIREMENTS" ? "Approve & Generate User Flow" : project.projectStage === "USER_FLOW" ? "Approve & Generate System Flow" : project.projectStage === "SYSTEM_FLOW" ? "Review Architecture & Select SDLC" : "Confirm & Create Iteration"}
          </button>
        )}
      </header>

      {/* ITERATION DASHBOARD SUBWAY MAP HEADER */}
      {viewMode === "PHASE_DASHBOARD" && project.projectStage === "EXECUTION" && STAGES.length > 0 && (
         <div className="w-full bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 py-4 overflow-x-auto no-scrollbar flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2 min-w-max">
             {STAGES.map((stage, idx) => {
               const isActive = activePhaseId === stage.id;
               const curIterIdx = STAGES.findIndex(s => s.id === activeIteration?.sdlcPhaseId);
               const isPast = curIterIdx > idx;
               return (
                 <div key={stage.id} className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePhaseId(stage.id)}>
                   <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isActive ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg" : isPast ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/30"}`}>
                     {isPast ? <CheckCircle2 size={14} /> : <Circle size={14} className={isActive ? "fill-current" : ""} />}
                     <span className="text-[10px] font-black uppercase tracking-widest">{stage.label}</span>
                   </div>
                   {idx < STAGES.length - 1 && <div className="w-6 h-px bg-[var(--border-color)]" />}
                 </div>
               )
             })}
           </div>
         </div>
      )}

      <main className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden pt-6">
        {/* SIDEBAR - BLUEPRINTS */}
        <aside className="w-full md:w-80 lg:w-96 border-r border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-md flex flex-col shrink-0">
          <div className="p-6 border-b border-[var(--border-color)] space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] ml-1">Technical Blueprints</h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setBlueprintType("REQUIREMENTS"); setViewMode("BLUEPRINT"); setActiveFeatureId(null); }} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${viewMode === "BLUEPRINT" && blueprintType === "REQUIREMENTS" ? "bg-amber-500/10 border-amber-500/40 text-amber-500" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-500/20"}`}>
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className={project.prdVerified ? "text-emerald-500" : ""} />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Requirements (PRD)</span>
                  </div>
                  {project.prdVerified && <CheckCircle2 size={12} className="text-emerald-500" />}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { if (project.userFlowNoteId) { setBlueprintType("USER_FLOW"); setViewMode("BLUEPRINT"); setActiveFeatureId(null); } }} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${viewMode === "BLUEPRINT" && blueprintType === "USER_FLOW" ? "bg-amber-500/10 border-amber-500/40 text-amber-500" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]"} ${!project.userFlowNoteId ? "opacity-30 cursor-not-allowed" : "hover:border-amber-500/20"}`}>
                    <Users size={12} /> <span className="text-[8px] font-black uppercase tracking-widest">User Flow</span>
                    {project.userFlowVerified && <CheckCircle2 size={8} className="text-emerald-500" />}
                  </button>
                  <button onClick={() => { if (project.systemFlowNoteId) { setBlueprintType("SYSTEM_FLOW"); setViewMode("BLUEPRINT"); setActiveFeatureId(null); } }} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${viewMode === "BLUEPRINT" && blueprintType === "SYSTEM_FLOW" ? "bg-amber-500/10 border-amber-500/40 text-amber-500" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]"} ${!project.systemFlowNoteId ? "opacity-30 cursor-not-allowed" : "hover:border-amber-500/20"}`}>
                    <Cpu size={12} /> <span className="text-[8px] font-black uppercase tracking-widest">System</span>
                    {project.systemFlowVerified && <CheckCircle2 size={8} className="text-emerald-500" />}
                  </button>
                </div>
                <button onClick={() => { setViewMode("PHASE_DASHBOARD"); setActiveFeatureId(null); }} className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl border transition-all ${viewMode === "PHASE_DASHBOARD" && project.projectStage === "METHODOLOGY" ? "bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-lg shadow-amber-500/10" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-500/20"} ${!project.systemFlowVerified ? "opacity-30 cursor-not-allowed" : ""} ${project.projectStage === "METHODOLOGY" && !project.methodology ? "animate-pulse border-amber-500/50" : ""}`}>
                  <Zap size={14} className={project.projectStage === "METHODOLOGY" && !project.methodology ? "text-amber-500" : ""} /> <span className="text-[9px] font-black uppercase tracking-widest italic">SDLC Dashboard</span>
                </button>
              </div>
            </div>
            
            {viewMode === "BLUEPRINT" && activeIteration && hasDrift && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex flex-col gap-3">
                 <div className="flex items-start gap-2 text-rose-500">
                    <AlertTriangle size={16} className="mt-0.5" />
                    <div>
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Blueprint Drift Detected</h4>
                       <p className="text-[9px] font-medium leading-relaxed opacity-80">This blueprint differs from the version sealed for iteration {activeIteration.name}.</p>
                    </div>
                 </div>
                 <button className="py-2 px-3 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Start New Iteration</button>
              </div>
            )}
            
            {viewMode === "BLUEPRINT" && activeIteration && (
              <button onClick={handleSealBlueprint} disabled={isSealing} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                {isSealing ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Seal Archive
              </button>
            )}

            {viewMode === "PHASE_DASHBOARD" && (
              <div className="space-y-3 pt-6 border-t border-[var(--border-color)]">
                <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] ml-1">Epics</h3>
                <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                  <button onClick={() => setActiveEpicId(null)} className={`w-full text-left p-3 rounded-xl border transition-all ${activeEpicId === null ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)]/40 text-[var(--accent-color)]" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/20"}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">All Epics</span>
                  </button>
                  {project.features.filter(f => f.parentId === null).map(epic => (
                    <button key={epic.id} onClick={() => setActiveEpicId(epic.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${activeEpicId === epic.id ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)]/40 text-[var(--accent-color)]" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/20"}`}>
                      <span className="text-[10px] font-black tracking-widest line-clamp-1">{epic.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* WORKSPACE */}
        <section className="flex-1 bg-[var(--bg-primary)] flex flex-col overflow-hidden relative">
          {viewMode === "BLUEPRINT" ? (
             <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 bg-[var(--bg-primary)] overflow-hidden relative shadow-inner">
                   <Suspense fallback={<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--bg-primary)] z-50"><Loader2 size={32} className="animate-spin text-[var(--accent-color)]" /></div>}>
                     <NoteEditor 
                       key={blueprintType}
                       initialTitle={blueprintType === "REQUIREMENTS" ? "Requirements" : blueprintType === "USER_FLOW" ? "User Flow" : "System Architecture"} 
                       initialContent={blueprintType === "REQUIREMENTS" ? project.requirementsNote?.content : blueprintType === "USER_FLOW" ? project.userFlowNote?.content : project.systemFlowNote?.content} 
                       onSave={handleSaveNote} 
                       isSaving={isSavingNote} 
                       mode="FULL" 
                     />
                   </Suspense>
                </div>
             </div>
          ) : project.projectStage === "METHODOLOGY" ? (
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12">
                   <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto shadow-xl"><Zap size={40} className="text-amber-500" /></div>
                      <h2 className="text-4xl font-black uppercase tracking-tighter italic">Choose Delivery Model</h2>
                      <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">This selection will structure your technical tasks and delivery flow.</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                      {Object.entries(SDLC_CONFIGS).map(([key, stages]) => (
                         <button key={key} onClick={() => handleUpdateProject({ methodology: key as ProjectMethodology })} className={`p-8 rounded-[2rem] border text-left transition-all group ${project.methodology === key ? "bg-amber-500/10 border-amber-500/50 shadow-2xl" : "bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-amber-500/30"}`}>
                            <div className="flex items-center justify-between mb-6"><h3 className={`text-xl font-black uppercase tracking-tighter italic ${project.methodology === key ? "text-amber-500" : "text-[var(--text-primary)]"}`}>{key}</h3>{project.methodology === key && <CheckCircle2 size={24} className="text-amber-500" />}</div>
                            <div className="flex flex-wrap gap-2 mb-6">{stages.map(s => <span key={s.id} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] opacity-60">{s.label}</span>)}</div>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">{SDLC_CONFIGS[key as ProjectMethodology][0].description}</p>
                         </button>
                      ))}
                   </div>
                </div>
            </div>
          ) : viewMode === "EXECUTION_PLANNER" ? (
             <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12">
                   <div className="flex items-center justify-between">
                     <div className="space-y-2">
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Execution Planner</h2>
                        <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Review AI-Generated Epics & Tasks</p>
                     </div>
                     <button onClick={() => setViewMode("PHASE_DASHBOARD")} className="px-6 py-3 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95 italic">
                       [ Begin Execution ]
                     </button>
                   </div>
                   <div className="space-y-6">
                      {project.features.filter(f => f.parentId === null).map(epic => (
                         <div key={epic.id} className="bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-[2rem] p-6 shadow-sm space-y-4">
                            <div>
                               <h3 className="text-lg font-black uppercase tracking-tight text-[var(--accent-color)]">{epic.title}</h3>
                               <p className="text-xs text-[var(--text-secondary)] mt-1">{epic.description}</p>
                            </div>
                            <div className="space-y-2 pl-4 border-l-2 border-[var(--border-color)]">
                               {project.features.filter(f => f.parentId === epic.id).map(task => (
                                  <div key={task.id} className="flex items-center gap-3 bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)]">
                                     <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-[var(--bg-secondary)] rounded-md border border-[var(--border-color)]">{task.sdlcPhaseId}</span>
                                     <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">{task.title}</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          ) : activePhaseId ? (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-5xl mx-auto space-y-8 pb-32">
                <div className="flex items-center justify-between">
                   <div>
                      <h2 className="text-[11px] font-black text-[var(--accent-color)] uppercase tracking-[0.3em] italic mb-2">Phase Dashboard</h2>
                      <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">{STAGES.find(s => s.id === activePhaseId)?.label} Tasks</h1>
                   </div>
                   <button onClick={handleGeneratePhaseTasks} disabled={isGenerating} className="px-6 py-3 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95 italic flex items-center gap-2">
                     {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate Tasks for {STAGES.find(s => s.id === activePhaseId)?.label}
                   </button>
                </div>

                <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-[2rem] p-6 shadow-sm">
                   <form onSubmit={handleCreateFeature} className="flex gap-3 mb-8">
                     <input name="title" type="text" placeholder="Add manual task..." className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded-xl px-5 py-3 text-xs font-bold outline-none" />
                     <button type="submit" disabled={isCreatingFeature} className="px-6 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[var(--text-primary)] rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"><Plus size={14} /> Add</button>
                   </form>

                   <div className="space-y-3">
                     {phaseTasks.length === 0 ? (
                        <div className="p-12 text-center opacity-30"><Target size={32} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No tasks defined for this phase.<br/>Generate them using AI or add manually.</p></div>
                     ) : phaseTasks.map(f => (
                       <div key={f.id} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${f.status === 'DONE' ? "bg-emerald-500/5 border-emerald-500/30" : "bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50"}`}>
                         <div className="flex items-center gap-4 flex-1">
                           <select 
                              value={f.status} 
                              onChange={(e) => handleUpdateFeatureStatus(f.id, e.target.value)}
                              className={`bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer ${f.status === 'DONE' ? "text-emerald-500" : f.status === 'IN PROGRESS' ? "text-amber-500" : "text-[var(--text-secondary)]"}`}
                           >
                              <option value="TODO">TODO</option>
                              <option value="IN PROGRESS">IN PROGRESS</option>
                              <option value="DONE">DONE</option>
                           </select>
                           <div className="flex flex-col">
                             <span className={`text-sm font-bold tracking-tight ${f.status === 'DONE' ? "line-through opacity-50" : ""}`}>{f.title}</span>
                             {f.description && <span className="text-[10px] font-medium text-[var(--text-secondary)] line-clamp-1 mt-1">{f.description.split('\n')[0]}</span>}
                           </div>
                         </div>
                         <button onClick={() => handleDeleteFeature(f.id)} className="p-2 opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="sticky bottom-0 mt-8 bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl flex items-center justify-between gap-6 z-20">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Phase Readiness</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-1">{allTasksDone ? <span className="text-emerald-500 flex items-center gap-1.5"><CheckCircle2 size={10} /> Ready for next phase</span> : <span className="text-rose-500">Tasks remaining</span>}</p>
                  </div>
                  <button onClick={async () => { 
                     const curIdx = STAGES.findIndex(s => s.id === activePhaseId);
                     if (curIdx < STAGES.length - 1) {
                       const nextId = STAGES[curIdx + 1].id;
                       await api.patch(`/api/github-projects/${project.id}/iterations/${activeIteration.id}`, { sdlcPhaseId: nextId });
                       setActivePhaseId(nextId);
                       toast.success(`Advanced to ${STAGES[curIdx + 1].label}`);
                     }
                  }} disabled={!allTasksDone || STAGES.findIndex(s => s.id === activePhaseId) === STAGES.length - 1} className="px-8 py-4 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg disabled:opacity-30 transition-all active:scale-95 italic">
                     Advance to Next Phase
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10"><Target size={64} className="mb-4" /><p className="text-xs font-black uppercase tracking-[0.4em]">Initialize Execution</p></div>
          )}
        </section>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {featureToEdit && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setFeatureToEdit(null)}>
            <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} onSubmit={handleEditFeature} className="w-full max-w-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[2rem] p-6 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">Rename Task</h3>
              <input type="text" value={editFeatureTitle} onChange={e => setEditFeatureTitle(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-bold outline-none mb-6" autoFocus />
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setFeatureToEdit(null)} className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Cancel</button><button type="submit" disabled={isEditing || !editFeatureTitle.trim()} className="px-5 py-2 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">{isEditing && <Loader2 size={12} className="animate-spin" />} Save</button></div>
            </motion.form>
          </div>
        )}
        {featureToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setFeatureToDelete(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-[var(--bg-primary)] border border-rose-500/20 rounded-[2rem] p-8 text-center shadow-2xl">
              <Trash2 size={24} className="mx-auto mb-4 text-rose-500" />
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] mb-2">Delete Item?</h3>
              <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed mb-8">This action is irreversible.</p>
              <div className="flex gap-3"><button onClick={() => setFeatureToDelete(null)} className="flex-1 py-3 border border-[var(--border-color)] rounded-xl text-[9px] font-black uppercase tracking-widest">Cancel</button><button onClick={() => handleDeleteFeature(featureToDelete)} disabled={isDeleting} className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">{isDeleting && <Loader2 size={12} className="animate-spin" />} Delete</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}