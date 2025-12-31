// apps/web/app/components/Footer.tsx
"use client";

import Link from "next/link";
import { NavItem } from "../../../../packages/config/siteNav";

export default function Footer({ nav }: { nav: NavItem[] }) {
  const footerNav = nav.filter((n) => n.group === "footer" && n.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <footer className="border-t bg-white mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="text-sm text-slate-600">© {new Date().getFullYear()} Planner</div>
        <div className="flex gap-4">
          {footerNav.map((item) => (
            <Link key={item.id} href={item.path} className="text-sm text-slate-600 hover:underline">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
