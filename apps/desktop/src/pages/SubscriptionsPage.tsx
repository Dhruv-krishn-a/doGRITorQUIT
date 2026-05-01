import React, { useState, useEffect } from 'react';
import { 
  Loader2, Check, CreditCard, Zap, Calendar, History, 
  LayoutGrid, Download, LucideIcon, 
  ShieldCheck, X, Sparkles, Youtube, BookOpen, Hammer,
  ChevronRight, BadgeCheck, Activity, BarChart3, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { openUrl } from '@tauri-apps/plugin-opener';
import { useAuth } from '../features/auth/hooks/useAuth';
import { api } from '../services/api';
import { buildWebUrl } from '../config/env';
import { cn } from '../lib/utils';

type TabID = "plans" | "usage" | "history";

export default function SubscriptionsPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<TabID>("plans");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [plans, subData] = await Promise.all([
            api.get("/api/billing/products"),
            api.get("/api/billing/subscription")
        ]);
        
        setProducts(plans || []);
        
        // Transform the subscription data for usage mapping
        const transformedData = {
            activeSubscription: subData?.activeSubscription ? {
                product: subData.activeSubscription.product,
                formattedRenewsAt: subData.activeSubscription.currentPeriodEnd ? 
                    new Date(subData.activeSubscription.currentPeriodEnd).toLocaleDateString("en-GB", { 
                        day: "numeric", month: "short", year: "numeric" 
                    }) : "Active"
            } : null,
            usage: {
                ai: { 
                    used: subData?.usage?.aiGenerated ?? 0, 
                    limit: subData?.usage?.aiLimit ?? 5 
                },
                plans: subData?.usage?.plans ?? { used: 0, limit: 1 },
                habits: subData?.usage?.habits ?? { used: 0, limit: 3 },
                study: {
                    youtube: subData?.usage?.study?.youtube ?? { used: 0, limit: 1 },
                    courses: subData?.usage?.study?.courses ?? { used: 0, limit: 1 },
                    projects: subData?.usage?.study?.projects ?? { used: 0, limit: 1 },
                    videosPerPlaylist: subData?.usage?.study?.videosPerPlaylist ?? { used: 0, limit: 10 }
                }
            },
            history: (subData?.history || []).map((order: any) => {
                let status: "paid" | "failed" | "pending" = "pending";
                if (order.status === "paid" || order.status === "captured") status = "paid";
                else if (order.status === "failed") status = "failed";

                return {
                    id: order.id,
                    formattedDate: new Date(order.date || order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
                    }),
                    amount: order.amount,
                    status
                };
            })
        };
        
        setSubscriptionData(transformedData);
      } catch (err) {
        console.error("Failed to load subscription data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpgrade = async (planKey: string) => {
    try {
      await openUrl(buildWebUrl(`/dashboard/checkout?plan=${planKey}`));
    } catch (err) {
      console.error("Failed to open checkout:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="animate-spin text-[var(--accent-color)]" size={32} />
      </div>
    );
  }

  const activeSub = subscriptionData?.activeSubscription;
  const usage = subscriptionData?.usage;
  const history = subscriptionData?.history || [];
  
  const paidActive = !!(activeSub && activeSub.product?.key !== "FREE");
  const currentPlan = products.find(p => p.key === activeSub?.product?.key);
  const currentPrice = currentPlan?.price || 0;

  const tabs: { id: TabID; label: string; icon: any }[] = [
    { id: "plans", label: "Plans", icon: LayoutGrid },
    { id: "usage", label: "Usage", icon: Activity },
    { id: "history", label: "Billing", icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row min-h-[calc(100vh-160px)] gap-6 lg:gap-12 p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 antialiased pb-20">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <div className="lg:mb-8 px-2 md:px-4">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Subscription</h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">Desktop Plan & Access</p>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar px-2">
            {tabs.map((t) => (
                <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                        "flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all group border whitespace-nowrap lg:w-full lg:justify-between",
                        tab === t.id
                        ? "bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/20 shadow-lg shadow-[var(--accent-color)]/5"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border-transparent"
                    )}
                >
                    <div className="flex items-center gap-3 md:gap-4">
                        <t.icon size={16} className={cn("shrink-0", tab === t.id ? "text-[var(--accent-color)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]")} />
                        {t.label}
                    </div>
                    {tab === t.id && <ChevronRight size={14} className="hidden lg:block" />}
                </button>
            ))}
        </nav>

        {activeSub && (
            <div className="hidden lg:block mt-10 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-emerald-500">
                    <BadgeCheck size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Plan</span>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight italic">{activeSub.product?.name}</p>
                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Renews: {activeSub.formattedRenewsAt}</p>
                </div>
            </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
            {tab === "plans" && (
                <motion.div
                    key="plans"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                >
                    <SectionHeader title="Available Plans" description="Redefine your desktop workflow capabilities." />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                        {products
                          .filter(p => !paidActive || p.key !== "FREE")
                          .map((p) => (
                            <PlanCard 
                                key={p.id} 
                                product={p} 
                                isActive={activeSub?.product?.key === p.key || (!paidActive && p.key === "FREE")} 
                                isDowngrade={paidActive && p.price < currentPrice}
                                onBuy={handleUpgrade} 
                            />
                        ))}
                    </div>

                    <div className="p-6 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-3xl flex items-start gap-4">
                        <ShieldCheck className="text-[var(--accent-color)] shrink-0 mt-1" size={20} />
                        <div>
                            <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">Secure Desktop Billing</p>
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1 leading-relaxed">
                                To ensure maximum security, all payment processing is handled through our encrypted web gateway. 
                                Clicking upgrade will safely launch your default browser.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {tab === "usage" && (
                <motion.div
                    key="usage"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                >
                    <SectionHeader title="Usage & Limits" description="Status of your resource synchronization." />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 md:p-10 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles size={18} className="text-[var(--accent-color)]" />
                                <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">Core Resources</h3>
                            </div>
                            <div className="space-y-8">
                                <LimitRow label="AI Credits" used={usage.ai.used} limit={usage.ai.limit} icon={Sparkles} active={tab === 'usage'} />
                                <LimitRow label="Active Plans" used={usage.plans.used} limit={usage.plans.limit} icon={LayoutGrid} active={tab === 'usage'} />
                                <LimitRow label="Habits" used={usage.habits.used} limit={usage.habits.limit} icon={Check} active={tab === 'usage'} />
                            </div>
                        </div>

                        <div className="space-y-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 md:p-10 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <BarChart3 size={18} className="text-[var(--accent-color)]" />
                                <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">Study Tracks</h3>
                            </div>
                            <div className="space-y-8">
                                <LimitRow label="YouTube" used={usage.study.youtube.used} limit={usage.study.youtube.limit} icon={Youtube} active={tab === 'usage'} />
                                <LimitRow label="Courses" used={usage.study.courses.used} limit={usage.study.courses.limit} icon={BookOpen} active={tab === 'usage'} />
                                <LimitRow label="Pathways" used={usage.study.projects.used} limit={usage.study.projects.limit} icon={Hammer} active={tab === 'usage'} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {tab === "history" && (
                <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                >
                    <SectionHeader title="Billing History" description="Manage your invoices and payment methods." />
                    
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] overflow-hidden shadow-xl">
                        {history.length > 0 ? (
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left text-[10px] font-bold uppercase tracking-widest">
                                    <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                                        <tr>
                                            <th className="px-8 py-5 text-[var(--text-secondary)]">Date</th>
                                            <th className="px-8 py-5 text-[var(--text-secondary)]">Amount</th>
                                            <th className="px-8 py-5 text-[var(--text-secondary)]">Status</th>
                                            <th className="px-8 py-5 text-[var(--text-secondary)] text-right">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]/30">
                                        {history.map((record: any) => (
                                            <tr key={record.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group">
                                                <td className="px-8 py-6 text-[var(--text-primary)]">{record.formattedDate}</td>
                                                <td className="px-8 py-6 text-[var(--text-primary)] italic">₹{(record.amount / 100).toLocaleString()}</td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-full border text-[8px]",
                                                        record.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                        record.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    )}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 transition-all">
                                                        <Download size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 md:py-32 text-[var(--text-secondary)] text-center px-6">
                                <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)] shadow-inner mb-6 opacity-50">
                                    <History size={32} strokeWidth={1} />
                                </div>
                                <p className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">No invoices yet</p>
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-2 max-w-xs">Detailed transaction history is also available on the web portal.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-8 px-1">
        <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic leading-tight">{title}</h2>
        <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] md:tracking-[0.4em] mt-2 ml-0.5 opacity-70">{description}</p>
    </div>
);

const LimitRow = ({ label, used, limit, icon: Icon, active }: { label: string; used: number; limit: number; icon: LucideIcon; active?: boolean }) => {
  const isUnlimited = limit >= 999999;
  const percent = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isCritical = !isUnlimited && percent > 90;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
          <div className="p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <Icon size={12} className={cn(active ? "text-[var(--accent-color)]" : "")} />
          </div>
          {label}
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)]/50 px-2.5 py-1 rounded-full border border-[var(--border-color)]">
          <span className="text-[var(--text-primary)]">{used}</span>
          <span className="text-[var(--text-secondary)]/30">/</span>
          <span className="text-[var(--text-secondary)] opacity-60">{isUnlimited ? "∞" : limit}</span>
        </div>
      </div>
      <div className="w-full bg-[var(--bg-secondary)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]/30">
        {isUnlimited ? (
          <div className="h-full w-full bg-linear-to-r from-[var(--accent-color)]/5 via-[var(--accent-color)]/20 to-[var(--accent-color)]/5 animate-pulse" />
        ) : (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
                "h-full rounded-full transition-colors duration-500",
                isCritical ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]/30'
            )} 
          />
        )}
      </div>
    </div>
  );
};

const PlanCard = ({ 
  product, isActive, isDowngrade, onBuy 
}: { 
  product: any; isActive: boolean; isDowngrade: boolean; onBuy: (key: string) => void;
}) => {
  const price = (product.price / 100).toLocaleString();
  const isFree = product.key === "FREE";

  const features = product.featuresList || ["Standard features included"];

  return (
    <div className={cn(
        "relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-500 border group overflow-hidden h-full",
        isActive 
            ? "bg-[var(--bg-card)] border-[var(--accent-color)] shadow-2xl scale-[1.02] z-10" 
            : isDowngrade 
                ? "bg-[var(--bg-secondary)]/30 border-[var(--border-color)] opacity-60" 
                : "bg-[var(--bg-card)]/50 border-[var(--border-color)] hover:border-[var(--text-secondary)]/30 hover:bg-[var(--bg-card)]"
    )}>
      {isActive && (
        <div className="absolute top-0 right-0 px-6 py-2 bg-[var(--accent-color)] text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl shadow-lg flex items-center gap-2">
          <BadgeCheck size={14} /> Current Access
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-black text-[var(--text-primary)] uppercase italic tracking-tight">{product.name}</h3>
        <p className="text-[10px] mt-2 font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed opacity-60 line-clamp-2 min-h-[30px]">
          {product.description || "Unlock full access to the grid."}
        </p>
      </div>

      <div className="mb-10 flex items-baseline gap-1">
        <span className="text-5xl font-black italic tracking-tighter text-[var(--text-primary)]">₹{price}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">/ mo</span>
      </div>

      <div className="w-full h-px bg-[var(--border-color)] mb-8 opacity-50" />

      <div className="flex-1 space-y-4 mb-10 overflow-y-auto max-h-72 pr-4 custom-scrollbar">
        {features.map((feat: string, i: number) => (
          <div key={i} className="flex items-start gap-4 group/item">
            <div className={cn(
                "p-1 rounded-lg border transition-all duration-300 mt-0.5",
                isActive ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20 text-[var(--accent-color)]" : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]"
            )}>
              <Check size={10} strokeWidth={4} />
            </div>
            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest group-hover/item:text-[var(--text-primary)] transition-colors leading-relaxed">{feat}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => !isActive && !isDowngrade && onBuy(product.key)}
        disabled={isActive || (isDowngrade && !isFree)}
        className={cn(
            "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 border",
            isActive 
                ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] cursor-default" 
                : isDowngrade
                    ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] opacity-50 cursor-not-allowed"
                    : "bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent hover:opacity-90"
        )}
      >
        {isActive ? "Currently Active" : isDowngrade ? "Locked" : "Upgrade Plan"}
      </button>
    </div>
  );
};
