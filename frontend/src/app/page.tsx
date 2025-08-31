"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();
  
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-semibold">{t("app_title")}</h1>
      <p className="text-slate-300">
        {t("home_subtitle")}
      </p>
      
      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900">
        <h2 className="font-medium mb-2">{t("home_public_profiles_title")}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          {t("home_public_profiles_desc")} <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">/username</code>
        </p>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p className="mb-2">{t("home_public_profiles_examples")}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/alice" className="text-blue-500 hover:underline bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">/alice</Link>
            <Link href="/bob" className="text-blue-500 hover:underline bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">/bob</Link>
            <Link href="/charlie" className="text-blue-500 hover:underline bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">/charlie</Link>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Link href="/register" className="rounded-2xl px-4 py-2 bg-slate-100 text-slate-900">{t("home_get_started")}</Link>
        <Link href="/login" className="rounded-2xl px-4 py-2 border border-slate-700">{t("home_have_account")}</Link>
      </div>
    </div>
  );
}
