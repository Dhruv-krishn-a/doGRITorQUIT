//apps/web/features/plans/components/ai-architect/ChatInput.tsx
import React, { useState, useRef, useEffect } from"react";
import { Send, SlidersHorizontal, X, Sparkles, WifiOff } from"lucide-react";
import { AnimatePresence, motion } from"framer-motion";

export type SkillLevel ="Beginner" |"Intermediate" |"Advanced";

export interface ChatInputProps {
 onSend: (message: string) => void;
 onStartPlan?: (topic: string, days: number, level: SkillLevel) => void; 
 disabled?: boolean;
}

export function ChatInput({ onSend, onStartPlan, disabled }: ChatInputProps) {
 const [input, setInput] = useState("");
 const [showSettings, setShowSettings] = useState(false);
 const [isOnline, setIsOnline] = useState(navigator.onLine);
 
 // Settings State
 const [topic, setTopic] = useState("");
 const [days, setDays] = useState(30);
 const [level, setLevel] = useState<SkillLevel>("Beginner");

 const settingsRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const handleStatusChange = () => setIsOnline(navigator.onLine);
  window.addEventListener('online', handleStatusChange);
  window.addEventListener('offline', handleStatusChange);
  
  function handleClickOutside(event: MouseEvent) {
   if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
    setShowSettings(false);
   }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
   document.removeEventListener("mousedown", handleClickOutside);
   window.removeEventListener('online', handleStatusChange);
   window.removeEventListener('offline', handleStatusChange);
  };
 }, []);

 const handleSend = () => {
  if (!input.trim() || disabled || !isOnline) return;
  onSend(input);
  setInput("");
 };

 const handlePlanSubmit = () => {
  if (!topic.trim() || disabled || !isOnline) return;
  
  if (onStartPlan) {
   onStartPlan(topic, days, level);
  } else {
   onSend(`Create a ${days}-day ${level} plan for ${topic}`);
  }
  
  setTopic("");
  setShowSettings(false);
 };

 return (
  <div className="relative">
   
   {/* --- Settings Popover --- */}
   <AnimatePresence>
    {showSettings && (
     <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-full mb-4 left-0 w-full md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-20"
      ref={settingsRef}
     >
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
         <SlidersHorizontal size={18} className="text-indigo-600"/> 
         Plan Builder
        </h4>
        <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-rose-500">
         <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {!isOnline && (
         <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
          <WifiOff size={16} className="text-amber-600" />
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">AI Architect is unavailable offline.</p>
         </div>
        )}

        {/* Topic Input */}
        <div>
         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
          Goal / Topic
         </label>
         <input 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Learn React Native, Marathon Training..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 disabled:opacity-50"
          autoFocus
          disabled={!isOnline}
         />
        </div>

        {/* Experience Level Selector */}
        <div>
         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          Experience Level
         </label>
         <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
          {(["Beginner","Intermediate","Advanced"] as SkillLevel[]).map((l) => (
           <button
            key={l}
            onClick={() => setLevel(l)}
            disabled={!isOnline}
            className={`text-xs font-bold py-1.5 rounded-md transition-all ${
             level === l 
              ?"bg-white text-indigo-600 shadow-sm border border-slate-200" 
              :"text-slate-500 hover:text-slate-700"
            } disabled:opacity-50`}
           >
            {l}
           </button>
          ))}
         </div>
        </div>

        {/* Duration Slider */}
        <div>
         <div className="flex justify-between items-end mb-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Duration
          </label>
          <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-0.5 rounded">
            {days} Days
          </span>
         </div>
         <input 
          type="range" 
          min="3" 
          max="60" 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          disabled={!isOnline}
          className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
         />
        </div>

        {/* Action Button */}
        <button
         onClick={handlePlanSubmit}
         disabled={!topic.trim() || disabled || !isOnline}
         className="w-full py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
         <Sparkles size={16} /> Generate Blueprint
        </button>
      </div>
      
      {/* Arrow Pointer */}
      <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-b border-r border-slate-200 rotate-45"></div>
     </motion.div>
    )}
   </AnimatePresence>

   {/* --- Main Input Bar --- */}
   <div className="flex items-center gap-2">
    <button
     onClick={() => setShowSettings(!showSettings)}
     className={`h-13.5 w-13.5 rounded-xl flex items-center justify-center transition-all border ${
      showSettings 
       ?"bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner" 
       :"bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
     }`}
     title="Open Plan Builder"
    >
     <SlidersHorizontal size={20} />
    </button>

    <input
     value={input}
     onChange={(e) => setInput(e.target.value)}
     onKeyDown={(e) => e.key ==="Enter" && !e.shiftKey && handleSend()}
     placeholder={isOnline ?"Type a message or use the builder..." :"AI unavailable offline..."}
     className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none shadow-inner disabled:opacity-50 text-slate-800"
     disabled={disabled || !isOnline}
    />

    <button
     onClick={handleSend}
     disabled={!input.trim() || disabled || !isOnline}
     className="h-13.5 w-13.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 px-4 py-3"
    >
     <Send size={20} />
    </button>
   </div>
  </div>
 );
}
