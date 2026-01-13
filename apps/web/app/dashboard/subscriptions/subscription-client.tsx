"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, Check, CreditCard, Zap, Calendar, History, 
  LayoutGrid, Download, AlertCircle, LucideIcon, 
  ShieldCheck, X
} from "lucide-react";

// --- Types ---
export interface Product {
  id: string;
  name: string;
  key: string;
  price: number;
  description: string;
  currency: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "failed" | "pending";
  invoiceUrl?: string;
}

export interface ActiveSubscription {
  product?: {
    id: string;
    name: string;
    key: string;
  };
  currentPeriodEnd?: string;
  status?: string;
}

export interface UsageStats {
  aiGenerated: number;
  aiLimit: number | null; // Null implies infinity
  remaining: number | null;
}

export interface SubscriptionData {
  activeSubscription?: ActiveSubscription;
  usage?: UsageStats;
  history?: PaymentRecord[];
}

interface SubscriptionClientProps {
  products: Product[];
  data: SubscriptionData;
}

// --- Razorpay SDK Types (Strictly Typed) ---

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    reason: string;
    source: string;
    step: string;
    metadata: object;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  // ✅ FIX: Replace 'any' with specific success type
  handler: (response: RazorpaySuccessResponse) => void;
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  // ✅ FIX: Replace 'any' with specific error type
  on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

// --- Helper Components ---
const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
    type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'
  }`}>
    {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
    <p className="font-medium text-sm">{message}</p>
    <button onClick={onClose} className="ml-2 hover:opacity-75"><X size={16} /></button>
  </div>
);

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

const UsageCard = ({ usage }: { usage: UsageStats }) => {
  const limit = usage.aiLimit === null ? Infinity : usage.aiLimit;
  const isUnlimited = limit === Infinity;
  const percent = isUnlimited ? 0 : Math.min((usage.aiGenerated / limit) * 100, 100);
  const isCritical = !isUnlimited && percent > 90;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" /> AI Credits
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{usage.aiGenerated}</span>
            <span className="text-slate-400 font-medium">/ {isUnlimited ? "∞" : limit}</span>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          isUnlimited ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
          isCritical ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
          {isUnlimited ? "Unlimited Plan" : `${usage.remaining} Left`}
        </span>
      </div>
      
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
        {isUnlimited ? (
           // ✅ FIX: Use bg-linear-to-r for newer Tailwind versions
           <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 via-indigo-500/40 to-indigo-500/20 w-full animate-pulse" />
        ) : (
          <div 
            className={`h-full transition-all duration-700 ease-out rounded-full ${isCritical ? 'bg-red-500' : 'bg-indigo-600'}`} 
            style={{ width: `${percent}%` }}
          />
        )}
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
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
          <ShieldCheck size={12} /> Active Plan
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
        <p className={`text-sm mt-1 ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
          {product.description || "Unlock powerful features"}
        </p>
      </div>

      <div className="mb-8 flex items-baseline gap-1">
        <span className={`text-4xl font-extrabold ${isActive ? 'text-white' : 'text-slate-900'}`}>
          ₹{(product.price / 100).toLocaleString()}
        </span>
        <span className={`text-sm font-medium ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>/mo</span>
      </div>

      <div className={`w-full h-px mb-8 ${isActive ? 'bg-slate-800' : 'bg-slate-100'}`} />

      <ul className="space-y-4 mb-8 flex-1">
        {["Full AI Access", "Unlimited History", "Priority Support"].map((feat, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
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
        {isActive ? "Current Plan" : isBuying ? <Loader2 className="animate-spin" /> : "Upgrade Now"}
      </button>
    </div>
  );
};

// --- Main Client Component ---
export default function SubscriptionClientPage({ products, data }: SubscriptionClientProps) {
  const router = useRouter();
  
  const [buyingKey, setBuyingKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const activeSub = data?.activeSubscription;
  const usage = data?.usage || { aiGenerated: 0, aiLimit: 5, remaining: 5 };
  const history = data?.history || [];
  const currentPlanId = activeSub?.product?.id;

  // Razorpay Handler
  const handleBuy = async (productKey: string) => {
    setBuyingKey(productKey);
    try {
      // 1. Create Order
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });
      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.error || "Failed to create order");

      // 2. Open Razorpay
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Planner AI",
        description: `Upgrade to ${productKey}`,
        order_id: orderData.orderId,
        theme: { color: "#0f172a" },
        handler: async (response) => {
          try {
            // 3. Verify Payment
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
              setToast({ msg: "Upgrade successful! Unlocking features...", type: "success" });
              router.refresh();
              // Force reload to ensure new permissions take effect
              setTimeout(() => window.location.reload(), 2000);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch {
            setToast({ msg: "Payment verification failed", type: "error" });
          }
        },
        modal: {
            ondismiss: () => setBuyingKey(null)
        }
      };

      const win = window as unknown as { Razorpay?: RazorpayConstructor };

      if (!win.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const rzp = new win.Razorpay(options);
      
      // ✅ FIX: Typed response properly
      rzp.on("payment.failed", (response: RazorpayErrorResponse) => {
        setToast({ msg: response.error.description, type: "error" });
        setBuyingKey(null);
      });
      rzp.open();

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Something went wrong";
        setToast({ msg: errorMessage, type: "error" });
        setBuyingKey(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-12 pb-24">
      
      {/* --- 1. Header & Stats --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Subscription & Limits</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage your plan, track usage, and view billing history.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={CreditCard}
            label="Current Plan"
            value={activeSub?.product?.name || "Free Tier"}
            subtext={activeSub?.currentPeriodEnd ? `Renews: ${new Date(activeSub.currentPeriodEnd).toLocaleDateString()}` : "Standard Access"}
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

      {/* --- 2. Tabs Navigation --- */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
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
                {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full layoutId='tab'" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* --- 3. Content Area --- */}
      <div className="min-h-96">
        {activeTab === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {history.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono">
                        ₹{(record.amount / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                          record.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          record.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-slate-400 hover:text-blue-600 transition-colors">
                           <Download size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <History size={48} strokeWidth={1} className="mb-4 opacity-50" />
                <p>No payment history found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <Notification 
          message={toast.msg} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}