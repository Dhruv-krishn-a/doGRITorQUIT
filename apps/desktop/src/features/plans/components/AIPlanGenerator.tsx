//apps/web/features/plans/components/AIPlanGenerator.tsx
"use client";

import React, { useRef, useEffect, useState } from"react";
import { createPortal } from"react-dom";
import { Sparkles, X, BrainCircuit, RefreshCw, Layout } from"lucide-react";
import { AnimatePresence, motion } from"framer-motion";

import { useAIArchitect } from"./ai-architect/useAIArchitect";
import { PlanBlueprint } from"./ai-architect/PlanBlueprint"; 
import { SyllabusReview } from"./ai-architect/SyllabusReview";
import { ChatInput, SkillLevel } from"./ai-architect/ChatInput"; 
import { MessageBubble } from"./ai-architect/MessageBubble";

interface AIPlanGeneratorProps {
 isOpen?: boolean;
 onClose?: () => void;
}

export default function AIPlanGenerator({ isOpen: externalIsOpen, onClose: externalOnClose }: AIPlanGeneratorProps) {
 // --- State Management ---
 const [internalOpen, setInternalOpen] = useState(false);
 const [mounted, setMounted] = useState(false);
 const isControlled = externalIsOpen !== undefined;
 const open = isControlled ? externalIsOpen : internalOpen;
 
 useEffect(() => {
  setMounted(true);
 }, []);

 const handleClose = () => {
  if (isControlled) {
   externalOnClose?.();
  } else {
   setInternalOpen(false);
  }
 };

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
   if (!val) handleClose();
 });

 // Auto-scroll chat
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
   {/* Trigger Button (Only if uncontrolled) */}
   {!isControlled && (
    <button
      onClick={() => setInternalOpen(true)}
      // ✅ FIX: Canonical class for gradient
      className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 font-medium"
    >
      <Sparkles size={16} />
      <span>AI Architect</span>
    </button>
   )}

   <AnimatePresence>
    {open && (
     <div className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4">
      {/* Frosted Glass Backdrop */}
      <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       onClick={handleClose}
       className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />
      
      <motion.div
       initial={{ opacity: 0, scale: 0.95, y: 20 }}
       animate={{ opacity: 1, scale: 1, y: 0 }}
       exit={{ opacity: 0, scale: 0.95, y: 20 }}
       className="relative bg-white/80 backdrop-blur-md w-full max-w-350 h-[95vh] sm:h-[90vh] rounded-[3rem] flex flex-col lg:flex-row overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white"
      >
       {/* Animated Background Gradients */}
       <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-rose-200/40 rounded-full blur-[60px]  pointer-events-none z-0" />
       <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-pink-200/40 rounded-full blur-[60px]  pointer-events-none z-0" />

       {/* --- LEFT PANEL: Chat & Config --- */}
       {/* ✅ FIX: Canonical classes for widths (400px -> w-100, 450px -> w-112.5) */}
       <div className="w-full lg:w-100 xl:w-112.5 flex-none flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 h-[45%] lg:h-full transition-all">
        
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200/60 bg-white/50 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BrainCircuit size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight uppercase tracking-tighter text-slate-900">Plan Architect</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">AI-Powered Roadmap Builder</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setMessages([])} 
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Reset Chat"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={handleClose} 
              className="lg:hidden p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-60 text-center px-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-slate-800">Start building your path.</p>
              <p className="text-xs text-slate-500 mt-1">Try: &quot;React Native in 30 days&quot;</p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          
          {loading && (
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="text-xs font-medium text-indigo-600 ml-1">
                {loadingStep ||"Thinking..."}
              </span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <ChatInput 
            onSend={(text) => handleSend(text)} 
            disabled={loading}
            onStartPlan={handleManualStart}
          />
        </div>
       </div>

       {/* --- RIGHT PANEL: Preview --- */}
       <div className="flex-1 flex flex-col bg-white relative h-[55%] lg:h-full">
        {/* Desktop Close Button */}
        <button 
          onClick={handleClose} 
          className="hidden lg:block absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-slate-100 backdrop-blur-sm rounded-full text-slate-400 hover:text-rose-500 border border-transparent hover:border-slate-200 transition-all shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Mobile Handle */}
        <div className="lg:hidden w-full h-1 bg-slate-100 flex items-center justify-center cursor-row-resize">
          <div className="w-10 h-1 bg-slate-300 rounded-full my-1"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/30 custom-scrollbar">
          
          {!currentSyllabus && !currentBlueprint && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 select-none">
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner rotate-3">
                <Layout size={40} className="text-slate-200" />
              </div>
              <h2 className="text-xl font-bold text-slate-400">Ready to build</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xs text-center">
                Your generated roadmap will appear here in real-time.
              </p>
            </div>
          )}

          {currentSyllabus && !currentBlueprint && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <SyllabusReview 
                syllabus={currentSyllabus}
                onApprove={approveSyllabus}
                onRegenerateModule={regenerateSingleModule}
                isLoading={loading}
               />
            </div>
          )}

          {currentBlueprint && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
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
  </>
 );

 return createPortal(content, target);
}