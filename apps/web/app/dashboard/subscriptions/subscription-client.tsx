// apps/web/app/dashboard/subscriptions/subscription-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, Check, CreditCard, Zap, Calendar, History, 
  LayoutGrid, Download, AlertCircle, LucideIcon, 
  ShieldCheck, X, Sparkles, Youtube, BookOpen, Hammer
} from "lucide-react";
import { motion } from "framer-motion";

/* =======================
   Type Definitions
======================= */

// --- Razorpay Types ---
interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: { order_id: string; payment_id: string };
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayError) => void) => void;
}

// ✅ FIXED: Standalone interface for window casting
interface RazorpayWindow {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}

// --- Data Types ---
export interface Product {
  id: string;
  name: string;
  key: string;
  price: number;
  description: string;
  currency: string;
  featuresList?: string[];
}

export interface ActiveSubscription {
  product?: { id: string; name: string; key: string };
  currentPeriodEnd?: string;
  formattedRenewsAt?: string;
  status?: string;
}

export interface UsageStats {
  ai: { used: number; limit: number; remaining: number };
  plans: { used: number; limit: number };
  habits: { used: number; limit: number };
  study: {
    youtube: { used: number; limit: number };
    courses: { used: number; limit: number };
    projects: { used: number; limit: number };
    videosPerPlaylist: { used: number; limit: number };
  };
}

export interface PaymentRecord {
  id: string;
  formattedDate: string;
  amount: number;
  status: "paid" | "failed" | "pending";
}

export interface SubscriptionData {
  activeSubscription?: ActiveSubscription;
  usage: UsageStats;
  history?: PaymentRecord[];
}

export interface SubscriptionClientProps {
  products: Product[];
  data: SubscriptionData;
}

/* =======================
   Sub-Components
======================= */

const StatCard = ({ icon: Icon, label, value, subtext, colorClass }: { 
  icon: LucideIcon; label: string; value: string | number; subtext?: string; colorClass: string 
}) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start gap-5 shadow-sm hover:shadow-md transition-all duration-300">
    <div className={`p-3.5 rounded-xl ${colorClass} shrink-0`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      {subtext && <p className="text-slate-400 text-sm mt-1 font-medium">{subtext}</p>}
    </div>
  </div>
);

