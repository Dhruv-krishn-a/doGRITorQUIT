// apps/web/app/dashboard/checkout/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { Loader2 } from "lucide-react";

// --- Types ---

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: string; // Razorpay accepts string or number, searchParams returns string
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: Record<string, string>;
  theme?: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface WindowWithRazorpay {
  Razorpay?: RazorpayConstructor;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Get params safely
  const orderId = searchParams.get("orderId") || "";
  const amount = searchParams.get("amount") || "0";
  const currency = searchParams.get("currency") || "INR";
  const keyId = searchParams.get("keyId") || "";

  // ✅ FIX: Wrapped in useCallback to safely include in useEffect dependency array
  const startPayment = useCallback(() => {
    const win = window as unknown as WindowWithRazorpay;

    if (!win.Razorpay) {
      alert("Payment gateway failed to load. Please check your connection.");
      return;
    }

    const rzp = new win.Razorpay({
      key: keyId,
      amount: amount,
      currency: currency,
      name: "gritorquit",
      description: "Subscription Upgrade",
      order_id: orderId,
      handler: async function (response: RazorpaySuccessResponse) {
        try {
          // Payment Success! Verify via API
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            router.push("/dashboard/subscriptions?success=true");
          } else {
            alert("Payment verification failed. Please contact support.");
            router.push("/dashboard/subscriptions");
          }
        } catch (error) {
          console.error("Verification error:", error);
          alert("An error occurred during verification.");
          router.push("/dashboard/subscriptions");
        }
      },
      modal: {
        ondismiss: function () {
          router.push("/dashboard/subscriptions");
        },
      },
      theme: {
        color: "#0f172a", // Slate 900
      },
    });

    rzp.open();
    setLoading(false);
  }, [amount, currency, keyId, orderId, router]);

  useEffect(() => {
    // Wait for Razorpay script to load
    const win = window as unknown as WindowWithRazorpay;
    
    if (typeof window !== "undefined" && win.Razorpay && orderId) {
      startPayment();
    }
  }, [orderId, startPayment]); // ✅ dependency array is now correct

  return (
    <div className="transform-gpu h-[80vh] flex flex-col items-center justify-center text-center">
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={() => { 
          // Only start if we have the order details ready
          if (orderId) startPayment(); 
        }}
      />
      
      {loading && (
        <>
          <Loader2 className="transform-gpu animate-spin text-blue-600 mb-4" size={48} />
          <h2 className="transform-gpu text-xl font-bold text-slate-800">Initializing Secure Checkout...</h2>
          <p className="transform-gpu text-slate-500 mt-2">Please do not close this window.</p>
        </>
      )}
    </div>
  );
}