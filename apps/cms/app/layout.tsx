import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-100 text-slate-900">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-4 text-xl font-bold border-b border-slate-700">Planner CMS</div>
          <nav className="flex-1 p-4 space-y-2">
  <Link href="/" className="block py-2 px-3 rounded hover:bg-slate-800">Dashboard</Link>
  <Link href="/users" className="block py-2 px-3 rounded hover:bg-slate-800">Users</Link>
  <Link href="/products" className="block py-2 px-3 rounded hover:bg-slate-800">Plans & Features</Link>
  <Link href="/orders" className="block py-2 px-3 rounded hover:bg-slate-800">Payments</Link>
</nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </body>
    </html>
  );
}