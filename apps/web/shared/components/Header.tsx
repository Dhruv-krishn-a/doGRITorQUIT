"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "../../config/site";
import { supabase } from "../../utils/supabase";
import Avatar from "./Avatar";
import Modal from "./ui/Modal";
import { useToast } from "./ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, Settings, User, ChevronDown, Sparkles, Menu, X, LayoutDashboard, CreditCard, ArrowRight
} from "lucide-react";

type Props = {
  nav: NavItem[];
};

export default function Header({ nav }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const mainNav = useMemo(() => {
    return (nav || [])
      .filter((n) => n.group === "main" && n.visible)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [nav]);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const ddRef = useRef<HTMLDivElement | null>(null);

  // Click outside handler
  useEffect(() => {
    function onDoc(e: MouseEvent | TouchEvent) {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, []);

  // Auth Session Handler
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setUserEmail(data?.session?.user?.email ?? null);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUserEmail(session?.user?.email ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  async function doSignOut() {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.showToast({ title: "Signed out", message: "See you next time!", type: "success" });
      
      setProfileOpen(false);
      setMobileMenuOpen(false);
      setShowLogoutModal(false); 
      
      router.push("/login");
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === "string") errorMessage = error;

      toast.showToast({ title: "Sign out error", message: errorMessage, type: "error" });
    } finally {
      setLoggingOut(false);
    }
  }

  const handleMobileLinkClick = () => setMobileMenuOpen(false);

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springConfig}
        className="sticky top-0 z-1000 w-full bg-white/60 backdrop-blur-2xl border-b border-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-500 transform-gpu antialiased"
      >
        <div className="w-full px-6 md:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            {/* Logo area */}
            <Link href="/" className="group flex items-center gap-3 select-none" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-rose-500 to-fuchsia-500 text-white shadow-md shadow-rose-200 group-hover:shadow-lg group-hover:shadow-rose-300 group-hover:scale-105 transition-all duration-300">
                <Sparkles size={20} className="absolute group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl tracking-tighter text-slate-900 group-hover:text-rose-600 transition-colors">DO GRIT</span>
                <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase group-hover:text-rose-400 transition-colors">OK QUIT</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {mainNav.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`relative px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all duration-300 overflow-hidden ${
                      isActive 
                        ? "text-rose-600 shadow-sm" 
                        : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="headerNav"
                        className="absolute inset-0 bg-rose-50 border border-rose-100 rounded-xl -z-10"
                        transition={springConfig}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex items-center gap-4">
              {userEmail ? (
                <div className="relative" ref={ddRef}>
                  <button
                    onClick={() => setProfileOpen((s) => !s)}
                    className={`flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl border transition-all duration-300 group focus:outline-none bg-white/50 shadow-sm hover:shadow-md ${
                      profileOpen 
                        ? "border-rose-300 ring-4 ring-rose-50" 
                        : "border-slate-100 hover:border-rose-200"
                    }`}
                  >
                    <div className="rounded-full overflow-hidden border border-white shadow-sm group-hover:scale-105 transition-transform">
                       <Avatar email={userEmail} size={8} />
                    </div>
                    
                    <div className="flex flex-col items-start text-left">
                        <span className="text-xs font-black text-slate-800 group-hover:text-rose-600 max-w-32 truncate leading-tight uppercase tracking-tighter transition-colors">{userEmail.split('@')[0]}</span>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">Pro Sync</span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ml-1 ${profileOpen ? "rotate-180 text-rose-500" : "group-hover:text-rose-400"}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={springConfig}
                        className="absolute right-0 mt-4 w-72 bg-white/90 backdrop-blur-3xl rounded-4xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white overflow-hidden z-50 p-3"
                      >
                        <div className="px-4 py-4 bg-slate-50/80 rounded-3xl mb-3 border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated Entity</p>
                          <p className="text-xs font-bold text-slate-800 truncate">{userEmail}</p>
                        </div>
                        <div className="space-y-1">
                            <DropdownItem href="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/profile" icon={<User size={16} />} label="Profile" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/settings/billing" icon={<CreditCard size={16} />} label="Billing" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/dashboard/settings" icon={<Settings size={16} />} label="Settings" onClick={() => setProfileOpen(false)} />
                        </div>
                        <div className="h-px bg-slate-100 my-3 mx-2" />
                        <button onClick={() => { setProfileOpen(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors text-left group">
                          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Disconnect
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <Link href="/login" className="text-[11px] font-black text-slate-500 hover:text-slate-900 px-5 py-3 rounded-full hover:bg-slate-50 transition-all uppercase tracking-widest">Sign in</Link>
                   <Link href="/signup" className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-md shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                     <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                     <span className="relative z-10">Initialize</span> 
                     <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Trigger */}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2.5 text-slate-500 hover:text-rose-600 bg-white shadow-sm border border-slate-200 hover:border-rose-200 rounded-xl transition-all active:scale-95">
               <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-1200 md:hidden" />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white/90 backdrop-blur-3xl border-l border-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-1300 md:hidden flex flex-col transform-gpu antialiased"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                    <span className="font-black text-xl text-slate-900 tracking-tighter uppercase">Command Center</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2.5 text-slate-400 bg-white border border-slate-200 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-xl shadow-sm transition-all"><X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
                    {userEmail && (
                        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/60 shadow-inner">
                            <div className="border-2 border-white shadow-sm rounded-full overflow-hidden shrink-0">
                              <Avatar email={userEmail} size={48} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-black text-slate-800 tracking-tight truncate">{userEmail}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Pro Sync Active</p>
                            </div>
                        </div>
                    )}
                    <nav className="space-y-3">
                        {mainNav.map((item) => {
                           const isActive = pathname === item.path;
                           return (
                            <Link 
                              key={item.id} 
                              href={item.path} 
                              onClick={handleMobileLinkClick} 
                              className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black tracking-[0.2em] uppercase transition-all shadow-sm border ${
                                isActive 
                                  ? "bg-rose-50 text-rose-600 border-rose-200" 
                                  : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-slate-100"
                              }`}
                            >
                                {item.label}
                            </Link>
                           );
                        })}
                    </nav>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white/50 shrink-0">
                    {userEmail ? (
                        <div className="grid grid-cols-2 gap-4">
                             <Link href="/dashboard" onClick={handleMobileLinkClick} className="flex items-center justify-center gap-2 px-4 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                               <LayoutDashboard size={14} /> Dashboard
                             </Link>
                             <button onClick={() => { setMobileMenuOpen(false); setShowLogoutModal(true); }} className="flex items-center justify-center gap-2 px-4 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm">
                               <LogOut size={14} /> Disconnect
                             </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Link href="/login" onClick={handleMobileLinkClick} className="w-full text-center px-4 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 shadow-sm transition-all">Sign In</Link>
                            <Link href="/signup" onClick={handleMobileLinkClick} className="w-full text-center px-4 py-4 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 text-white text-xs font-black uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-rose-200 transition-all">Initialize</Link>
                        </div>
                    )}
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal isOpen={showLogoutModal} title="Terminate Session?" onClose={() => setShowLogoutModal(false)} onConfirm={async () => { await doSignOut(); }} confirmLabel="Disconnect" cancelLabel="Stay" confirmLoading={loggingOut}>
        <p className="text-slate-500 text-sm font-medium">You are about to disconnect from the Neural Command Center. You will need to authenticate again to access your dashboard.</p>
      </Modal>
    </>
  );
}

// Light theme dropdown item
function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all group">
            <span className="text-slate-400 group-hover:text-rose-500 transition-colors">{icon}</span>
            {label}
        </Link>
    );
}