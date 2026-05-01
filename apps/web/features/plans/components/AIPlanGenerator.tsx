"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X, BrainCircuit, RefreshCw, Layout, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useAIArchitect } from "./ai-architect/useAIArchitect";
import { PlanBlueprint } from "./ai-architect/PlanBlueprint"; 
import { SyllabusReview } from "./ai-architect/SyllabusReview";
import { ChatInput, SkillLevel } from "./ai-architect/ChatInput"; 
import { MessageBubble } from "./ai-architect/MessageBubble";
import Modal from "../../../shared/components/ui/Modal";

interface AIPlanGeneratorProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AIPlanGenerator({ isOpen: externalIsOpen, onClose: externalOnClose }: AIPlanGeneratorProps) {
  // --- 1. Hooks ---
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const isControlled = externalIsOpen !== undefined;
  const open = isControlled ? externalIsOpen : internalOpen;
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    loadingStep,
    isSaving,
    currentSyllabus,
    currentBlueprint,
    handleSend,
    approveSyllabus,
    updatePlanTask,
    startPlan,
    setMessages,
    regenerateSingleModule,
    regenerateDay,
    downloadICS
  } = useAIArchitect((val) => {
      if (!val) confirmClose();
  });

  // --- 2. Action Handlers ---
  const confirmClose = () => {
    setShowConfirmClose(false);
    if (isControlled) {
      externalOnClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  const requestClose = () => {
    if (messages.length <= 1 && !currentSyllabus && !currentBlueprint) {
        confirmClose();
    } else {
        setShowConfirmClose(true);
    }
  };

  // --- 3. Effects ---
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
          if (showConfirmClose) setShowConfirmClose(false);
          else requestClose();
      }
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [open, showConfirmClose, messages, currentSyllabus, currentBlueprint]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleManualStart = (topic: string, days: number, level: SkillLevel) => {
    const prompt = `Create a ${days}-day ${level} plan for ${topic}.`;
    handleSend(prompt);
  };

  if (!mounted || typeof document === 'undefined') return null;
  const target = document.getElementById('study-modal-root') || document.body;

  const content = (
    <>
      <AnimatePresence mode="wait">
        {open && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4 text-left">
            {/* Persistant Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={requestClose}
              className="absolute inset-0 bg-black/70 modal-backdrop-blur"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="transform-gpu relative bg-[var(--bg-primary)] w-full max-w-7xl h-[95vh] sm:h-[90vh] rounded-[3rem] flex flex-col lg:flex-row overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[var(--border-color)]"
            >
              {/* Animated Background Gradients */}
              <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[var(--accent-color)]/5 rounded-full blur-[80px] mix-blend-screen pointer-events-none z-0" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none z-0" />

              {/* --- LEFT PANEL: Chat & Config --- */}
              <div className="w-full lg:w-[450px] flex-none flex flex-col border-b lg:border-b-0 lg:border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/50 h-[45%] lg:h-full transition-all relative z-10">
                
                {/* Header */}
                <div className="px-4 py-3 sm:px-8 sm:py-6 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-4 text-[var(--text-primary)]">
                        <div className="p-3 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl border border-[var(--accent-color)]/20 shadow-inner">
                           <BrainCircuit size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm sm:text-base leading-tight uppercase tracking-tighter italic">Plan Architect</h3>
                            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-60 italic">AI Blueprinting Engine</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setMessages([])} 
                            className="p-3 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-secondary)] rounded-xl transition-all active:scale-90"
                            title="Reset Engine"
                        >
                            <RefreshCw size={20} />
                        </button>
                        <button 
                            onClick={requestClose} 
                            className="lg:hidden p-3 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-10">
                            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-[2rem] flex items-center justify-center mb-6 border border-[var(--border-color)] shadow-inner">
                                <Sparkles className="w-8 h-8 text-[var(--accent-color)]" />
                            </div>
                            <p className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-widest">Awaiting Command.</p>
                            <p className="text-[10px] text-[var(--text-secondary)] mt-3 font-bold uppercase tracking-widest leading-relaxed">Specify a goal, duration, and target skill level to begin.</p>
                        </div>
                    )}
                    
                    {messages.map((m, i) => (
                        <MessageBubble key={i} role={m.role} content={m.content} />
                    ))}
                    
                    {loading && (
                        <div className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-secondary)] w-fit rounded-2xl border border-[var(--border-color)]">
                           <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce" />
                           <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce [animation-delay:0.1s]" />
                           <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce [animation-delay:0.2s]" />
                           <span className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest ml-1 italic">
                               {loadingStep || "Synthesizing..."}
                           </span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] shadow-2xl relative z-20">
                    <ChatInput 
                        onSend={(text) => handleSend(text)} 
                        disabled={loading}
                        onStartPlan={handleManualStart}
                    />
                </div>
              </div>

              {/* --- RIGHT PANEL: Preview --- */}
              <div className="flex-1 flex flex-col bg-[var(--bg-primary)] relative h-[55%] lg:h-full">
                {/* Desktop Close Button */}
                <button 
                    onClick={requestClose} 
                    className="hidden lg:block absolute top-8 right-8 z-30 p-4 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] rounded-2xl text-[var(--text-secondary)] hover:text-rose-500 transition-all shadow-xl active:scale-95 border border-[var(--border-color)]"
                >
                    <X size={20} />
                </button>

                <div className="flex-1 overflow-y-auto p-6 sm:p-12 bg-[var(--bg-secondary)]/10 custom-scrollbar relative z-10">
                    
                    {!currentSyllabus && !currentBlueprint && (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] select-none opacity-20">
                            <div className="w-32 h-32 bg-[var(--bg-secondary)] rounded-[3rem] flex items-center justify-center mb-8 shadow-inner border border-[var(--border-color)]">
                                <Layout size={56} />
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Ready to build</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-3 max-w-xs text-center leading-relaxed">
                                Your roadmap architecture will materialize here in real-time as we consult.
                            </p>
                        </div>
                    )}

                    {currentSyllabus && !currentBlueprint && (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                             <SyllabusReview 
                                syllabus={currentSyllabus}
                                onApprove={approveSyllabus}
                                onRegenerateModule={regenerateSingleModule}
                                isLoading={loading}
                             />
                        </div>
                    )}

                    {currentBlueprint && (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 h-full">
                            <PlanBlueprint 
                                planData={currentBlueprint}
                                isSaving={isSaving}
                                isLoading={loading} 
                                onSave={(startDate) => startPlan(startDate)}
                                onUpdateTask={updatePlanTask}
                                onRegenerateDay={regenerateDay} 
                                onDownloadICS={downloadICS}
                            />
                        </div>
                    )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        title="Exit Architect?"
        onConfirm={confirmClose}
        confirmLabel="Exit Now"
        cancelLabel="Keep Building"
      >
        <div className="flex flex-col items-center text-center gap-6 py-6">
            <div className="p-5 bg-amber-500/10 text-amber-500 rounded-full shadow-inner">
                <AlertTriangle size={48} />
            </div>
            <div>
                <p className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight italic">Unsaved Progress detected</p>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-3 leading-relaxed opacity-60 italic">Are you sure you want to close the AI Architect? Your current roadmap synthesis will be terminated.</p>
            </div>
        </div>
      </Modal>
    </>
  );

  return createPortal(content, target);
}
