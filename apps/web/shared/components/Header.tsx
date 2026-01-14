// apps/web/app/components/Header.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "../../../../packages/config/siteNav";
import { supabase } from "../../utils/supabase";
import Avatar from "./Avatar";
import Modal from "@/shared/components/ui/Modal";
import { useToast } from "./ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, 
  Settings, 
  User, 
  ChevronDown, 
  Sparkles,
  Menu
} from "lucide-react";

type Props = {
  nav: NavItem[];
};

export default function Header({ nav }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const mainNav = nav.filter((n) => n.group === "main" && n.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const toast = useToast();

  // User State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Click Outside Handler
  const ddRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // Auth Listener
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUserEmail(data?.session?.user?.email ?? null);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function doSignOut() {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.showToast({ title: "Sign out failed", message: error.message ?? "Unknown error", type: "error" });
        return;
      }
      toast.showToast({ title: "Signed out", message: "See you next time!", type: "success" });
      setTimeout(() => {
        router.push("/login");
      }, 400);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.showToast({ title: "Sign out error", message, type: "error" });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl supports-backdrop-filter:bg-white/60"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* --- Left: Logo & Nav --- */}
          <div className="flex items-center gap-8">
            {/* Custom Logo Component */}
            <Link href="/" className="group flex items-center gap-2 select-none">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
                <Sparkles size={16} className="absolute" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-lg tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors">
                  DO GRIT
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase group-hover:text-slate-500">
                  OR QUIT
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={classNames(
                      "relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "text-indigo-600 bg-indigo-50" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* --- Right: User Actions --- */}
          <div className="flex items-center gap-4">
            {userEmail ? (
              <div className="relative" ref={ddRef}>
                <button
                  onClick={() => setProfileOpen((s) => !s)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-200 group focus:outline-hidden"
                >
                  <div className="ring-2 ring-white rounded-full shadow-sm">
                     <Avatar email={userEmail} />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-600 group-hover:text-slate-800 max-w-37.5 truncate">
                    {userEmail.split('@')[0]}
                  </span>
                  <ChevronDown 
                    size={14} 
                    className={classNames(
                      "text-slate-400 transition-transform duration-200", 
                      profileOpen ? "rotate-180" : ""
                    )} 
                  />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 p-1.5"
                    >
                      <div className="px-3 py-2 mb-1 border-b border-slate-50">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{userEmail}</p>
                      </div>
                      
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>

                      <div className="h-px bg-slate-100 my-1 mx-2" />

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 rounded-xl hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                 <Link 
                   href="/login" 
                   className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 transition-colors"
                 >
                   Sign in
                 </Link>
                 <Link 
                   href="/register" 
                   className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200 transition-all"
                 >
                   Get Started
                 </Link>
              </div>
            )}
            
            {/* Mobile Menu Toggle (Visible on small screens) */}
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
               <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        title="Ready to leave?"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          await doSignOut();
          setShowLogoutModal(false);
        }}
        confirmLabel="Sign out"
        cancelLabel="Stay"
        confirmLoading={loggingOut}
      >
        <p className="text-slate-500">
          You are about to sign out of your account. You will need to log in again to access your dashboard.
        </p>
      </Modal>
    </>
  );
}

// Utility for class merging
function classNames(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}