const LimitRow = ({ label, used, limit, icon: Icon }: { label: string; used: number; limit: number; icon: any }) => {
  // Robustly handle NaN or missing limits
  const safeUsed = isNaN(used) ? 0 : used;
  const safeLimit = isNaN(limit) || limit === 0 ? 1 : limit;
  const isUnlimited = limit >= 999999;
  
  const percent = isUnlimited ? 0 : Math.min((safeUsed / safeLimit) * 100, 100);
  const isCritical = !isUnlimited && percent > 90;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2 text-slate-500">
          <Icon size={14} className="text-slate-400" />
          {label}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-900">{String(safeUsed)}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400">{isUnlimited ? "∞" : String(limit)}</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        {isUnlimited ? (
          <div className="h-full w-full bg-linear-to-r from-indigo-500/10 via-indigo-500/30 to-indigo-500/10 animate-pulse" />
        ) : (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : 'bg-indigo-600'}`} 
          />
        )}
      </div>
    </div>
  );
};

const UsageCard = ({ usage }: { usage: UsageStats }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
           <Zap size={18} className="text-amber-500 fill-amber-500" />
           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Active Limits</h3>
        </div>
        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           Live Usage
        </div>
      </div>
      
      <div className="space-y-7">
        <LimitRow label="AI Credits" used={usage.ai.used} limit={usage.ai.limit} icon={Sparkles} />
        <LimitRow label="Active Plans" used={usage.plans.used} limit={usage.plans.limit} icon={LayoutGrid} />
        <LimitRow label="Habits" used={usage.habits.used} limit={usage.habits.limit} icon={Check} />
        
        <div className="pt-6 border-t border-slate-100">
           <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Study Tracks</p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">
                 <Youtube size={10} />
                 <span className="text-[9px] font-bold uppercase tracking-widest">{usage.study.videosPerPlaylist.limit} Videos/Playlist</span>
              </div>
           </div>
           <div className="grid grid-cols-1 gap-5">
              <LimitRow label="YouTube" used={usage.study.youtube.used} limit={usage.study.youtube.limit} icon={Youtube} />
              <LimitRow label="Courses" used={usage.study.courses.used} limit={usage.study.courses.limit} icon={BookOpen} />
              <LimitRow label="Projects" used={usage.study.projects.used} limit={usage.study.projects.limit} icon={Hammer} />
           </div>
        </div>
      </div>
    </div>
  );
};

const PlanCard = ({ 
  product, isActive, onBuy, loadingKey 
}: { 
  product: Product; isActive: boolean; onBuy: (key: string) => void; loadingKey: string | null 
}) => {
  const isBuying = loadingKey === product.key;

  return (
    <div className={`relative flex flex-col p-6 rounded-3xl transition-all duration-300 ${
      isActive 
        ? 'bg-slate-900 text-white ring-4 ring-slate-200 shadow-2xl scale-[1.02]' 
        : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1'
    }`}>
      {isActive && (
        <div className="transform-gpu absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
          <ShieldCheck size={12} /> Active Plan
        </div>
      )}

      <div className="transform-gpu mb-6">
        <h3 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
        <p className={`text-sm mt-1 ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
          {product.description || "Unlock higher limits and premium features."}
        </p>
      </div>

      <div className="transform-gpu mb-8 flex items-baseline gap-1">
        <span className={`text-4xl font-extrabold ${isActive ? 'text-white' : 'text-slate-900'}`}>
          ₹{(product.price / 100).toLocaleString()}
        </span>
        <span className={`text-sm font-medium ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>/mo</span>
      </div>

      <div className={`w-full h-px mb-8 ${isActive ? 'bg-slate-800' : 'bg-slate-100'}`} />

      <ul className="transform-gpu space-y-4 mb-8 flex-1">
        {(product.featuresList && product.featuresList.length > 0 
          ? product.featuresList 
          : ["Standard Features", "Email Support"]
        ).map((feat, i) => (
          <li key={i} className="transform-gpu flex items-center gap-3 text-sm">
            <div className={`p-0.5 rounded-full ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Check size={14} strokeWidth={3} />
            </div>
            <span className={isActive ? 'text-slate-300' : 'text-slate-600'}>{feat}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isActive && onBuy(product.key)}
        disabled={isActive || !!loadingKey}
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
          isActive 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-95'
        }`}
      >
        {isActive ? "Current Plan" : isBuying ? <Loader2 className="transform-gpu animate-spin" /> : "Upgrade Now"}
      </button>
    </div>
  );
};

/* =======================
   Main Component
======================= */

export default function SubscriptionClientPage({ products, data }: SubscriptionClientProps) {
  const router = useRouter();
  
  const [buyingKey, setBuyingKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const activeSub = data?.activeSubscription;
  const usage = data?.usage || { 
    ai: { used: 0, limit: 5, remaining: 5 },
    plans: { used: 0, limit: 1 },
    habits: { used: 0, limit: 3 },
    study: {
      youtube: { used: 0, limit: 1 },
      courses: { used: 0, limit: 1 },
      projects: { used: 0, limit: 1 },
      videosPerPlaylist: { used: 0, limit: 10 }
    }
  };
  const history = data?.history || [];
  const currentPlanId = activeSub?.product?.id;

  async function handleBuy(productKey: string) {
    try {
      setBuyingKey(productKey);

      // 1. Create Order
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });
      const order = await res.json();

      if (!res.ok) throw new Error(order.error ?? "Order creation failed");

      // 2. Load Razorpay (Safe Cast)
      const rzWindow = window as unknown as RazorpayWindow;
      if (typeof rzWindow.Razorpay === "undefined") {
        throw new Error("Razorpay SDK not loaded. Please refresh.");
      }

      // 3. Open Payment Modal
      const rzp = new rzWindow.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "Planner AI",
        description: `Upgrade to ${productKey}`,
        order_id: order.orderId,
        theme: { color: "#0f172a" },
        handler: async (response) => {
          // 4. Verify Payment
          try {
            const verify = await fetch("/api/billing/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (!verify.ok) throw new Error("Verification failed");

            setToast({ msg: "Subscription activated! 🎉", type: "success" });
            router.refresh();
            setTimeout(() => window.location.reload(), 1500);
          } catch {
            setToast({ msg: "Payment verification failed", type: "error" });
          }
        },
        modal: {
          ondismiss: () => setBuyingKey(null),
        },
      });

      rzp.on("payment.failed", (err) => {
        setToast({ msg: err.error.description, type: "error" });
        setBuyingKey(null);
      });

      rzp.open();

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setToast({ msg, type: "error" });
      setBuyingKey(null);
    }
  }

  return (
    <div className="transform-gpu max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-12 pb-24">
      
      {/* --- Header & Stats Grid --- */}
      <div className="transform-gpu space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
            <h1 className="transform-gpu text-3xl font-bold text-slate-900 tracking-tight">Subscription & Limits</h1>
            <p className="transform-gpu text-slate-500 mt-2 text-lg">Manage your plan, track usage, and view billing history.</p>
        </div>

        <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={CreditCard}
            label="Current Plan"
            value={activeSub?.product?.name || "Free Tier"}
            subtext={activeSub?.formattedRenewsAt ? `Renews: ${activeSub.formattedRenewsAt}` : "Standard Access"}
            colorClass="bg-blue-100 text-blue-600"
          />
          <UsageCard usage={usage} />
          <StatCard 
            icon={Calendar}
            label="Billing Status"
            value={activeSub?.status === 'active' ? "Active" : "No Method"}
            subtext={activeSub?.status === 'active' ? "Auto-renewal enabled" : "Add payment method"}
            colorClass={activeSub?.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}
          />
        </div>
      </div>

      {/* --- Tabs Navigation --- */}
      <div className="transform-gpu border-b border-slate-200">
        <div className="transform-gpu flex gap-8">
          {[
            { id: "plans", label: "Available Plans", icon: LayoutGrid },
            { id: "history", label: "Payment History", icon: History }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "plans" | "history")}
                className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="transform-gpu absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" 
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="transform-gpu min-h-96">
        {activeTab === "plans" && (
          <div className="transform-gpu grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {products.map((p) => (
              <PlanCard 
                key={p.id} 
                product={p} 
                isActive={currentPlanId === p.id} 
                onBuy={handleBuy} 
                loadingKey={buyingKey}
              />
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="transform-gpu bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {history.length > 0 ? (
              <table className="transform-gpu w-full text-left text-sm">
                <thead className="transform-gpu bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="transform-gpu px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                    <th className="transform-gpu px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                    <th className="transform-gpu px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="transform-gpu px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="transform-gpu divide-y divide-slate-100">
                  {history.map((record) => (
                    <tr key={record.id} className="transform-gpu hover:bg-slate-50 transition-colors">
                      <td className="transform-gpu px-6 py-4 text-slate-900 font-medium">
                        {record.formattedDate}
                      </td>
                      <td className="transform-gpu px-6 py-4 text-slate-600 font-mono">
                        ₹{(record.amount / 100).toLocaleString()}
                      </td>
                      <td className="transform-gpu px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                          record.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          record.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="transform-gpu px-6 py-4 text-right">
                         <button className="transform-gpu text-slate-400 hover:text-blue-600 transition-colors">
                           <Download size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="transform-gpu flex flex-col items-center justify-center py-20 text-slate-400">
                <History size={48} strokeWidth={1} className="transform-gpu mb-4 opacity-50" />
                <p>No payment history found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Toast Notification --- */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
            toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'
        }`}>
            {toast.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            <p className="transform-gpu font-medium text-sm">{toast.msg}</p>
            <button onClick={() => setToast(null)} className="transform-gpu ml-2 hover:opacity-75"><X size={16} /></button>
        </div>
      )}
      
      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}