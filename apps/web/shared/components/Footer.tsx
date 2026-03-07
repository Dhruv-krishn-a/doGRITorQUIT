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
    <footer className="relative bg-[#fdfbfb] pt-20 pb-8 border-t border-rose-100 overflow-hidden font-sans text-slate-600 transform-gpu antialiased">
      
      {/* Light Background Pattern (Dot Grid) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Decorative Ethereal Blur Orbs */}
      <div className="absolute top-0 right-1/4 w-125 h-125 bg-rose-200/40 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-fuchsia-100/50 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* --- Brand Column (Span 4) --- */}
          <div className="lg:col-span-4 space-y-6">
             <Link href="/" className="flex items-center gap-3 select-none group w-fit">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-rose-500 to-fuchsia-500 text-white shadow-[0_8px_25px_rgba(244,63,94,0.3)] group-hover:shadow-[0_12px_30px_rgba(244,63,94,0.5)] group-hover:scale-105 transition-all duration-500">
                  <Sparkles size={20} className="group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-2xl tracking-tighter text-slate-900 group-hover:text-rose-600 transition-colors uppercase">DO GRIT</span>
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase mt-0.5 group-hover:text-rose-500 transition-colors">OK QUIT</span>
                </div>
             </Link>
             
             <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium tracking-wide">
               The operating system for developers who ship. Turn chaotic ideas into executed plans with AI-driven roadmaps.
             </p>

             <div className="flex items-center gap-3 pt-2">
                <SocialIcon icon={<Twitter size={18} />} href="#" label="Twitter" />
                <SocialIcon icon={<Github size={18} />} href="#" label="GitHub" />
                <SocialIcon icon={<Linkedin size={18} />} href="#" label="LinkedIn" />
             </div>
          </div>

          {/* --- Product Links (Span 2) --- */}
          <div className="lg:col-span-2 lg:col-start-7">
            <h3 className="font-black text-slate-900 mb-6 text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
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
            <h3 className="font-black text-slate-900 mb-6 text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
              Company
            </h3>
            <ul className="space-y-4">
              <FooterLink href="/about" label="About" />
              {/* Added Indigo badge instead of blue to match the rest of the light theme palette */}
              <FooterLink href="/careers" label="Careers" badge="Hiring" badgeColor="indigo" />
              <FooterLink href="/contact" label="Contact" />
            </ul>
          </div>

          {/* --- Newsletter (Span 3) --- */}
          <div className="lg:col-span-3">
            <h3 className="font-black text-slate-900 mb-6 text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
              <Terminal size={14} className="text-rose-500" />
              Neural Updates
            </h3>
            <form className="relative group max-w-xs" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="IDENTITY@CORE.SYS" 
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-[1.25rem] py-4 pl-5 pr-14 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 transition-all uppercase tracking-widest placeholder:text-slate-300 shadow-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-3.5 bg-slate-900 text-white rounded-xl hover:bg-rose-500 hover:shadow-[0_4px_15px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center active:scale-95"
                aria-label="Subscribe"
              >
                <ArrowRight size={16} />
              </button>
            </form>
            
            <div className="mt-6 flex items-center gap-3 bg-white w-fit px-4 py-2 rounded-full border border-slate-100 shadow-sm">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">All systems operational</span>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex flex-wrap justify-center md:justify-start gap-8">
            <span>© {currentYear} Do Grit Or Quit Inc.</span>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-800 transition-colors">Terms</Link>
          </div>
          
          <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-5 py-3 rounded-full border border-slate-100 shadow-sm">
             <span>Crafted with</span>
             <Heart size={14} className="text-rose-500 fill-rose-500 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-sm" />
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
      className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white text-slate-400 border border-slate-200 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 hover:shadow-md transition-all duration-300 active:scale-95"
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, label, badge, badgeColor = "pink" }: { href: string, label: string, badge?: string, badgeColor?: "pink" | "indigo" }) {
  
  const badgeStyles = badgeColor === "indigo" 
    ? "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm"
    : "bg-rose-50 text-rose-600 border-rose-100 shadow-sm";

  return (
    <li>
      <Link 
        href={href} 
        className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-widest transition-all duration-300 w-fit"
      >
        <span className="group-hover:translate-x-1 transition-transform duration-300">{label}</span>
        {badge && (
          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.2em] border ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}