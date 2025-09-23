import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "OneID - Living Address Book",
  description: "Current communication channels by permanent link",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen flex flex-col">
        <AuthProvider>
          <header className="border-b border-slate-700">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-white">
                OneID
              </Link>
              <NavLinks />
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
