"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, User, Github, Linkedin, Mail, 
  Send, ExternalLink, Download, Code2, 
  Cpu, Layout, Sparkles, Heart, AlertCircle, Loader2, CheckCircle2
} from 'lucide-react';

interface DeveloperHubProps {
  platform: 'web' | 'desktop' | 'mobile';
  userEmail?: string;
  onSendFeedback: (data: { message: string; type: string; platform: string }) => Promise<void>;
}

export function DeveloperHub({ platform, userEmail, onSendFeedback }: DeveloperHubProps) {
  const [activeTab, setActiveTab] = useState<'FEEDBACK' | 'ABOUT' | 'HISTORY'>('FEEDBACK');
  const [feedbackType, setFeedbackType] = useState('BUG');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const fetchTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchTickets();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      await onSendFeedback({
        message,
        type: feedbackType,
        platform
      });
      setIsSent(true);
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-6 md:p-10 space-y-10">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border-color)] pb-8">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter flex items-center gap-4">
            <div className="p-4 bg-[var(--bg-secondary)] text-[var(--accent-color)] rounded-[1.5rem] border border-[var(--border-color)] shadow-xl">
              <Cpu size={28} />
            </div>
            Developer Hub
          </h1>
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.5em] mt-4 ml-1">
            Community & Creator Portal
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[var(--bg-secondary)] p-1.5 rounded-2xl border border-[var(--border-color)] shadow-inner">
          <button 
            onClick={() => setActiveTab('FEEDBACK')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FEEDBACK' ? 'bg-[var(--bg-card)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <MessageSquare size={14} /> Feedback
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HISTORY' ? 'bg-[var(--bg-card)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Layout size={14} /> My Tickets
          </button>
          <button 
            onClick={() => setActiveTab('ABOUT')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ABOUT' ? 'bg-[var(--bg-card)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <User size={14} /> About Me
          </button>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'FEEDBACK' ? (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                  
                  {isSent ? (
                    <div className="py-20 flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Transmission Successful</h2>
                        <p className="text-[var(--text-secondary)] text-sm font-medium mt-2 max-w-xs">Your feedback has been logged into the developer stream.</p>
                      </div>
                      <button 
                        onClick={() => setIsSent(false)}
                        className="px-8 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[var(--accent-color)] transition-all"
                      >
                        Send Another Signal
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-3">
                          <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Issue Type</label>
                          <div className="flex gap-2">
                            {['BUG', 'FEATURE', 'IDEA'].map(t => (
                              <button 
                                key={t}
                                type="button"
                                onClick={() => setFeedbackType(t)}
                                className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${feedbackType === t ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 space-y-3 text-left">
                          <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Platform Source</label>
                          <div className="px-6 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-black text-[var(--accent-color)] uppercase italic shadow-inner">
                            Detected: {platform.toUpperCase()} CLIENT
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Detailed Report</label>
                        <textarea 
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Describe the bug or feature in detail..."
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] p-8 text-sm font-black italic text-[var(--text-primary)] uppercase tracking-tighter focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all outline-none resize-none min-h-[240px] shadow-inner"
                        />
                      </div>

                      <button 
                        disabled={isSending || !message.trim()}
                        className="w-full py-6 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[var(--accent-color)]/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all"
                      >
                        {isSending ? <Loader2 size={20} className="animate-spin" /> : <>Transmit Signal <Send size={16} /></>}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Disclaimer / Independent Dev Section */}
              <div className="space-y-6">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] p-8 space-y-6 text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-rose-500" size={24} />
                    <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest italic">Personal Disclaimer</h3>
                  </div>
                  <p className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed italic uppercase opacity-80">
                    I am an independent developer building this ecosystem overtime. Thank you for your patience—I am a one-man army. If you find a critical bug that breaks your workflow, I sincerely apologize.
                  </p>
                  <a 
                    href="mailto:dogritorquit@gmail.com"
                    className="flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] group"
                  >
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-rose-500" />
                      <span className="text-[10px] font-black uppercase text-[var(--text-primary)]">Direct Gmail</span>
                    </div>
                    <ExternalLink size={12} className="text-[var(--text-secondary)] group-hover:text-rose-500 transition-colors" />
                  </a>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 text-left">
                   <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-6 italic opacity-40">System Status</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]/50">
                         <span className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Version</span>
                         <span className="text-[10px] font-black uppercase text-[var(--text-primary)]">1.0.4 Production</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]/50">
                         <span className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Client</span>
                         <span className="text-[10px] font-black uppercase text-[var(--accent-color)]">{platform.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                         <span className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Global Sync</span>
                         <span className="text-[10px] font-black uppercase text-emerald-500">Active</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'HISTORY' ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-xl">
                <h2 className="text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-8">My Submitted Tickets</h2>
                {isLoadingTickets ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-[var(--accent-color)]" size={32} />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-20 text-[var(--text-secondary)]">
                    <p className="text-sm font-bold uppercase tracking-widest">No tickets found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex flex-col md:flex-row justify-between gap-4 group">
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-black uppercase text-[var(--text-secondary)]">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : ticket.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {ticket.status}
                              </span>
                           </div>
                           <p className="text-sm font-bold text-[var(--text-primary)]">{ticket.message.split('\\n')[0]}</p>
                        </div>
                        <div className="text-[10px] font-mono text-[var(--text-secondary)] opacity-50 shrink-0 self-start">
                          ID: {ticket.id.slice(-6)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-10"
            >
              {/* Bio Section */}
              <div className="lg:col-span-3 space-y-10">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-12 shadow-xl text-left">
                  <h2 className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-6">About the Creator</h2>
                  <p className="text-base font-bold text-[var(--text-secondary)] leading-relaxed mb-8 italic uppercase opacity-80 tracking-tight">
                    Hi, I'm Dhruv Krishna — a Computer Science engineer and Technical Business Analyst who enjoys building systems that actually solve real problems.
                  </p>
                  <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-10">
                    I work at the intersection of product thinking + engineering, where I translate ideas into structured, scalable solutions. My experience ranges from writing BRDs/SRS and designing system architecture to building full-fledged applications.
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)]">
                       <Cpu size={20} className="text-[var(--accent-color)] mb-4" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] mb-2 italic">What I Do</h4>
                       <p className="text-[9px] font-bold text-[var(--text-secondary)] leading-normal uppercase">Bridging requirements and execution with scalable architecture.</p>
                    </div>
                    <div className="p-6 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)]">
                       <Code2 size={20} className="text-[var(--accent-color)] mb-4" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] mb-2 italic">Tech Stack</h4>
                       <p className="text-[9px] font-bold text-[var(--text-secondary)] leading-normal uppercase">C++, JavaScript, TypeScript, React, React Native, Node.js.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { name: 'Dogrit Planner', desc: 'Monorepo Productivity', icon: <Layout size={18} /> },
                     { name: 'Liphis', desc: 'C++ File Manager', icon: <Code2 size={18} /> },
                     { name: 'KeyNav', desc: 'Keyboard Navigation', icon: <Cpu size={18} /> }
                   ].map(proj => (
                     <div key={proj.name} className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] shadow-sm hover:border-[var(--accent-color)]/30 transition-all">
                        <div className="text-[var(--accent-color)] mb-4">{proj.icon}</div>
                        <h4 className="text-[10px] font-black uppercase text-[var(--text-primary)] mb-1 italic">{proj.name}</h4>
                        <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{proj.desc}</p>
                     </div>
                   ))}
                </div>
              </div>

              {/* Social / Connect Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-[3rem] p-10 flex flex-col items-center text-center">
                   <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full border-2 border-[var(--accent-color)] flex items-center justify-center text-4xl mb-6 shadow-xl relative group">
                      <span className="group-hover:scale-110 transition-transform duration-500 select-none">DK</span>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[var(--bg-primary)] shadow-sm" />
                   </div>
                   <h3 className="text-xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">Dhruv Krishna</h3>
                   <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-2 mb-10 italic">Core Architect</p>
                   
                   <div className="w-full space-y-4">
                      <a href="https://github.com/Dhruv-krishn-a" target="_blank" className="w-full flex items-center justify-between p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all group">
                         <div className="flex items-center gap-4">
                            <Github size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                            <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">GitHub Profile</span>
                         </div>
                         <ExternalLink size={14} className="opacity-20 group-hover:opacity-100 group-hover:text-[var(--accent-color)]" />
                      </a>
                      <a href="https://github.com/Dhruv-krishn-a/dogritorquit-releases" target="_blank" className="w-full flex items-center justify-between p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all group">
                         <div className="flex items-center gap-4">
                            <Download size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                            <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Latest Releases</span>
                         </div>
                         <Sparkles size={14} className="opacity-20 group-hover:opacity-100 text-amber-500" />
                      </a>
                      <a href="https://www.linkedin.com/in/dhruv-krishna-410b98221/" target="_blank" className="w-full flex items-center justify-between p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all group">
                         <div className="flex items-center gap-4">
                            <Linkedin size={20} className="text-[#0077B5]" />
                            <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Connect</span>
                         </div>
                         <Heart size={14} className="opacity-20 group-hover:opacity-100 text-rose-500" />
                      </a>
                   </div>
                </div>

                <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] text-center">
                   <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed italic">
                     Collaboration, feedback, and interesting problems are always welcome. Stand by for neural link initialization.
                   </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
