"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import { api } from "@/lib/api";
import type { UserPublic } from "@/types";

export default function NavLinks() {
  const { isAuthenticated, clearToken, token } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserPublic | null>(null);
  const router = useRouter();

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadUser();
    } else {
      setUser(null);
    }
  }, [isAuthenticated, token]);

  const loadUser = async () => {
    if (!token) return;
    try {
      const userData = await api<UserPublic>("/auth/me", {}, token);
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Menu */}
      <nav className="hidden md:flex text-sm items-center gap-4">
        {!isAuthenticated && <Link href="/login" className="hover:underline">Login</Link>}
        {!isAuthenticated && <Link href="/register" className="hover:underline">Sign Up</Link>}
        {isAuthenticated && <Link href="/dashboard" className="hover:underline">Dashboard</Link>}
        {isAuthenticated && <Link href="/dashboard/contacts" className="hover:underline">Contacts</Link>}
        {isAuthenticated && user && <UserMenu user={user} />}
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
              {!isAuthenticated && (
                <>
                  <Link href="/login" className="text-lg hover:text-blue-400" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="text-lg hover:text-blue-400" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Link href="/dashboard" className="text-lg hover:text-blue-400" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/dashboard/contacts" className="text-lg hover:text-blue-400" onClick={() => setIsMobileMenuOpen(false)}>
                    Contacts
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-lg text-left hover:text-red-400 border-t border-slate-700 pt-4"
                  >
                    Logout
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


