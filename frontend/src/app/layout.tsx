import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import PWARegister from "@/components/PWARegister";
import Providers from "@/components/Providers";
import ThemeToggle from "@/components/ThemeToggle"; // ← обычный импорт КЛИЕНТ-компонента

export const metadata: Metadata = {
  title: "OneID — живая записная книжка",
  description: "Актуальные каналы связи по постоянной ссылке",
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
    <html lang="ru" suppressHydrationWarning>
      {/* Ранний скрипт: ставим тему ДО гидратации */}
      <Script id="theme-init" strategy="beforeInteractive">
        {`(function(){try{
          var storageKey='theme';
          var stored=localStorage.getItem(storageKey);
          var system=window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          var theme=stored||system;
          var root=document.documentElement;
          if(theme==='dark'){root.classList.add('dark');} else {root.classList.remove('dark');}
          root.style.colorScheme=theme;
        }catch(e){}})();`}
      </Script>

      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen">
        <Providers>
          <PWARegister />
          <header className="border-b border-slate-200 dark:border-slate-800">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">OneID</Link>
              <nav className="text-sm flex items-center gap-4">
                <Link href="/login" className="hover:underline">Войти</Link>
                <Link href="/register" className="hover:underline">Регистрация</Link>
                <Link href="/dashboard" className="hover:underline">Дашборд</Link>
                <Link href="/dashboard/contacts" className="hover:underline">Контакты</Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">
            {children}
          </main>
          <footer className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> OneID
          </footer>
        </Providers>
      </body>
    </html>
  );
}
