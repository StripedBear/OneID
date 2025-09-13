"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function NavLinks() {
  const [hasToken, setHasToken] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => { setHasToken(!!getToken()); }, []);

  const handleLogout = () => {
    clearToken();
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Menu */}
      <nav className="hidden md:flex text-sm items-center gap-4">
        {!hasToken && <Link href="/login" className="hover:underline">Войти</Link>}
        {!hasToken && <Link href="/register" className="hover:underline">Регистрация</Link>}
        {hasToken && <Link href="/dashboard" className="hover:underline">Панель</Link>}
        {hasToken && <Link href="/dashboard/contacts" className="hover:underline">Контакты</Link>}
        {hasToken && (
          <button
            onClick={handleLogout}
            className="text-sm border border-slate-700 px-3 py-1 rounded-xl hover:bg-slate-800"
          >
            Выйти
          </button>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-slate-400 hover:text-white"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-0 right-0 h-full w-64 bg-slate-900 border-l border-slate-700 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-4 mt-8">
              {!hasToken && (
                <>
                  <Link href="/login" className="text-lg hover:text-blue-400" onClick={() => setIsMobileMenuOpen(false)}>
                    Войти
                  </Link>
                  <Link href="/register" className="text-lg hover:text-blue-400" onClick={() => setIsMobileMenuOpen(false)}>
                    Регистрация
                  </Link>
                </>
              )}
              {hasToken && (
                <>
                  <Link href="/dashboard" className="text-lg hover:text-blue-400" onClick={() => setIsMobileMenuOpen(false)}>
                    Панель
                  </Link>
                  <Link href="/dashboard/contacts" className="text-lg hover:text-blue-400" onClick={() => setIsMobileMenuOpen(false)}>
                    Контакты
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-lg text-left hover:text-red-400 border-t border-slate-700 pt-4"
                  >
                    Выйти
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


