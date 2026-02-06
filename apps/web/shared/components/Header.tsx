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

  // IMPROVEMENT: Memoize this so it doesn't recalculate on every render
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
      // Type assertion is safe here as EventTarget is usually a Node in the DOM
      if (!ddRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc); // Added touch support for better mobile UX
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, []);

  // Auth Session Handler
  useEffect(() => {
    let mounted = true;
    
    // Initial fetch
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setUserEmail(data?.session?.user?.email ?? null);
      }
    })();

    // Listener
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
    // Cleanup function to ensure scroll is restored if component unmounts
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  async function doSignOut() {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.showToast({ title: "Signed out", message: "See you next time!", type: "success" });
      
      // Reset all UI states
      setProfileOpen(false);
      setMobileMenuOpen(false);
      setShowLogoutModal(false); 
      
      router.push("/login");
    } catch (error: unknown) { // ✅ FIXED: Changed 'any' to 'unknown'
      let errorMessage = "An unknown error occurred";
      
      // ✅ FIXED: Safely extract message
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
        className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60 transition-all duration-300"
      >
        <div className="w-full px-4 md:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="group flex items-center gap-2.5 select-none" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
                <Sparkles size={18} className="absolute group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">DO GRIT</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase group-hover:text-slate-500">OR QUIT</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive ? "text-indigo-600 bg-indigo-50/80 shadow-sm shadow-indigo-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
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
                    className={`flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full border transition-all duration-200 group focus:outline-none ${
                      profileOpen ? "bg-white border-indigo-100 ring-2 ring-indigo-50" : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <div className="rounded-full overflow-hidden">
                       <Avatar email={userEmail} size={10} />
                    </div>
                    
                    <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 max-w-30 truncate leading-tight">{userEmail.split('@')[0]}</span>
                        <span className="text-[10px] text-slate-400 font-medium leading-none">Free Plan</span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ml-1 ${profileOpen ? "rotate-180 text-indigo-500" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 p-2"
                      >
                        <div className="px-3 py-3 bg-slate-50/50 rounded-xl mb-2 border border-slate-50">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                          <p className="text-sm font-bold text-slate-800 truncate">{userEmail}</p>
                        </div>
                        <div className="space-y-0.5">
                            <DropdownItem href="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/profile" icon={<User size={16} />} label="Profile" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/settings/billing" icon={<CreditCard size={16} />} label="Billing" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/settings" icon={<Settings size={16} />} label="Settings" onClick={() => setProfileOpen(false)} />
                        </div>
                        <div className="h-px bg-slate-100 my-2 mx-2" />
                        <button onClick={() => { setProfileOpen(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors text-left">
                          <LogOut size={16} /> Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-4 py-2.5 rounded-full hover:bg-indigo-50 transition-all">Sign in</Link>
                   <Link href="/signup" className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all transform active:scale-95">
                     Get Started <ArrowRight size={14} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              )}
            </div>
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors active:scale-95">
               <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 md:hidden" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 md:hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <span className="font-bold text-lg text-slate-800">Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {userEmail && (
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <Avatar email={userEmail} size={48} />
                            <div className="overflow-hidden">
                                <p className="font-bold text-slate-900 truncate">{userEmail}</p>
                                <p className="text-xs text-slate-500 font-medium">Free Plan</p>
                            </div>
                        </div>
                    )}
                    <nav className="space-y-1">
                        {mainNav.map((item) => (
                            <Link key={item.id} href={item.path} onClick={handleMobileLinkClick} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${pathname === item.path ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    {userEmail ? (
                        <div className="grid grid-cols-2 gap-3">
                             <Link href="/dashboard" onClick={handleMobileLinkClick} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"><LayoutDashboard size={16} /> Dashboard</Link>
                             <button onClick={() => { setMobileMenuOpen(false); setShowLogoutModal(true); }} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"><LogOut size={16} /> Sign out</button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link href="/login" onClick={handleMobileLinkClick} className="w-full text-center px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors">Sign In</Link>
                            <Link href="/signup" onClick={handleMobileLinkClick} className="w-full text-center px-4 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all">Get Started</Link>
                        </div>
                    )}
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal isOpen={showLogoutModal} title="Ready to leave?" onClose={() => setShowLogoutModal(false)} onConfirm={async () => { await doSignOut(); }} confirmLabel="Sign out" cancelLabel="Stay" confirmLoading={loggingOut}>
        <p className="text-slate-500">You are about to sign out of your account. You will need to log in again to access your dashboard.</p>
      </Modal>
    </>
  );
}

function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
            <span className="text-slate-400">{icon}</span>
            {label}
        </Link>
    );
}