// apps/web/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { siteNav } from "../../../packages/config/siteNav";

export const metadata = {
  title: "Planner",
  description: "Planner app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // siteNav is static for now; can later be replaced by a fetch from Supabase
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-slate-900">
        <Header nav={siteNav} />
        <div className="min-h-[calc(100vh-120px)]">{children}</div>
        <Footer nav={siteNav} />
      </body>
    </html>
  );
}
