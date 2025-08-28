"use client";

import { useEffect, useState } from "react";
import { getLocalePreference, setLocalePreference } from "@/lib/i18n";

export default function LocaleToggle() {
  const [locale, setLocale] = useState<"ru" | "en">("ru");

  useEffect(() => {
    setLocale(getLocalePreference());
  }, []);

  function switchTo(next: "ru" | "en") {
    setLocale(next);
    setLocalePreference(next);
    location.reload();
  }

  const baseBtn = "px-2 py-1 rounded-md text-sm";
  const active = "bg-slate-200 dark:bg-slate-800";

  return (
    <div className="flex items-center gap-1">
      <button
        className={`${baseBtn} ${locale === "ru" ? active : ""}`}
        onClick={() => switchTo("ru")}
        aria-pressed={locale === "ru"}
      >
        RU
      </button>
      <button
        className={`${baseBtn} ${locale === "en" ? active : ""}`}
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}


