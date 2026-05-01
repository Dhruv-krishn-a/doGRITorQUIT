"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, ShieldCheck, CreditCard, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
    user: any;
    plan: any;
}

export default function CheckoutClient({ user, plan }: Props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const initializePayment = async () => {
            try {
                // 1. Create Order
                const res = await fetch("/api/billing/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productKey: plan.key }),
                });
                const order = await res.json();

                if (!res.ok) throw new Error(order.error ?? "Failed to initialize payment");

                // 2. Open Razorpay
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                    amount: order.amount,
                    currency: order.currency,
                    name: "gritorquit",
                    description: `Upgrade to ${plan.name}`,
                    order_id: order.orderId,
                    prefill: {
                        email: user.email,
                        name: user.user_metadata?.full_name || user.name
                    },
                    theme: { color: "#0f172a" },
                    handler: async (response: any) => {
                        setLoading(true);
                        try {
                            const verify = await fetch("/api/billing/verify", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(response),
                            });

                            if (!verify.ok) throw new Error("Payment verification failed");

                            router.push("/dashboard/subscriptions?success=true");
                        } catch (err) {
                            setError("Payment verification failed. Please contact support.");
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            router.push("/dashboard/subscriptions");
                        }
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
                setLoading(false);
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred");
                setLoading(false);
            }
        };

        // Ensure script is loaded
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = initializePayment;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [plan, user, router]);

    return (
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-10 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-3xl bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] border border-[var(--accent-color)]/20 shadow-inner">
                    <CreditCard size={32} />
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-2xl font-black uppercase italic tracking-tight text-[var(--text-primary)]">Secure Checkout</h1>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em]">Plan: {plan.name}</p>
            </div>

            {loading && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <Loader2 className="animate-spin text-[var(--accent-color)]" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Initializing Secure Node...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-4">
                    <p className="text-xs font-bold text-rose-500">{error}</p>
                    <Link href="/dashboard/subscriptions" className="block w-full py-3 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">
                        Go Back
                    </Link>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-color)]">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-left">
                            Razorpay encrypted connection active. Your data is protected.
                        </p>
                    </div>
                </div>
            )}

            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-50">
                <Link href="/dashboard/subscriptions" className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
                    <ChevronLeft size={12} /> Return to grid
                </Link>
            </div>
        </div>
    );
}
