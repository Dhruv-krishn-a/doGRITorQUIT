"use client";

import { useEffect, useState } from "react";

export default function SubscriptionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [subs, setSubs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [pRes, sRes] = await Promise.all([
        fetch("/api/billing/products"),
        fetch("/api/billing/subscription"),
      ]);
      const [pJson, sJson] = await Promise.all([pRes.json(), sRes.json()]);
      if (!mounted) return;
      setProducts(pJson || []);
      setSubs(sJson || {});
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function buy(productKey: string) {
    setBuying(true);
    try {
      const r = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });
      const json = await r.json();
      if (!r.ok) {
        alert(json?.error || "Failed to create order");
        setBuying(false);
        return;
      }

      // Open Razorpay Checkout. You probably already have checkout code. Example:
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // set client-side key in your env
        amount: json.amount,
        currency: json.currency,
        order_id: json.orderId,
        handler: function (response: any) {
          // after checkout, UI will refresh from webhook. you may poll subscription endpoint once.
          console.log("checkout handler", response);
          setTimeout(async () => {
            const res = await fetch("/api/billing/subscription");
            setSubs(await res.json());
          }, 2000);
        },
        prefill: {},
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment start failed");
    } finally {
      setBuying(false);
    }
  }

  if (loading) return <div>Loading…</div>;

  const active = subs?.activeSubscription;
  const userTier = subs?.userTier;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscription</h1>

      <div>
        <h2 className="font-semibold">Current</h2>
        {active ? (
          <div className="p-3 border rounded">
            <div>{active.product?.name}</div>
            <div>Status: {active.status}</div>
            <div>Valid until: {active.currentPeriodEnd ? new Date(active.currentPeriodEnd).toString() : "—"}</div>
          </div>
        ) : (
          <div>You do not have an active subscription.</div>
        )}
      </div>

      <div>
        <h2 className="font-semibold">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border p-4 rounded">
              <div className="font-medium">{p.name}</div>
              <div>{p.description}</div>
              <div className="mt-2">
                <strong>{p.price / 100} {p.currency}</strong>
              </div>
              <button className="mt-3 btn" onClick={() => buy(p.key)} disabled={buying}>
                Buy {p.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold">Your subscriptions</h2>
        <ul>
          {(subs?.subscriptions || []).map((s: any) => (
            <li key={s.id} className="border p-2 rounded my-2">
              <div>{s.product?.name}</div>
              <div>Status: {s.status}</div>
              <div>Started: {new Date(s.startedAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
