// apps/web/app/layout.tsx
import "./globals.css";
import { ToastProvider } from "@shared/components/ToastProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="transform-gpu bg-gray-50 text-slate-900 font-sans">
        <ToastProvider>{children}</ToastProvider>
        <div id="study-view-root" />
        <div id="study-modal-root" />
      </body>
    </html>
  );
}