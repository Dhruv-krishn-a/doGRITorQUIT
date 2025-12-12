// apps/web/app/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "../../../../packages/config/siteNav";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../utils/supabase";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

type Props = {
  nav: NavItem[];
};

export default function Header({ nav }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const mainNav = nav.filter((n) => n.group === "main" && n.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const toast = useToast();

  // user
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // click outside to close dropdown
  const ddRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUserEmail(data?.session?.user?.email ?? null);
    })();

    // Fix: Properly destructure subscription to avoid 'any' casting
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function doSignOut() {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.showToast({ title: "Sign out failed", message: error.message ?? "Unknown error", type: "error" });
        setLoggingOut(false);
        return;
      }
      toast.showToast({ title: "Signed out", message: "You have been signed out.", type: "success" });
      // small delay so user sees toast
      setTimeout(() => {
        router.push("/login");
      }, 400);
    } catch (e: unknown) {
      // Fix: Use 'unknown' instead of 'any' and narrow the type
      const message = e instanceof Error ? e.message : String(e);
      toast.showToast({ title: "Sign out error", message, type: "error" });
      setLoggingOut(false);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            {userEmail ? (
              <div className="relative" ref={ddRef}>
                <button
                  onClick={() => setProfileOpen((s) => !s)}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100"
                  aria-haspopup="menu"
                >
                  <Avatar email={userEmail} />
                  <span className="hidden sm:block text-sm text-slate-700">{userEmail}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg overflow-hidden z-50">
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="block px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      Settings
                    </Link>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-3 py-2 rounded-md text-sm hover:bg-slate-50">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={showLogoutModal}
        title="Confirm sign out"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          await doSignOut();
          setShowLogoutModal(false);
        }}
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        confirmLoading={loggingOut}
      >
        Are you sure you want to sign out? You will need to log in again to access your dashboard.
      </Modal>
    </>
  );
}