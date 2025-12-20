// apps/cms/app/(admin)/layout.tsx
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Sidebar is always visible here */}
      <AdminSidebar />
      
      {/* Padding left 64 (16rem) to account for the fixed sidebar */}
      <main className="pl-64 min-h-screen transition-all">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}