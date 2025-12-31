// File: apps/web/app/components/CheckoutButton.tsx

'use client';

import React, { useState } from 'react';

interface CheckoutButtonProps {
  productKey: string;
  label?: string;
}

export default function CheckoutButton({ productKey, label = 'Buy' }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const createOrder = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Server error ${res.status}`);
      }
      return res.json();
    } finally {
      setLoading(false);
    }
  };

  const openCheckout = async () => {
    setMessage(null);
    try {
      const order = await createOrder();
      if (!order?.orderId) throw new Error('Order creation failed');

      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve(true);
          s.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.head.appendChild(s);
        });
      }

      const options: any = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Your App',
        description: `Purchase ${productKey}`,
        order_id: order.orderId,
        handler(response: any) {
          setMessage('Payment success — confirming...');
          // Poll subscription endpoint
          pollSubscription();
        },
        modal: { ondismiss() { setMessage('Payment dismissed'); } },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setMessage(err.message || String(err));
    }
  };

  const pollSubscription = async () => {
    const start = Date.now();
    const timeout = 30000;
    while (Date.now() - start < timeout) {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const r = await fetch('/api/billing/subscription');
        if (!r.ok) continue;
        const json = await r.json();
        if (json?.subscription?.status === 'active' || json?.status === 'active') {
          setMessage('Subscription active! 🎉');
          return;
        }
      } catch {}
    }
    setMessage('Payment done — subscription not active yet. Please wait a few seconds and refresh.');
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        onClick={openCheckout}
        disabled={loading}
      >
        {loading ? 'Processing...' : label}
      </button>
      {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
    </div>
  );
}