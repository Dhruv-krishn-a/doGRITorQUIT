// apps/web/app/layout.tsx
import "./globals.css";
import { ToastProvider } from "@shared/components/ToastProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-slate-900 font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}