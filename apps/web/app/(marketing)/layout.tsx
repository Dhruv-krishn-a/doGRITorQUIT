// apps/web/app/(marketing)/layout.tsx
import type { Metadata } from "next";
import Header from "@shared/components/Header";
import Footer from "@shared/components/Footer";
import { siteNav } from "../../config/site";

export const metadata: Metadata = {
  title: "doGRITorQUIT | AI-Powered Goal Tracker & Productivity Dashboard",
  description: "Stop making to-do lists and start shipping. doGRITorQUIT is an AI-powered goal tracker that breaks massive goals into daily, actionable habits, tracks your focus time, and prevents burnout.",
  keywords: ["productivity", "goal tracker", "AI planner", "habit tracker", "focus timer", "burnout prevention", "doGRITorQUIT"],
  openGraph: {
    title: "doGRITorQUIT | Architect Your Future",
    description: "The ultimate AI-powered workspace to break down massive goals into daily, actionable tasks.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "doGRITorQUIT",
    description: "Stop making to-do lists and start shipping with AI-powered goal tracking.",
  }
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header nav={siteNav} />
      <main className="flex-1 pt-20 flex flex-col relative">
        {children}
      </main>
      <Footer nav={siteNav} />
    </div>
  );
}