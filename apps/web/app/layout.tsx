// apps/web/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { siteNav } from "../../../packages/config/siteNav";
import { ToastProvider } from "./components/ToastProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Razorpay Checkout SDK (required so `window.Razorpay` is available) */}
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        ></script>
        {/* Optional: minimal meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-50 text-slate-900">
        {/* ✅ EVERYTHING must be inside ToastProvider */}
        <ToastProvider>
          <Header nav={siteNav} />
          <div className="min-h-[calc(100vh-120px)]">{children}</div>
          <Footer nav={siteNav} />
        </ToastProvider>
      </body>
    </html>
  );
}
