// apps/web/app/dashboard/subscriptions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Check, 
  CreditCard, 
  Zap, 
  Calendar, 
  History, 
  LayoutGrid, 
  Download,
  AlertCircle,
  LucideIcon,
  TrendingUp
} from "lucide-react";

// --- Types ---
interface Product {
  id: string;
  name: string;
  key: string;
  price: number;
  description: string;
  features?: string[];
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "failed" | "pending";
  invoiceUrl?: string;
}

interface ActiveSubscription {
  product?: {
    id: string;
    name: string;
    key: string;
  };
  currentPeriodEnd?: string;
  status?: string;
}

interface SubscriptionData {
  activeSubscription?: ActiveSubscription;
  // Usage is now nullable to represent "loading" vs "no data" vs "real data"
  usage?: {
    aiGenerated: number;
    // aiLimit can be null if the backend sends Infinity (JSON serializes Infinity as null)
    aiLimit: number | null; 
    remaining: number | null;
  };
  history?: PaymentRecord[];
}

// --- Razorpay Types ---
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    description: string;
    code: string;
    reason: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill?: Record<string, string>;
  theme?: { color: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
}

interface LocalWindow {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
}

// --- Components ---

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  colorClass: string;
}

const StatCard = ({ icon: Icon, label, value, subtext, colorClass }: StatCardProps) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 shadow-sm h-full transition-all hover:shadow-md">
    <div className={`p-3 rounded-lg ${colorClass} shrink-0`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-xl font-bold text-slate-900">{value}</h3>
      {subtext && <p className="text-slate-400 text-sm mt-1">{subtext}</p>}
    </div>
  </div>
);

