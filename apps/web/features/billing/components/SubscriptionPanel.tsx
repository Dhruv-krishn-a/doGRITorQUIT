// apps/web/components/SubscriptionPanel.tsx
"use client";
import React, { useEffect, useState } from "react";

type Product = { key: string; name: string; price: number; currency: string };
type Subscription = { status?: string; priceId?: string | null; currentPeriodEnd?: string | null } | null;

function loadRazorScript(): Promise<void> {
  return new Promise((res, rej) => {
    if ((window as any).Razorpay) return res();
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/products").then(r => r.json()).then((p) => setProducts(p)).catch(() => setProducts([{ key: "PRO", name: "Pro", price: 199, currency: "INR" }]));
    fetch("/api/billing/subscription").then(r => r.json()).then((d) => setSubscription(d?.subscription ?? null)).catch(() => setSubscription(null));
  }, []);

  async function buy(productKey: string) {
    setMessage(null);
    setLoading(true);
    try {
      const orderResp = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey })
      });
      const orderJson = await orderResp.json();
      if (!orderResp.ok) throw new Error(orderJson?.error || "Failed to create order");

      await loadRazorScript();
      const options = {
        key: orderJson.keyId,
        amount: orderJson.amount,
        currency: orderJson.currency,
        order_id: orderJson.orderId,
        handler: async function (response: any) {
          // checkout completed on client; we poll subscription endpoint to confirm webhook processed
          setMessage("Payment completed. Waiting for subscription activation...");
          const success = await pollSubscriptionForActive(10);
          if (success) {
            setMessage("Subscription active! Refreshing status...");
            const sub = await fetch("/api/billing/subscription").then(r => r.json());
            setSubscription(sub?.subscription ?? null);
          } else {
            setMessage("Payment received but subscription not active yet. If this persists, check webhook logs.");
          }
        },
        modal: { ondismiss: function() { setMessage("Payment cancelled"); } }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Buy error:", err);
      setMessage(err.message || "Error while creating order");
    } finally {
      setLoading(false);
    }
  }

  async function pollSubscriptionForActive(maxAttempts = 8): Promise<boolean> {
    let attempt = 0;
    let delay = 1000;
    while (attempt < maxAttempts) {
      try {
        const resp = await fetch("/api/billing/subscription");
        const json = await resp.json();
        const sub = json?.subscription ?? null;
        if (sub?.status === "active" || sub?.status === "trialing") return true;
      } catch (e) { /* ignore */ }
      attempt++;
      await new Promise(r => setTimeout(r, delay));
      delay *= 1.8; // backoff
    }
    return false;
  }

  return (
    <div>
      <h2>Subscription</h2>
      {subscription ? (
        <div>
          <p>Current status: <strong>{subscription.status ?? "none"}</strong></p>
          <p>Price ID: {subscription.priceId ?? "N/A"}</p>
          <p>Period end: {subscription.currentPeriodEnd ?? "N/A"}</p>
        </div>
      ) : (
        <p>You do not have an active subscription.</p>
      )}

      <h3>Plans</h3>
      <div style={{ display: "flex", gap: 12 }}>
        {products.map((p) => (
          <div key={p.key} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <h4>{p.name}</h4>
            <p>{p.price} {p.currency}</p>
            <button disabled={loading} onClick={() => buy(p.key)}>
              Buy {p.name}
            </button>
          </div>
        ))}
      </div>

      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </div>
  );
}
