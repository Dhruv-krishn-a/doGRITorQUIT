// apps/cms/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LayoutDashboard, Users, ShoppingBag, CreditCard, LogOut } from "lucide-react"; 

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // REMOVED: if (pathname === "/login") return null; -> Not needed anymore!

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Redirect to the public login page
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Products", href: "/products", icon: ShoppingBag },
    { name: "Orders", href: "/orders", icon: CreditCard },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-300 flex flex-col z-50">
      <div className="p-6 border-b border-slate-800">
        <div className="text-white font-bold text-xl tracking-tight">CMS Admin</div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}