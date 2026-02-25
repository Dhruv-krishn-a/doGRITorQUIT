// apps/web/shared/components/Header.tsx
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

  // Body scroll lock
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
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.showToast({ title: "Sign out error", message: errorMessage, type: "error" });
    } finally {
      setLoggingOut(false);
    }
  }

  const handleMobileLinkClick = () => setMobileMenuOpen(false);

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        // CHANGED: Deep cherry background with matching border
        className="sticky top-0 z-50 w-full border-b border-rose-900/40 bg-[#1c0510]/80 backdrop-blur-xl transition-all duration-300"
      >
        <div className="w-full px-4 md:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="group flex items-center gap-2.5 select-none" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-rose-600 to-fuchsia-600 text-white shadow-lg shadow-rose-500/25 group-hover:shadow-rose-500/50 group-hover:scale-105 transition-all duration-300">
                <Sparkles size={18} className="absolute group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl tracking-tight text-rose-50 group-hover:text-rose-400 transition-colors">DO GRIT</span>
                <span className="text-[10px] font-black text-rose-500/50 tracking-widest uppercase group-hover:text-rose-500">OK QUIT</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    // CHANGED: Nav links styling matching the neon pink aesthetic
                    className={`relative px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-black transition-all duration-200 border ${
                      isActive 
                        ? "text-rose-100 bg-linear-to-r from-rose-500/20 to-rose-500/5 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]" 
                        : "border-transparent text-rose-200/60 hover:text-rose-100 hover:bg-rose-500/10"
                    }`}
                  >
                    {item.label}
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
                    // CHANGED: Profile button hover/active states
                    className={`flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full border transition-all duration-200 group focus:outline-none ${
                      profileOpen 
                        ? "bg-rose-500/10 border-rose-500/30 ring-4 ring-rose-500/10" 
                        : "border-transparent hover:bg-rose-500/10 hover:border-rose-500/20"
                    }`}
                  >
                    <div className="rounded-full overflow-hidden border border-rose-500/20 group-hover:border-rose-500/50 transition-colors">
                       <Avatar email={userEmail} size={8} />
                    </div>
                    
                    <div className="flex flex-col items-start text-left">
                        <span className="text-xs font-black text-rose-50 group-hover:text-rose-400 max-w-30 truncate leading-tight uppercase tracking-tighter">{userEmail.split('@')[0]}</span>
                        <span className="text-[9px] text-rose-500/60 font-black uppercase tracking-widest leading-none">Pro Sync</span>
                    </div>
                    <ChevronDown size={12} className={`text-rose-300/50 transition-transform duration-200 ml-1 ${profileOpen ? "rotate-180 text-rose-400" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        // CHANGED: Dropdown container
                        className="absolute right-0 mt-3 w-64 bg-[#1c0510] rounded-2xl shadow-[0_8px_32px_rgba(244,63,94,0.15)] border border-rose-500/20 overflow-hidden z-50 p-2 backdrop-blur-2xl"
                      >
                        {/* CHANGED: Dropdown Header */}
                        <div className="px-3 py-3 bg-[#2a081a] rounded-xl mb-2 border border-rose-500/20">
                          <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-[0.2em] mb-1">Authenticated Entity</p>
                          <p className="text-xs font-bold text-rose-100 truncate">{userEmail}</p>
                        </div>
                        <div className="space-y-0.5">
                            <DropdownItem href="/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/profile" icon={<User size={14} />} label="Profile" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/settings/billing" icon={<CreditCard size={14} />} label="Billing" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/dashboard/settings" icon={<Settings size={14} />} label="Settings" onClick={() => setProfileOpen(false)} />
                        </div>
                        <div className="h-px bg-rose-900/40 my-2 mx-2" />
                        <button onClick={() => { setProfileOpen(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left">
                          <LogOut size={14} /> Disconnect
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <Link href="/login" className="text-xs font-black text-rose-200/60 hover:text-rose-100 px-4 py-2.5 rounded-full hover:bg-rose-500/10 transition-all uppercase tracking-widest">Sign in</Link>
                   <Link href="/signup" className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all transform active:scale-95">
                     Initialize <ArrowRight size={14} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              )}
            </div>
            {/* CHANGED: Mobile Menu Trigger */}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2.5 text-rose-200/60 hover:text-rose-100 hover:bg-rose-500/10 rounded-xl transition-colors active:scale-95">
               <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden" />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              // CHANGED: Mobile drawer completely overhauled from light to cherry dark
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#1c0510] border-l border-rose-900/40 shadow-2xl shadow-rose-900/20 z-50 md:hidden flex flex-col"
            >
                <div className="flex items-center justify-between p-5 border-b border-rose-900/40">
                    <span className="font-bold text-lg text-rose-50">Command Center</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-rose-300/50 hover:text-rose-100 hover:bg-rose-500/10 rounded-full transition-colors"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-none">
                    {userEmail && (
                        <div className="flex items-center gap-4 bg-[#2a081a] p-4 rounded-2xl border border-rose-500/20">
                            <div className="border border-rose-500/30 rounded-full overflow-hidden">
                              <Avatar email={userEmail} size={48} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-rose-100 truncate">{userEmail}</p>
                                <p className="text-xs text-rose-400/60 font-medium uppercase tracking-widest mt-0.5">Pro Sync</p>
                            </div>
                        </div>
                    )}
                    <nav className="space-y-2">
                        {mainNav.map((item) => {
                           const isActive = pathname === item.path;
                           return (
                            <Link 
                              key={item.id} 
                              href={item.path} 
                              onClick={handleMobileLinkClick} 
                              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all ${
                                isActive 
                                  ? "bg-linear-to-r from-rose-500/20 to-rose-500/5 text-rose-300 border border-rose-500/30" 
                                  : "text-rose-200/60 hover:bg-rose-500/10 hover:text-rose-100 border border-transparent"
                              }`}
                            >
                                {item.label}
                            </Link>
                           );
                        })}
                    </nav>
                </div>
                <div className="p-5 border-t border-rose-900/40 bg-[#14030b]">
                    {userEmail ? (
                        <div className="grid grid-cols-2 gap-3">
                             <Link href="/dashboard" onClick={handleMobileLinkClick} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2a081a] border border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-rose-100 hover:border-rose-500 hover:bg-rose-500/10 transition-all shadow-sm">
                               <LayoutDashboard size={14} /> Dashboard
                             </Link>
                             <button onClick={() => { setMobileMenuOpen(false); setShowLogoutModal(true); }} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2a081a] border border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-rose-400 hover:border-rose-500 hover:bg-rose-500/10 transition-all shadow-sm">
                               <LogOut size={14} /> Disconnect
                             </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link href="/login" onClick={handleMobileLinkClick} className="w-full text-center px-4 py-3.5 rounded-xl bg-[#2a081a] border border-rose-500/30 text-rose-100 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-colors">Sign In</Link>
                            <Link href="/signup" onClick={handleMobileLinkClick} className="w-full text-center px-4 py-3.5 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all">Initialize</Link>
                        </div>
                    )}
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal isOpen={showLogoutModal} title="Terminate Session?" onClose={() => setShowLogoutModal(false)} onConfirm={async () => { await doSignOut(); }} confirmLabel="Disconnect" cancelLabel="Stay" confirmLoading={loggingOut}>
        {/* CHANGED: Modal description text color */}
        <p className="text-rose-200/60 text-sm">You are about to disconnect from the Neural Command Center. You will need to authenticate again to access your dashboard.</p>
      </Modal>
    </>
  );
}

// CHANGED: DropdownItem completely overhauled from light to dark theme
function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-rose-200/70 rounded-xl hover:bg-rose-500/10 hover:text-rose-100 transition-all">
            <span className="text-rose-400/60">{icon}</span>
            {label}
        </Link>
    );
}