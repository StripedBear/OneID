import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import PWARegister from "@/components/PWARegister";
import Providers from "@/components/Providers";
import { I18nProvider } from "@/components/I18nProvider";
import NavLinks from "@/components/NavLinks";

export const metadata: Metadata = {
  title: "OneID — living address book",
  description: "Current communication channels by permanent link",
  manifest: "/manifest.json",
  other: { "color-scheme": "light dark" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'theme';
                  var stored = localStorage.getItem(storageKey);
                  var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var theme = stored || 'system';
                  var root = document.documentElement;
                  
                  if (theme === 'system') {
                    // Use system preference
                    if (system === 'dark') {
                      root.classList.add('dark');
                      root.style.colorScheme = 'dark';
                    } else {
                      root.classList.remove('dark');
                      root.style.colorScheme = 'light';
                    }
                  } else if (theme === 'dark') {
                    root.classList.add('dark');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.remove('dark');
                    root.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen">
        <I18nProvider>
          <Providers>
            <PWARegister />
            <header className="border-b border-slate-200 dark:border-slate-800">
              <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold">OneID</Link>
                <NavLinks />
              </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-8">
              {children}
            </main>
            <footer className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> OneID
            </footer>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
