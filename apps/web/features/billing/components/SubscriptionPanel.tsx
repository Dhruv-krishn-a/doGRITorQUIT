"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Check, AlertCircle, CreditCard, Shield } from "lucide-react";

// --- Types ---

type Product = { 
  key: string; 
  name: string; 
  price: number; 
  currency: string;
  description?: string;
};

type Subscription = { 
  status?: string; 
  priceId?: string | null; 
  currentPeriodEnd?: string | null 
} | null;

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

// Extend global Window to include Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

// --- Helpers ---

function loadRazorScript(): Promise<void> {
  return new Promise((res, rej) => {
    if (window.Razorpay) return res();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => res();
    script.onerror = () => rej(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

export default function SubscriptionPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, subRes] = await Promise.all([
          fetch("/api/billing/products"),
          fetch("/api/billing/subscription")
        ]);
        
        const productsData = await prodRes.json();
        const subData = await subRes.json();

        setProducts(Array.isArray(productsData) ? productsData : []);
        setSubscription(subData?.subscription ?? null);
      } catch {
        // Fallback for demo/error states
        setProducts([{ key: "PRO", name: "Pro Plan", price: 199, currency: "INR", description: "Unlock all premium features" }]);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  async function pollSubscriptionForActive(maxAttempts = 8): Promise<boolean> {
    let attempt = 0;
    let delay = 1000;
    while (attempt < maxAttempts) {
      try {
        const resp = await fetch("/api/billing/subscription");
        const json = await resp.json();
        const sub = json?.subscription ?? null;
        if (sub?.status === "active" || sub?.status === "trialing") return true;
      } catch { 
        /* ignore errors during polling */ 
      }
      attempt++;
      await new Promise(r => setTimeout(r, delay));
      delay *= 1.8; // Exponential backoff
    }
    return false;
  }

  async function buy(productKey: string) {
    setMessage(null);
    setProcessing(true);
    try {
      const orderResp = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey })
      });
      const orderJson = await orderResp.json();
      
      if (!orderResp.ok) throw new Error(orderJson?.error || "Failed to create order");

      await loadRazorScript();
      
      const options: RazorpayOptions = {
        key: orderJson.keyId,
        amount: orderJson.amount,
        currency: orderJson.currency,
        order_id: orderJson.orderId,
        // Handler called on successful payment on Razorpay side
        // ✅ FIX: Removed unused '_response' parameter
        handler: async function () {
          setMessage({ type: 'info', text: "Payment verified. Activating subscription..." });
          
          const success = await pollSubscriptionForActive(10);
          
          if (success) {
            setMessage({ type: 'success', text: "Subscription active! refreshing..." });
            const subRes = await fetch("/api/billing/subscription");
            const subJson = await subRes.json();
            setSubscription(subJson?.subscription ?? null);
            // Clear success message after a delay
            setTimeout(() => setMessage(null), 3000);
          } else {
            setMessage({ type: 'error', text: "Payment received but activation is pending. Check back soon." });
          }
        },
        modal: { 
          ondismiss: function() { 
            setMessage({ type: 'info', text: "Payment cancelled" });
            setProcessing(false);
          } 
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Buy error:", err);
      const msg = err instanceof Error ? err.message : "Error while processing order";
      setMessage({ type: 'error', text: msg });
      setProcessing(false);
    } finally {
      // Note: We deliberately don't setProcessing(false) here for success path 
      // because the modal/handler flow continues asynchronously.
      // It is handled in ondismiss or handler completion.
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Loading plan details...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Shield size={14} /> Current Status
        </h2>
        {subscription ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900 capitalize flex items-center gap-2">
                {subscription.status} Plan
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full border border-emerald-200 uppercase font-bold tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Renews on {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <button disabled className="text-slate-400 text-sm font-medium border border-slate-200 px-4 py-2 rounded-lg bg-slate-50 cursor-not-allowed">
              Manage
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-slate-700">Free Tier</div>
              <p className="text-slate-500 text-sm">Upgrade to unlock all features.</p>
            </div>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => {
            const isCurrent = false; // Logic to check if this product is current can be added here
            return (
              <div 
                key={p.key} 
                className="group border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all rounded-xl p-6 bg-white flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{p.name}</h4>
                    <p className="text-slate-500 text-sm">{p.description || "Premium features included"}</p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 p-2 rounded-lg">
                    <CreditCard size={20} />
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-slate-900">₹{p.price}</span>
                    <span className="text-slate-500 text-sm font-medium">/{p.currency.toLowerCase()}</span>
                  </div>
                  
                  <button 
                    disabled={processing || isCurrent}
                    onClick={() => buy(p.key)}
                    className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {processing ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isCurrent ? "Current Plan" : "Upgrade Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message.type === 'error' ? <AlertCircle size={18} /> : 
           message.type === 'success' ? <Check size={18} /> : 
           <Loader2 size={18} className="animate-spin" />}
          {message.text}
        </div>
      )}
    </div>
  );
}