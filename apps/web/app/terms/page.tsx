import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Scale, Info, Mail, Cpu, Heart } from "lucide-react";

export default function PublicTermsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-color)]/30">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">grit.io</span>
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20 space-y-16">
        
        {/* Header */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Terms of <br/>Service</h1>
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.5em] ml-1">Last Updated: April 2026</p>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-10 space-y-6">
           <div className="flex items-center gap-3">
              <Info className="text-rose-500" size={24} />
              <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest italic">Independent Developer Notice</h3>
           </div>
           <p className="text-sm font-bold text-[var(--text-secondary)] leading-relaxed italic uppercase opacity-80">
             grit.io is built and maintained by a solo developer. By using this service, you acknowledge that support and updates are provided on a best-effort basis. This is a mission-driven ecosystem built with personal passion.
           </p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3">
               <Shield size={20} className="text-[var(--accent-color)]" />
               <h2 className="text-xl font-black uppercase italic tracking-tight">1. Account Responsibility</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Users are responsible for maintaining the confidentiality of their login credentials. All activity occurring under your account is your sole responsibility. We recommend using a strong password and enabling two-factor authentication where available.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
               <Scale size={20} className="text-[var(--accent-color)]" />
               <h2 className="text-xl font-black uppercase italic tracking-tight">2. Acceptable Use</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              You agree not to:
            </p>
            <ul className="space-y-3 ml-4">
               {["Reverse engineer or attempt to extract source code.", "Abuse API endpoints or infrastructure.", "Use the service for illegal or unauthorized purposes.", "Automate data collection without explicit written consent."].map((rule, i) => (
                 <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)] italic uppercase font-bold">
                    <span className="text-[var(--accent-color)] opacity-40">•</span>
                    {rule}
                 </li>
               ))}
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
               <Cpu size={20} className="text-[var(--accent-color)]" />
               <h2 className="text-xl font-black uppercase italic tracking-tight">3. Subscriptions & Billing</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Paid features (Pro Tier) are governed by active subscription plans. Billing is handled through third-party processors (Razorpay/Stripe). Subscriptions auto-renew until cancelled. Partial month refunds are not provided unless required by law.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
               <Heart size={20} className="text-rose-500" />
               <h2 className="text-xl font-black uppercase italic tracking-tight">4. Liability & Disclaimers</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, DHRUV KRISHNA (DEVELOPER) DISCLAIMS ALL LIABILITY FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="pt-20 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-between gap-8">
           <div className="space-y-4">
              <Text className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Questions regarding terms?</Text>
              <a href="mailto:dogritorquit@gmail.com" className="flex items-center gap-3 group">
                 <div className="w-10 h-10 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex items-center justify-center group-hover:border-rose-500 transition-colors">
                    <Mail size={18} className="text-rose-500" />
                 </div>
                 <span className="text-xs font-black uppercase text-[var(--text-primary)]">dogritorquit@gmail.com</span>
              </a>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-40 italic">© {currentYear} grit.io // CREATED BY DHRUV KRISHNA</p>
           </div>
        </div>

      </main>
    </div>
  );
}

function Text({ children, className }: { children: React.ReactNode, className?: string }) {
    return <p className={className}>{children}</p>;
}
