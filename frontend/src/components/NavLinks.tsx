"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { getToken, clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import LocaleToggle from "@/components/LocaleToggle";

export default function NavLinks() {
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasToken(!!getToken());
  }, []);

  return (
    <nav className="text-sm flex items-center gap-4">
      {!hasToken && <Link href="/login" className="hover:underline">{t("nav_login")}</Link>}
      {!hasToken && <Link href="/register" className="hover:underline">{t("nav_register")}</Link>}
      <Link href="/dashboard" className="hover:underline">{t("nav_dashboard")}</Link>
      <Link href="/dashboard/contacts" className="hover:underline">{t("nav_contacts")}</Link>
      {hasToken && (
        <button
          onClick={() => { clearToken(); router.push("/"); }}
          className="text-sm border border-slate-700 px-3 py-1 rounded-xl hover:bg-slate-800"
        >
          {t("nav_logout")}
        </button>
      )}
      <ThemeToggle />
      <LocaleToggle />
    </nav>
  );
}


