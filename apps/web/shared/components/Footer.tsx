"use client";

import React from "react";
import Link from "next/link";
import { NavItem } from "../../config/site";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Heart,
  Sparkles
} from "lucide-react";

export default function Footer({ nav }: { nav: NavItem[] }) {
  // Defensive coding: Ensure nav is always an array
  const safeNav = Array.isArray(nav) ? nav : [];
  
  const footerNav = safeNav
    .filter((n) => n.group === "footer" && n.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--bg-primary)] pt-12 pb-6 border-t border-[var(--border-color)] overflow-hidden font-sans text-[var(--text-secondary)] antialiased">
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          
          {/* --- Brand --- */}
          <div className="flex flex-col space-y-4">
             <Link href="/" className="flex items-center gap-3 select-none group w-fit">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--bg-secondary)] text-[var(--accent-color)] border border-[var(--border-color)] shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-xl tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors uppercase">DO GRIT</span>
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] tracking-[0.2em] uppercase mt-0.5 group-hover:text-[var(--accent-color)] transition-colors">OK QUIT</span>
                </div>
             </Link>
             <p className="text-[var(--text-secondary)] text-xs font-medium max-w-xs">
               The operating system for developers who ship.
             </p>
          </div>

          {/* --- Navigation --- */}
          <div className="flex gap-12 lg:gap-16">
            <div>
              <h3 className="font-bold text-[var(--text-primary)] mb-4 text-[10px] uppercase tracking-widest">Product</h3>
              <ul className="space-y-3">
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

            <div>
              <h3 className="font-bold text-[var(--text-primary)] mb-4 text-[10px] uppercase tracking-widest">Company</h3>
              <ul className="space-y-3">
                <FooterLink href="/about" label="About" />
                <FooterLink href="/careers" label="Careers" badge="Hiring" />
                <FooterLink href="/contact" label="Contact" />
              </ul>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="pt-6 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">© {currentYear} Do Grit Or Quit</span>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
              <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Terms</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <SocialIcon icon={<Twitter size={14} />} href="#" label="Twitter" />
              <SocialIcon icon={<Github size={14} />} href="#" label="GitHub" />
              <SocialIcon icon={<Linkedin size={14} />} href="#" label="LinkedIn" />
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--bg-card)] px-3 py-2 rounded-lg border border-[var(--border-color)] shadow-sm">
               <span>Made with</span>
               <Heart size={12} className="text-[var(--accent-color)] fill-[var(--accent-color)]" />
               <span>by Dhruv Krishna</span>
            </div>
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
      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
        className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11px] font-bold uppercase tracking-wider transition-colors w-fit"
      >
        <span>{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/20">
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}