//apps/web/shared/components/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import { NavItem } from "../../config/site";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Heart,
  Sparkles,
  ArrowRight,
  Terminal
} from "lucide-react";

export default function Footer({ nav }: { nav: NavItem[] }) {
  // Defensive coding: Ensure nav is always an array
  const safeNav = Array.isArray(nav) ? nav : [];
  
  const footerNav = safeNav
    .filter((n) => n.group === "footer" && n.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#14030b] pt-16 pb-8 border-t border-rose-900/40 overflow-hidden font-sans text-rose-200/60 shadow-[0_-10px_30px_rgba(244,63,94,0.02)]">
      
      {/* Background Pattern (Dot Grid) - Adjusted to deep cherry/pink */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(rgba(244,63,94,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Decorative Blur Blob */}
      <div className="absolute top-0 right-1/4 w-125 h-125 bg-rose-600/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* --- Brand Column (Span 4) --- */}
          <div className="lg:col-span-4 space-y-6">
             <Link href="/" className="flex items-center gap-3 select-none group w-fit">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-[#2a081a] to-[#1c0510] border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] group-hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] group-hover:border-rose-500/60 transition-all duration-500">
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform duration-500" />
                  <div className="absolute inset-0 rounded-xl bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-xl tracking-tight text-rose-50 group-hover:text-rose-400 transition-colors uppercase">DO GRIT</span>
                  <span className="text-[10px] font-black text-rose-500/50 tracking-widest uppercase mt-0.5 group-hover:text-rose-500 transition-colors">OK QUIT</span>
                </div>
             </Link>
             
             <p className="text-rose-200/50 text-xs leading-relaxed max-w-sm font-bold tracking-wide">
               The operating system for developers who ship. Turn chaotic ideas into executed plans with AI-driven roadmaps.
             </p>

             <div className="flex items-center gap-3 pt-2">
                <SocialIcon icon={<Twitter size={16} />} href="#" label="Twitter" />
                <SocialIcon icon={<Github size={16} />} href="#" label="GitHub" />
                <SocialIcon icon={<Linkedin size={16} />} href="#" label="LinkedIn" />
             </div>
          </div>

          {/* --- Product Links (Span 2) --- */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="font-black text-rose-400/50 mb-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500/20 border border-rose-500/50"></span>
              Product
            </h3>
            <ul className="space-y-4">
              {footerNav.length > 0 ? footerNav.map((item) => (
                <FooterLink key={item.id} href={item.path} label={item.label} />
              )) : (
                <>
                  <FooterLink href="/features" label="Features" />
                  <FooterLink href="/pricing" label="Pricing" />
                </>
              )}
            </ul>
          </div>

          {/* --- Company Links (Span 2) --- */}
          <div className="lg:col-span-2">
            <h3 className="font-black text-rose-400/50 mb-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500/20 border border-rose-500/50"></span>
              Company
            </h3>
            <ul className="space-y-4">
              <FooterLink href="/about" label="About" />
              {/* Note: The blue badge matches the reference image perfectly */}
              <FooterLink href="/careers" label="Careers" badge="Hiring" badgeColor="blue" />
              <FooterLink href="/contact" label="Contact" />
            </ul>
          </div>

          {/* --- Newsletter (Span 4) --- */}
          <div className="lg:col-span-4">
            <h3 className="font-black text-rose-400/50 mb-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
              <Terminal size={12} className="text-rose-500/50" />
              Neural Updates
            </h3>
            <form className="relative group max-w-xs" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="IDENTITY@CORE.SYS_" 
                className="w-full bg-[#0a0105] border border-rose-900/50 text-rose-100 text-[10px] font-bold rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all uppercase tracking-widest placeholder:text-rose-500/30 shadow-inner"
              />
              <button 
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-linear-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:from-rose-500 hover:to-pink-500 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center justify-center active:scale-95"
                aria-label="Subscribe"
              >
                <ArrowRight size={14} />
              </button>
            </form>
            
            <div className="mt-6 flex items-center gap-3 bg-[#2a081a]/50 w-fit px-3 py-1.5 rounded-full border border-rose-900/40">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-[#14030b]"></span>
              </div>
              <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-[0.2em]">All systems operational</span>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="pt-8 border-t border-rose-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-rose-300/40 text-[10px] font-black uppercase tracking-[0.2em] flex flex-wrap justify-center md:justify-start gap-6">
            <span>© {currentYear} Do Grit Or Quit Inc.</span>
            <Link href="/privacy" className="hover:text-rose-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-rose-400 transition-colors">Terms</Link>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-black text-rose-200/50 uppercase tracking-widest bg-[#2a081a] px-4 py-2.5 rounded-full border border-rose-500/20 shadow-sm">
             <span>Made with</span>
             <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]" />
             <span>by Dhruv Krishna</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Subcomponents ---

function SocialIcon({ icon, href, label }: { icon: React.ReactNode, href: string, label: string }) {
  return (
    <a 
      href={href} 
      aria-label={label}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2a081a] text-rose-300/50 border border-rose-900/50 hover:border-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all duration-300 active:scale-95"
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, label, badge, badgeColor = "pink" }: { href: string, label: string, badge?: string, badgeColor?: "pink" | "blue" }) {
  
  const badgeStyles = badgeColor === "blue" 
    ? "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
    : "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]";

  return (
    <li>
      <Link 
        href={href} 
        className="group flex items-center gap-3 text-rose-200/60 hover:text-rose-100 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 w-fit"
      >
        <span className="group-hover:translate-x-1 transition-transform duration-300">{label}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}