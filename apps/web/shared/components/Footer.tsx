// apps/web/shared/components/Footer.tsx
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
  ArrowRight
} from "lucide-react";

export default function Footer({ nav }: { nav: NavItem[] }) {
  // Defensive coding: Ensure nav is always an array
  const safeNav = Array.isArray(nav) ? nav : [];
  
  const footerNav = safeNav
    .filter((n) => n.group === "footer" && n.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-50 pt-12 pb-6 border-t border-slate-200 overflow-hidden font-sans text-slate-900">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-8">
          
          {/* --- Brand Column (Span 4) --- */}
          <div className="lg:col-span-4 space-y-4">
             <Link href="/" className="flex items-center gap-2 select-none group w-fit">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
                  <Sparkles size={16} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-lg tracking-tight text-slate-900 group-hover:text-indigo-700 transition-colors">DO GRIT</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">OR QUIT</span>
                </div>
             </Link>
             
             <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
               The operating system for developers who ship. Turn chaotic ideas into executed plans with AI-driven roadmaps.
             </p>

             <div className="flex items-center gap-2">
                <SocialIcon icon={<Twitter size={16} />} href="#" label="Twitter" />
                <SocialIcon icon={<Github size={16} />} href="#" label="GitHub" />
                <SocialIcon icon={<Linkedin size={16} />} href="#" label="LinkedIn" />
             </div>
          </div>

          {/* --- Links Column (Span 2) --- */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Product</h3>
            <ul className="space-y-2">
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

          {/* --- Company Column (Span 2) --- */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              <FooterLink href="/about" label="About" />
              <FooterLink href="/careers" label="Careers" badge="Hiring" />
              <FooterLink href="/contact" label="Contact" />
            </ul>
          </div>

          {/* --- Newsletter Column (Span 4) --- */}
          <div className="lg:col-span-4">
            <h3 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Stay Updated</h3>
            <form className="relative group max-w-xs" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg py-2.5 pl-3 pr-10 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
              />
              <button 
                type="submit"
                className="absolute right-1 top-1 p-1.5 bg-slate-900 text-white rounded-md hover:bg-indigo-600 transition-colors shadow-sm"
                aria-label="Subscribe"
              >
                <ArrowRight size={14} />
              </button>
            </form>
            
            <div className="mt-4 flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-medium text-slate-500">All systems normal</span>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-[10px] flex flex-wrap justify-center md:justify-start gap-4">
            <span>© {currentYear} Do Grit Or Quit Inc.</span>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium bg-white px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
             <span>Made with</span>
             <Heart size={10} className="text-rose-500 fill-rose-500 animate-pulse" />
             <span>by Dhruv Krishna</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Helper Components ---

function SocialIcon({ icon, href, label }: { icon: React.ReactNode, href: string, label: string }) {
  return (
    <a 
      href={href} 
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-500 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, label, badge }: { href: string, label: string, badge?: string }) {
  return (
    <li>
      <Link 
        href={href} 
        className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-xs transition-colors duration-200 w-fit"
      >
        <span>{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-600 uppercase tracking-wide">
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}