"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

// --- Types ---
interface Product {
  id: string;
  name: string;
  key: string;
  price: number; 
  description: string;
}

interface ActiveSubscription {
  product?: {
    id: string;
    name: string;
  };
  currentPeriodEnd?: string;
}

interface SubscriptionData {
  activeSubscription?: ActiveSubscription;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    description: string;
    code: string;
    source: string;
    step: string;
    reason: string;
    metadata: object;
  };
}

// Local definition of options
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill?: Record<string, string>;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
}

// ✅ FIX: Standalone interface that DOES NOT extend global Window.
// This avoids conflicts with other files that may have modified Window globally.
interface LocalWindow {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
}

export default function SubscriptionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [subs, setSubs] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  
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
        setSubs(sJson || {});
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
    setBuying(true);
    try {
      // 1. Create Order
      const r = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });
      const json = await r.json();
      
      if (!r.ok) throw new Error(json.error || "Order creation failed");

      // 2. Razorpay Options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: json.amount,
        currency: json.currency,
        order_id: json.orderId,
        name: "Planner App",
        description: `Upgrade to ${productKey}`,
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
              alert("Payment successful but verification failed. Please contact support.");
            }
          } catch (e) {
            console.error(e);
            alert("Error verifying payment.");
          }
        },
        prefill: {},
      };

      // ✅ FIX: Cast window to unknown first, then to our isolated LocalWindow interface
      const win = window as unknown as LocalWindow;

      if (!win.Razorpay) {
          console.error("Razorpay SDK not loaded");
          alert("Payment system loading... please try again in a moment.");
          return;
      }

      // Initialize Razorpay
      const rzp = new win.Razorpay(options);
      
      rzp.on('payment.failed', function (response: RazorpayErrorResponse){
        alert("Payment Failed: " + response.error.description);
      });
      
      rzp.open();

    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      alert(message);
    } finally {
      setBuying(false);
    }
  }

  if (loading) return (
    <div className="flex h-96 items-center justify-center text-slate-400 font-medium">
      <Loader2 className="animate-spin mr-2" /> Loading subscription data...
    </div>
  );

  const active = subs?.activeSubscription;

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Subscription</h1>
        <p className="text-slate-500">Manage your plan and billing details</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Current Plan</h2>
        {active ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{active.product?.name || "Unknown Plan"}</div>
              <div className="text-emerald-600 font-bold text-sm flex items-center gap-1 mt-1">
                <Check size={14} strokeWidth={3} /> Active Subscription
              </div>
              <div className="text-sm text-slate-500 mt-2 font-medium">
                Renews on: {active.currentPeriodEnd ? new Date(active.currentPeriodEnd).toLocaleDateString() : "Lifetime"}
              </div>
            </div>
            <button className="text-slate-400 text-sm font-medium bg-slate-50 px-4 py-2 rounded-lg cursor-not-allowed hover:text-slate-600 transition-colors" disabled>
              Manage Billing
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">Free Plan</div>
              <div className="text-slate-500 mt-1 text-sm font-medium">Basic access. Limited features.</div>
            </div>
            <div className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Free Tier
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-slate-900">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => {
             const isCurrent = active?.product?.id === p.id;
             return (
              <div 
                key={p.id} 
                className={`border rounded-2xl p-6 relative flex flex-col transition-all duration-200 ${
                  isCurrent 
                    ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm">
                    Current
                  </div>
                )}
                
                <h3 className="font-bold text-lg text-slate-900">{p.name}</h3>
                <div className="mt-2 mb-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">₹{p.price / 100}</span>
                  <span className="text-slate-500 text-sm font-medium">/mo</span>
                </div>
                <p className="text-sm text-slate-600 mb-6 grow leading-relaxed">{p.description}</p>
                
                <button 
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrent 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95"
                  }`}
                  onClick={() => !isCurrent && buy(p.key)}
                  disabled={buying || isCurrent}
                >
                  {isCurrent ? "Active Plan" : (buying ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : "Upgrade Plan")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}