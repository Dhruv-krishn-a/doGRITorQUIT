// apps/web/features/plans/components/ai-architect/index.tsx
"use client";
import React, { useState } from "react";
import { Sparkles, X, RefreshCw, BrainCircuit } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAIArchitect } from "./useAIArchitect";
import { PlanBlueprint } from "./PlanBlueprint";
import { ChatInput, SkillLevel } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { SyllabusReview } from "./SyllabusReview"; 

export default function AIArchitectModal() {
  const [open, setOpen] = useState(false);
  const { 
    messages, 
    loading, 
    isSaving, 
    currentSyllabus,
    currentBlueprint,
    handleSend, 
    startPlan, 
    updatePlanTask,
    approveSyllabus,
    setMessages,
    regenerateSingleModule 
  } = useAIArchitect(setOpen);

  const handleManualStart = (topic: string, days: number, level: SkillLevel) => {
    const prompt = `Create a ${days}-day ${level} plan for ${topic}.`;
    // ✅ Fixed: Removed the second argument "SYLLABUS"
    handleSend(prompt);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="transform-gpu px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
      >
        <Sparkles size={16} /> AI Architect
      </button>

      <AnimatePresence>
        {open && (
           <div className="transform-gpu fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="transform-gpu bg-white w-full max-w-7xl h-[90vh] rounded-2xl flex overflow-hidden shadow-2xl border border-slate-200"
             >
                {/* --- LEFT PANEL: Chat (40%) --- */}
                {/* ✅ Fixed: Updated to canonical Tailwind class */}
                <div className="transform-gpu w-100 flex-none flex flex-col border-r border-slate-200 bg-slate-50/50">
                    {/* Header */}
                    <div className="transform-gpu px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <div className="transform-gpu flex items-center gap-3">
                            <div className="transform-gpu p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <BrainCircuit size={20} />
                            </div>
                            <div>
                                <h3 className="transform-gpu font-bold text-slate-800 text-lg">Plan Architect</h3>
                            </div>
                        </div>
                        <button 
                            onClick={() => setMessages([])} 
                            className="transform-gpu p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" 
                            title="Reset Chat"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    {/* Chat Feed */}
                    <div className="transform-gpu flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.length === 0 && (
                            <div className="transform-gpu mt-10 flex flex-col items-center justify-center opacity-40">
                                <Sparkles size={48} className="transform-gpu mb-4 text-indigo-300" />
                                <h4 className="transform-gpu text-xl font-bold text-slate-700">What are we building?</h4>
                                <p className="transform-gpu text-slate-500 mt-2 text-center text-sm">e.g., &quot;React in 60 days&quot;</p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <MessageBubble key={i} role={m.role} content={m.content} />
                        ))}

                        {loading && (
                            <div className="transform-gpu flex gap-3 animate-pulse ml-1">
                                <div className="transform-gpu w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                    <BrainCircuit size={16} className="transform-gpu text-white" />
                                </div>
                                <div className="transform-gpu text-sm text-slate-500 py-1.5 font-medium">
                                    AI is thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="transform-gpu p-4 border-t bg-white">
                        <ChatInput 
                            // ✅ Fixed: Removed the second argument here too
                            onSend={(msg) => handleSend(msg)} 
                            onStartPlan={handleManualStart}
                            disabled={loading} 
                        />
                    </div>
                </div>

                {/* --- RIGHT PANEL: Live Preview (60%) --- */}
                <div className="transform-gpu flex-1 flex flex-col bg-white relative">
                    <button 
                        onClick={() => setOpen(false)} 
                        className="transform-gpu absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full"
                    >
                        <X size={20} />
                    </button>

                    <div className="transform-gpu flex-1 overflow-y-auto p-8 bg-slate-50/30">
                        {!currentSyllabus && !currentBlueprint && (
                             <div className="transform-gpu h-full flex flex-col items-center justify-center text-slate-300">
                                <div className="transform-gpu w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Sparkles size={32} />
                                </div>
                                <h2 className="transform-gpu text-xl font-semibold text-slate-400">Preview Area</h2>
                                <p className="transform-gpu text-sm">Generated roadmaps will appear here.</p>
                             </div>
                        )}

                        {currentSyllabus && !currentBlueprint && (
                            <div className="transform-gpu animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="transform-gpu text-2xl font-bold text-slate-800 mb-2">Structure Review</h2>
                                <p className="transform-gpu text-slate-500 mb-6">Confirm the modules before generating the timeline.</p>
                                <SyllabusReview 
                                    syllabus={currentSyllabus} 
                                    onApprove={(editedData) => approveSyllabus(editedData)}
                                    onRegenerateModule={regenerateSingleModule}
                                    isLoading={loading}
                                />
                            </div>
                        )}

                        {currentBlueprint && (
                            <div className="transform-gpu animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <PlanBlueprint 
                                    planData={currentBlueprint} 
                                    isSaving={isSaving}
                                    onUpdateTask={updatePlanTask}
                                    onSave={(startDate) => startPlan(startDate)}
                                />
                            </div>
                        )}
                    </div>
                </div>

             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </>
  )
}