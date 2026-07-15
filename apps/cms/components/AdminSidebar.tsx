// apps/cms/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LayoutDashboard, Users, ShoppingBag, CreditCard, LogOut, Menu, X, Sparkles, History, FileText, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/login"); 
      router.refresh();
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Products", href: "/products", icon: ShoppingBag },
    { name: "Orders", href: "/orders", icon: CreditCard },
    { name: "Content", href: "/content", icon: FileText },
    { name: "Audit Logs", href: "/audit-logs", icon: History },
    { name: "Global Config", href: "/settings", icon: Settings },
  ];

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 tracking-tighter uppercase">
          <Sparkles size={16} className="text-rose-500" />
          CMS Admin
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-2xl border-r border-white shadow-[20px_0_60px_rgba(0,0,0,0.05)] flex flex-col z-50 transition-transform duration-300 antialiased ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        
        {/* Decorative Ethereal Gradients inside sidebar */}
        <div className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-rose-100/50 rounded-full blur-[60px] pointer-events-none -z-10 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-pink-100/50 rounded-full blur-[60px] pointer-events-none -z-10 mix-blend-multiply" />

        <div className="p-6 mb-2 border-b border-rose-100/30 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900 tracking-tighter uppercase">
            <Sparkles size={18} className="text-rose-500 animate-pulse drop-shadow-sm" />
            <span>CMS Engine</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-rose-500 bg-white shadow-sm border border-slate-100 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-all">
             <X size={16} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden ${
                  isActive 
                    ? "text-rose-600 font-bold shadow-sm" 
                    : "text-slate-500 font-bold hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl -z-10" />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <Icon size={20} className={isActive ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "text-slate-400 group-hover:text-slate-600"} />
                  <span className="text-sm tracking-wide">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-2 relative z-10 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white/50 border border-white hover:border-rose-200 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Disconnect
          </button>
        </div>
      </aside>
    </>
  );
}