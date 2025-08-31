"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

export default function NavLinks() {
  const [hasToken, setHasToken] = useState(false);
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => { setHasToken(!!getToken()); }, []);

  return (
    <nav className="text-sm flex items-center gap-4">
      {!hasToken && <Link href="/login" className="hover:underline">{t("nav_login")}</Link>}
      {!hasToken && <Link href="/register" className="hover:underline">{t("nav_register")}</Link>}
      {hasToken && <Link href="/dashboard" className="hover:underline">{t("nav_dashboard")}</Link>}
      {hasToken && <Link href="/dashboard/contacts" className="hover:underline">{t("nav_contacts")}</Link>}
      {hasToken && (
        <button
          onClick={() => { clearToken(); router.push("/"); }}
          className="text-sm border border-slate-700 px-3 py-1 rounded-xl hover:bg-slate-800"
        >
          {t("nav_logout")}
        </button>
      )}
    </nav>
  );
}


