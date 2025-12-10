// apps/web/app/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "../../../../packages/config/siteNav";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

type Props = {
  nav: NavItem[];
};

export default function Header({ nav }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const mainNav = nav.filter((n) => n.group === "main" && n.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // current user state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUserEmail(data?.session?.user?.email ?? null);
      } catch (err) {
        // ignore
      }
    })();

    // listen for auth changes to update UI (optional)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      try {
        (listener as any)?.subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        // you can show a toast here if you use a toast lib
        setSigningOut(false);
        return;
      }
      // clear UI state if needed
      // redirect to login
      router.push("/login");
    } catch (e) {
      console.error(e);
      setSigningOut(false);
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen((s) => !s)}
            className="p-2 rounded-md hover:bg-gray-100 md:hidden"
            aria-label="toggle menu"
          >
            ☰
          </button>

          <Link href="/" className="text-lg font-semibold">
            Planner
          </Link>

          <nav className="hidden md:flex items-center gap-3 ml-6">
            {mainNav.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`px-3 py-2 rounded-md ${pathname === item.path ? "bg-slate-100" : "hover:bg-slate-50"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* show user email if logged in, else sign-in link */}
          {userEmail ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-700 hidden sm:block">{userEmail}</div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-md text-sm hover:bg-red-100 disabled:opacity-60"
              >
                {signingOut ? "Signing out…" : "Logout"}
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-3 py-2 rounded-md text-sm hover:bg-slate-50">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* mobile dropdown */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-2 flex flex-col gap-2">
            {mainNav.map((item) => (
              <Link key={item.id} href={item.path} className="px-2 py-2 rounded-md">
                {item.label}
              </Link>
            ))}
            <div className="mt-2">
              {userEmail ? (
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full text-left px-3 py-2 rounded-md bg-red-50 text-red-600"
                >
                  {signingOut ? "Signing out…" : "Logout"}
                </button>
              ) : (
                <Link href="/login" className="px-3 py-2 rounded-md">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
