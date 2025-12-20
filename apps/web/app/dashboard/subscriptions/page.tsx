// apps/web/app/dashboard/subscriptions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider"; // Assuming you have this

export default function SubscriptionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [subs, setSubs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const router = useRouter();
  // const { showToast } = useToast(); // Optional: use your toast

  // Load data
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch("/api/billing/products"),
          fetch("/api/billing/subscription"),
        ]);
        const [pJson, sJson] = await Promise.all([pRes.json(), sRes.json()]);
        if (!mounted) return;
        setProducts(pJson || []);
        setSubs(sJson || {});
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

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: json.amount,
        currency: json.currency,
        order_id: json.orderId,
        name: "Planner App",
        description: `Upgrade to ${productKey}`,
        // 3. HANDLER: This runs on payment success
        handler: async function (response: any) {
          try {
            // Call our new Instant Verify route
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
              alert("Payment Successful! Plan Activated.");
              window.location.reload(); // Reload to show new plan
            } else {
              alert("Payment successful but verification failed. Please contact support.");
            }
          } catch (e) {
            console.error(e);
            alert("Error verifying payment.");
          }
        },
        prefill: {
          // You can prefill user details here if available
        },
      };

      // @ts-ignore
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setBuying(false);
    }
  }

  if (loading) return <div className="p-8">Loading subscription data...</div>;

  const active = subs?.activeSubscription;

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Subscription</h1>
        <p className="text-slate-500">Manage your plan and billing details</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-slate-500 mb-4">Current Plan</h2>
        {active ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{active.product?.name || "Unknown Plan"}</div>
              <div className="text-green-600 font-medium text-sm flex items-center gap-1 mt-1">
                ● Active
              </div>
              <div className="text-sm text-slate-500 mt-2">
                Renews on: {active.currentPeriodEnd ? new Date(active.currentPeriodEnd).toLocaleDateString() : "Lifetime"}
              </div>
            </div>
            <button className="text-slate-400 text-sm hover:text-slate-600" disabled>Managing billing disabled</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">Free Plan</div>
              <div className="text-slate-500 mt-1">Basic access. Limited AI generations.</div>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-bold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => {
             // Don't show the plan user already has
             const isCurrent = active?.product?.id === p.id;
             return (
              <div key={p.id} className={`border rounded-xl p-6 relative flex flex-col ${isCurrent ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20' : 'bg-white hover:border-slate-300 transition-colors'}`}>
                {isCurrent && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium">Current</div>}
                
                <h3 className="font-bold text-lg text-slate-900">{p.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold">₹{p.price / 100}</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <p className="text-sm text-slate-600 mb-6 flex-grow">{p.description}</p>
                
                <button 
                  className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                    isCurrent 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow"
                  }`}
                  onClick={() => !isCurrent && buy(p.key)}
                  disabled={buying || isCurrent}
                >
                  {isCurrent ? "Active Plan" : (buying ? "Processing..." : "Upgrade")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}