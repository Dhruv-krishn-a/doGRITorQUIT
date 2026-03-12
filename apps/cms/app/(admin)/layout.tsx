// apps/cms/app/(admin)/layout.tsx
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="transform-gpu min-h-screen bg-[#fdfbfb]">
      {/* Sidebar is controlled by its own responsive logic */}
      <AdminSidebar />
      
      {/* Padding left 64 (16rem) on desktop to account for the fixed sidebar */}
      <main className="transform-gpu lg:pl-64 min-h-screen transition-all flex flex-col pt-16 lg:pt-0">
        <div className="transform-gpu p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}