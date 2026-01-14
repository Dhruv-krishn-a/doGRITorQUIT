// apps/web/app/components/Footer.tsx
"use client";

import React from "next/link";
import Link from "next/link";
import { NavItem } from "../../../../packages/config/siteNav";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Heart,
  Sparkles
} from "lucide-react";

export default function Footer({ nav }: { nav: NavItem[] }) {
  const footerNav = nav
    .filter((n) => n.group === "footer" && n.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white pt-16 pb-8 border-t border-slate-100 overflow-hidden">
      {/* Decorative Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

      {/* Background decoration (optional subtle blur) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-indigo-50/50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
             <div className="flex items-center gap-2 select-none">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200">
                  <Sparkles size={16} />
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-800">
                  DO GRIT <span className="text-slate-400 font-normal">OR QUIT</span>
                </span>
             </div>
             <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
               The ultimate productivity platform for developers who want to turn chaos into clarity. Plan, track, and ship faster than ever before.
             </p>
             
             {/* Social Links (Placeholders) */}
             <div className="flex items-center gap-4 pt-2">
                <SocialIcon icon={<Twitter size={18} />} href="#" label="Twitter" />
                <SocialIcon icon={<Github size={18} />} href="#" label="GitHub" />
                <SocialIcon icon={<Linkedin size={18} />} href="#" label="LinkedIn" />
             </div>
          </div>

          {/* Column 2: Product Links (Dynamic from Props) */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              {footerNav.map((item) => (
                <li key={item.id}>
                  <Link 
                    href={item.path} 
                    className="text-slate-500 hover:text-indigo-600 text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-indigo-600 transition-all duration-300 rounded-full" />
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* Fallback/Hardcoded links if nav is empty for visuals */}
              {footerNav.length === 0 && (
                <>
                  <li><Link href="/features" className="text-slate-500 hover:text-indigo-600 text-sm">Features</Link></li>
                  <li><Link href="/pricing" className="text-slate-500 hover:text-indigo-600 text-sm">Pricing</Link></li>
                  <li><Link href="/changelog" className="text-slate-500 hover:text-indigo-600 text-sm">Changelog</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Legal / Info */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs">
            © {currentYear} Do Grit Or Quit Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
             <span>Made with</span>
             <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
             <span>by Dhruv Krishna</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper for Social Icons
function SocialIcon({ icon, href, label }: { icon: React.ReactNode, href: string, label: string }) {
  return (
    <a 
      href={href} 
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 hover:scale-110"
    >
      {icon}
    </a>
  );
}