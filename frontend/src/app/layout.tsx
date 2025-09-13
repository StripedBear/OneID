import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HumanDNS - Living Address Book",
  description: "Current communication channels by permanent link",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen">
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              HumanDNS
            </Link>
            <nav className="flex gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="text-gray-600 hover:text-gray-900">
                Register
              </Link>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-sm text-gray-500">
          © {new Date().getFullYear()} HumanDNS
        </footer>
      </body>
    </html>
  );
}
