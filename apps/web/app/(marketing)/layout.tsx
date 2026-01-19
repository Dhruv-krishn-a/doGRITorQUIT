// apps/web/app/(marketing)/layout.tsx
import Header from "@shared/components/Header";
import Footer from "@shared/components/Footer";
import { siteNav } from "../../config/site";

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