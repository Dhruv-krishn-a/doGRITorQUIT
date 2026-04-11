// apps/web/app/layout.tsx
import "./globals.css";
import { ToastProvider } from "@shared/components/ToastProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  if (savedTheme) {
                    document.documentElement.setAttribute('data-theme', savedTheme);
                  } else {
                    document.documentElement.setAttribute('data-theme', 'noir');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="transform-gpu bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
        <div id="study-view-root" />
        <div id="study-modal-root" />
      </body>
    </html>
  );
}