'use client';

import React, { useState } from 'react';

// --- Types ---

interface CheckoutButtonProps {
  productKey: string;
  label?: string;
}

interface CreateOrderResponse {
  keyId: string;
  amount: number;
  currency: string;
  orderId: string;
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

// ✅ FIX: Standalone interface that DOES NOT extend global Window.
// This prevents conflicts with other files that modify Window globally.
interface LocalRazorpayWindow {
  Razorpay?: new (options: RazorpayOptions) => { open: () => void };
}

export default function CheckoutButton({ productKey, label = 'Buy' }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const createOrder = async (): Promise<CreateOrderResponse> => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey }),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || `Server error ${res.status}`);
      }
      return json as CreateOrderResponse;
    } finally {
      setLoading(false);
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
      } catch {
        // Ignore polling errors to retry quietly
      }
    }
    setMessage('Payment done — subscription not active yet. Please wait a few seconds and refresh.');
  };

  const openCheckout = async () => {
    setMessage(null);
    try {
      const order = await createOrder();
      
      if (!order?.orderId) {
        throw new Error('Order creation failed');
      }

      // ✅ FIX: Cast window to unknown first, then to our local interface
      const win = window as unknown as LocalRazorpayWindow;

      // Check if SDK is loaded
      if (!win.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve(true);
          s.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.head.appendChild(s);
        });
      }

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'gritorquit',
        description: `Purchase ${productKey}`,
        order_id: order.orderId,
        handler: () => {
          // Response argument used if verification logic needed later
          setMessage('Payment success — confirming...');
          pollSubscription();
        },
        modal: { 
          ondismiss() { 
            setMessage('Payment dismissed'); 
          } 
        },
      };

      // ✅ FIX: Re-check/cast window to use the constructor safely
      const rzpConstructor = (window as unknown as LocalRazorpayWindow).Razorpay;
      
      if (rzpConstructor) {
        const rzp = new rzpConstructor(options);
        rzp.open();
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(errorMessage);
    }
  };

  return (
    <div>
      <button
        className="transform-gpu px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700 transition-colors"
        onClick={openCheckout}
        disabled={loading}
      >
        {loading ? 'Processing...' : label}
      </button>
      {message && <div className="transform-gpu mt-2 text-sm text-gray-700 font-medium animate-pulse">{message}</div>}
    </div>
  );
}