const UsageBar = ({ used, limit }: { used: number; limit: number | null }) => {
  // Interpret null as Infinity (Unlimited)
  const effectiveLimit = limit === null ? Infinity : limit;
  const isUnlimited = effectiveLimit === Infinity;

  // Calculate percentage (capped at 100%)
  const percentage = isUnlimited ? 0 : Math.min((used / effectiveLimit) * 100, 100);
  
  // UX: Show red if > 90% used
  const isCritical = !isUnlimited && percentage > 90;
  
  // Calculate remaining
  const remaining = isUnlimited ? "Unlimited" : Math.max(0, effectiveLimit - used);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp size={12} /> AI Usage
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900">{used}</span>
            <span className="text-slate-400 text-sm">/ {isUnlimited ? "∞" : effectiveLimit}</span>
          </div>
        </div>
        <div className="text-right">
           <span className={`text-xs font-bold px-2 py-1 rounded ${isCritical ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
             {isUnlimited ? "Unlimited" : `${remaining} left`}
           </span>
        </div>
      </div>
      
      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
        {isUnlimited ? (
           // Animated gradient for unlimited
           <div className="h-full bg-linear-to-r from-blue-400/20 via-blue-500/20 to-blue-400/20 w-full animate-pulse" /> 
        ) : (
          <div 
            className={`h-full transition-all duration-500 ease-out rounded-full ${isCritical ? 'bg-red-500' : 'bg-blue-600'}`} 
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};

export default function SubscriptionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");
  
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch("/api/billing/products"),
          fetch("/api/billing/subscription"),
        ]);
        
        if(!pRes.ok || !sRes.ok) throw new Error("Failed to fetch data");

        const [pJson, sJson] = await Promise.all([pRes.json(), sRes.json()]);
        
        if (!mounted) return;
        setProducts(pJson || []);
        setData(sJson || {});
      } catch (err) {
        console.error("Failed to load billing data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function buy(productKey: string) {
    setBuying(productKey);
    try {
      const r = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });
      const json = await r.json();
      
      if (!r.ok) throw new Error(json.error || "Order creation failed");

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: json.amount,
        currency: json.currency,
        order_id: json.orderId,
        name: "Planner App",
        description: `Upgrade to ${productKey}`,
        theme: { color: "#0f172a" },
        handler: async function (response: RazorpayResponse) {
          try {
            const verifyRes = await fetch("/api/billing/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              router.refresh();
              window.location.reload(); 
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (e) {
            console.error(e);
            alert("Error verifying payment.");
          }
        },
      };

      const win = window as unknown as LocalWindow;

      if (!win.Razorpay) {
          alert("Payment gateway failed to load. Please check your connection.");
          return;
      }

      const rzp = new win.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayErrorResponse){
        alert("Payment Failed: " + response.error.description);
      });
      
      rzp.open();

    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setBuying(null);
    }
  }

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center flex-col gap-4 text-slate-400 font-medium animate-pulse">
      <Loader2 className="animate-spin text-blue-600" size={32} /> 
      <p>Syncing subscription details...</p>
    </div>
  );

  const activeSub = data?.activeSubscription;
  // ✅ FIX: No magic number "5". If API returns usage, use it. Otherwise 0.
  const usage = data?.usage || { aiGenerated: 0, aiLimit: 0, remaining: 0 };
  const history = data?.history || [];

  const getBadgeColor = (key: string) => {
    if (key.includes("PRO")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (key.includes("TEAM")) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Subscription & Usage</h1>
          <p className="text-slate-500 mt-1">Manage your plan limits, upgrades, and billing history.</p>
        </div>
        {activeSub && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <Check size={16} strokeWidth={3} />
            {activeSub.product?.name} Active
          </div>
        )}
      </div>

      {/* --- Stats Overview --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Plan Info */}
        <StatCard 
          icon={CreditCard}
          label="Current Plan"
          value={activeSub?.product?.name || "Free Tier"}
          subtext={activeSub?.currentPeriodEnd ? `Renews: ${new Date(activeSub.currentPeriodEnd).toLocaleDateString()}` : "Lifetime Access"}
          colorClass="bg-blue-100 text-blue-600"
        />

        {/* 2. AI Usage (Dynamic) */}
        <UsageBar used={usage.aiGenerated} limit={usage.aiLimit} />

        {/* 3. Billing Status */}
        <StatCard 
          icon={Calendar}
          label="Billing Status"
          value={activeSub?.status === 'active' ? "Good Standing" : "No Payment Method"}
          subtext={activeSub?.status === 'active' ? "Next invoice incoming" : "Upgrade to unlock features"}
          colorClass="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* --- Tabs Navigation --- */}
      <div className="border-b border-slate-200 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 pt-4">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("plans")}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === "plans" 
                ? "text-blue-600" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-2"><LayoutGrid size={16}/> Available Plans</span>
            {activeTab === "plans" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full layoutId='tab'" />}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === "history" 
                ? "text-blue-600" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-2"><History size={16}/> Payment History</span>
            {activeTab === "history" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full layoutId='tab'" />}
          </button>
        </div>
      </div>

      {/* --- Tab Content: Plans --- */}
      {activeTab === "plans" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((p) => {
              const isCurrent = activeSub?.product?.id === p.id;
              
              return (
                <div 
                  key={p.id} 
                  className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-white ring-2 ring-blue-600 shadow-xl shadow-blue-900/5 scale-[1.02]' 
                      : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                     <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getBadgeColor(p.key)}`}>
                        {p.key}
                     </span>
                     {isCurrent && <span className="text-blue-600 bg-blue-50 rounded-full p-1"><Check size={16} /></span>}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                  <div className="mt-2 mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">₹{p.price / 100}</span>
                    <span className="text-slate-500 font-medium">/mo</span>
                  </div>

                  <div className="w-full h-px bg-slate-100 mb-6" />

                  <div className="grow space-y-3 mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Includes</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <Zap size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <span>{p.description || "Full access to AI features"}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                        <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span>Higher Usage Limits</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      isCurrent 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                        : "bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] shadow-lg shadow-slate-900/10 active:scale-95"
                    }`}
                    onClick={() => !isCurrent && buy(p.key)}
                    disabled={!!buying || isCurrent}
                  >
                    {isCurrent ? (
                      "Current Plan" 
                    ) : (buying === p.key ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    ) : (
                      "Upgrade Now"
                    ))}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Tab Content: History --- */}
      {activeTab === "history" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 py-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {history.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono">
                        ₹{record.amount / 100}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          record.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 
                          record.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors">
                           <Download size={14} /> Download
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History size={20} className="text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-bold">No payment history</h3>
                <p className="text-sm mt-1">You have not made any purchases yet.</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
            <AlertCircle size={18} />
            <span>Need help with a payment? <a href="#" className="underline font-bold hover:text-blue-800">Contact Support</a></span>
          </div>
        </div>
      )}
    </div>
  );
}