import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NavItem } from "../../config/site";
import { authService } from "../../features/auth/hooks/useAuth";
import Avatar from "../ui/Avatar";
import Modal from "../ui/Modal";
import { toast } from "sonner";
import { useTheme } from "../../hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { 
 LogOut, Settings, ChevronDown, Menu, X, PlusCircle, Palette, User, Shield, CreditCard
} from "lucide-react";
import { api } from "../../services/api";

import { GritioLogo } from '@gritorquit/dashboard-ui-web';

type Props = {
 nav: NavItem[];
};

export default function Header({ nav }: Props) {
 const location = useLocation();
 const pathname = location.pathname;
 const navigate = useNavigate();
 const { theme, changeTheme, themes } = useTheme();

 const mainNav = useMemo(() => {
  return (nav || [])
   .filter((n) => n.group === "main" && n.visible)
   .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
 }, [nav]);

 const [userEmail, setUserEmail] = useState<string | null>(null);
 const [userName, setUserName] = useState<string | null>(null);
 const [profileOpen, setProfileOpen] = useState(false);
 const [themeOpen, setThemeOpen] = useState(false);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [showLogoutModal, setShowLogoutModal] = useState(false);
 const [loggingOut, setLoggingOut] = useState(false);
 const [mobileProfileExpanded, setMobileProfileExpanded] = useState(false);

 const ddRef = useRef<HTMLDivElement | null>(null);
 const themeRef = useRef<HTMLDivElement | null>(null);

 // Click outside handler
 useEffect(() => {
  function onDoc(e: MouseEvent | TouchEvent) {
   if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
    setProfileOpen(false);
   }
   if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
    setThemeOpen(false);
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
  const syncSession = async () => {
   const session = authService.getSession();
   if (session?.user) {
    setUserEmail(session.user.email ?? null);
    
    // Fetch full profile for the name
    try {
      const data = await api.get("/api/auth/me");
      if (data?.name) {
        setUserName(data.name);
      } else {
        setUserName(session.user.user_metadata?.full_name || null);
      }
    } catch (err) {
      setUserName(session.user.user_metadata?.full_name || null);
    }
   } else {
    setUserEmail(null);
    setUserName(null);
   }
  };
  
  syncSession();
  authService.addEventListener('auth-change', syncSession);

  return () => {
   authService.removeEventListener('auth-change', syncSession);
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
   authService.logout();
   
   toast.success("Signed out successfully.");
   
   setProfileOpen(false);
   setMobileMenuOpen(false);
   setShowLogoutModal(false); 
   
   navigate("/login");
  } catch (error: unknown) {
   toast.error("Error signing out.");
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
    className="transform-gpu sticky top-0 z-[1000] w-full bg-[var(--bg-card)]/80 backdrop-blur-3xl border-b border-[var(--border-color)] shadow-2xl transition-all duration-500 transform-gpu antialiased"
   >
    <div className="transform-gpu w-full px-6 md:px-10 h-20 flex items-center justify-between">
     <div className="transform-gpu flex items-center gap-10">
      {/* Logo area */}
      <Link to="/" className="transform-gpu group flex items-center gap-3 select-none" onClick={() => setMobileMenuOpen(false)}>
       <GritioLogo size="sm" withText={true} />
      </Link>

      {/* Desktop Navigation */}
      <nav className="transform-gpu hidden md:flex items-center gap-2">
       {mainNav.map((item) => {
        const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== "/");
        return (
         <Link
          key={item.id}
          to={item.path}
          className={`relative px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all duration-300 overflow-hidden ${
           isActive 
            ? "text-[var(--text-primary)] shadow-sm" 
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
         >
          {isActive && (
           <motion.div 
            layoutId="headerNav"
            className="transform-gpu absolute inset-0 bg-[var(--accent-color)]/10 border border-[var(--border-color)]/20 rounded-xl -z-10"
            transition={springConfig}
           />
          )}
          <span className="transform-gpu relative z-10">{item.label}</span>
         </Link>
        );
       })}
      </nav>
     </div>

     <div className="transform-gpu flex items-center gap-3 md:gap-4">
      {/* Theme Switcher */}
      <div className="transform-gpu relative" ref={themeRef}>
         <button
           onClick={() => setThemeOpen(!themeOpen)}
           className="transform-gpu p-2.5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center"
           title="Change Theme"
         >
           <Palette size={18} />
         </button>

         <AnimatePresence>
          {themeOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={springConfig}
              className="transform-gpu absolute right-0 mt-4 w-72 bg-[var(--bg-card)]/95 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-[var(--border-color)] overflow-hidden z-50 p-3"
            >
              <div className="px-4 py-3 mb-2 border-b border-[var(--border-color)]">
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Select Theme</p>
              </div>
              <div className="space-y-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      changeTheme(t.id);
                      setThemeOpen(false);
                    }}
                    className={`transform-gpu w-full flex flex-col items-start px-4 py-3 rounded-2xl transition-all ${
                      theme === t.id 
                        ? "bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 shadow-sm" 
                        : "hover:bg-[var(--bg-secondary)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-widest ${theme === t.id ? "text-[var(--accent-color)]" : "text-[var(--text-primary)]"}`}>
                        <span className="text-base">{t.emoji}</span>
                        {t.name}
                      </span>
                      {theme === t.id && (
                        <motion.div layoutId="theme-active" className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />
                      )}
                    </div>
                    <p className={`text-[9px] font-bold mt-1 text-left ${theme === t.id ? "text-[var(--accent-color)]/70" : "text-[var(--text-secondary)]"}`}>
                      {t.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
         </AnimatePresence>
      </div>

      <div className="transform-gpu flex items-center gap-2 md:gap-4">
       {userEmail ? (
        <div className="transform-gpu relative hidden md:block" ref={ddRef}>
         <button
          onClick={() => setProfileOpen((s) => !s)}
          className={`flex items-center gap-2 md:gap-3 pl-2 pr-2 md:pr-4 py-2 rounded-2xl border transition-all duration-300 group focus:outline-none bg-[var(--bg-secondary)]/50 shadow-sm ${
           profileOpen 
            ? "border-[var(--accent-color)] ring-4 ring-[var(--accent-color)]/10" 
            : "border-[var(--border-color)] hover:border-[var(--accent-color)]"
          }`}
         >
          <div className="transform-gpu rounded-full overflow-hidden border border-[var(--border-color)] shadow-sm group-hover:scale-105 transition-transform">
            <Avatar email={userEmail} size={8} />
          </div>
          
          <div className="transform-gpu hidden sm:flex flex-col items-start text-left">
            <span className="transform-gpu text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--accent-color)] max-w-24 lg:max-w-32 truncate leading-tight uppercase tracking-tighter transition-colors">{userName || userEmail.split('@')[0]}</span>
            <span className="transform-gpu text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest leading-none mt-0.5 hidden lg:inline">Sync Active</span>
          </div>
          <ChevronDown size={14} className={`text-[var(--text-secondary)] transition-transform duration-300 ${profileOpen ? "rotate-180 text-[var(--accent-color)]" : "group-hover:text-[var(--accent-color)]"}`} />
         </button>

         <AnimatePresence>
          {profileOpen && (
           <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={springConfig}
            className="transform-gpu absolute right-0 mt-4 w-72 bg-[var(--bg-card)]/90 backdrop-blur-3xl rounded-4xl shadow-2xl border border-[var(--border-color)] overflow-hidden z-50 p-3"
           >
            <div className="transform-gpu px-4 py-4 bg-[var(--bg-secondary)]/80 rounded-3xl mb-3 border border-[var(--border-color)]">
             <p className="transform-gpu text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">User ID</p>
             <p className="transform-gpu text-xs font-bold text-[var(--text-primary)] truncate">{userName || userEmail}</p>
            </div>
            <div className="transform-gpu space-y-1">
              <DropdownItem to="/settings" icon={<Settings size={16} />} label="Settings" onClick={() => setProfileOpen(false)} />
            </div>
            <div className="transform-gpu h-px bg-[var(--border-color)] my-3 mx-2" />
            <button onClick={() => { setProfileOpen(false); setShowLogoutModal(true); }} className="transform-gpu w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors text-left group">
             <LogOut size={16} className="transform-gpu group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
           </motion.div>
          )}
         </AnimatePresence>
        </div>
       ) : (
        <div className="transform-gpu flex items-center gap-3">
          <Link to="/login" className="transform-gpu text-[11px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-5 py-3 rounded-full hover:bg-[var(--bg-secondary)] transition-all uppercase tracking-widest">Sign in</Link>
          <Link to="/signup" className="transform-gpu group flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--accent-color)] text-[var(--bg-primary)] text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-color)]/20 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            <span>Get Started</span> 
          </Link>
        </div>
       )}
      </div>
      
      {/* Mobile Menu Trigger */}
      <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl transition-all active:scale-95">
        <Menu size={20} />
      </button>
     </div>
    </div>
   </motion.header>

   {/* --- Mobile Menu --- */}
   <AnimatePresence>
    {mobileMenuOpen && (
     <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-[var(--bg-primary)]/60 backdrop-blur-sm z-[1200] md:hidden" />
      <motion.div 
       initial={{ x: "100%" }} 
       animate={{ x: 0 }} 
       exit={{ x: "100%" }} 
       transition={{ type: "spring", damping: 25, stiffness: 200 }} 
       className="fixed inset-y-0 right-0 w-full max-w-sm bg-[var(--bg-card)] border-l border-[var(--border-color)] shadow-2xl z-[1300] md:hidden flex flex-col antialiased"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] shrink-0">
          <GritioLogo size="sm" withText={true} />
          <button onClick={() => setMobileMenuOpen(false)} className="p-3 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"><X size={24} strokeWidth={2.5} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {userEmail && (
            <div className="space-y-2">
                <button 
                    onClick={() => setMobileProfileExpanded(!mobileProfileExpanded)}
                    className="w-full flex items-center justify-between bg-[var(--bg-secondary)]/30 p-5 rounded-3xl border border-[var(--border-color)] transition-all hover:bg-[var(--bg-secondary)]/50 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] border border-[var(--accent-color)]/20">
                          <User size={20} />
                        </div>
                        <div className="text-left overflow-hidden">
                            <p className="font-bold text-[var(--text-primary)] truncate text-sm uppercase tracking-tight">{userName || userEmail.split('@')[0]}</p>
                            <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest mt-0.5 opacity-60">Account Node</p>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-transform duration-300 ${mobileProfileExpanded ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                    {mobileProfileExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden space-y-2"
                        >
                            <div className="mt-2 p-2 bg-[var(--bg-secondary)]/20 rounded-[2rem] border border-[var(--border-color)] space-y-1">
                                <Link 
                                    to="/settings" 
                                    onClick={handleMobileLinkClick}
                                    className="flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                                >
                                    <Settings size={16} /> Settings
                                </Link>
                                <button 
                                    onClick={() => { setMobileMenuOpen(false); setShowLogoutModal(true); }}
                                    className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all text-left"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          )}
          
          <div className="space-y-4">
            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] px-2 opacity-50">Navigation</p>
            <nav className="space-y-2">
                {(nav || [])
                  .filter(n => n.group === 'dashboard' && n.visible)
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((item) => {
                    const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== "/");
                    return (
                        <Link 
                          key={item.id} 
                          to={item.path} 
                          onClick={handleMobileLinkClick} 
                          className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-sm border ${
                            isActive 
                              ? "bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/20" 
                              : "bg-[var(--bg-secondary)]/30 text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]/30"
                          }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
          {!userEmail && (
            <div className="flex flex-col gap-4">
              <Link to="/login" onClick={handleMobileLinkClick} className="w-full text-center px-4 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] transition-all">Sign In</Link>
              <Link to="/signup" onClick={handleMobileLinkClick} className="w-full text-center px-4 py-4 rounded-2xl bg-[var(--accent-color)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-color)]/20 transition-all">Get Started</Link>
            </div>
          )}
        </div>
      </motion.div>
     </>
    )}
   </AnimatePresence>

   <Modal isOpen={showLogoutModal} title="Sign Out?" onClose={() => setShowLogoutModal(false)} onConfirm={async () => { await doSignOut(); }} confirmLabel="Sign Out" cancelLabel="Stay" confirmLoading={loggingOut}>
    <p className="text-[var(--text-secondary)] text-sm font-medium">You are about to sign out. You will need to login again to access your data.</p>
   </Modal>
  </>
 );
}

function DropdownItem({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all group">
      <span className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors">{icon}</span>
      {label}
    </Link>
  );
}
