"use client";

import { createContext, useContext, ReactNode } from "react";
import en from "@/locales/en.json";

type Messages = typeof en;
type Locale = "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  t: (key: keyof Messages) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = { en };

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale: Locale = "en";

  const setLocale = (newLocale: Locale) => {
    // No-op since we only support English
  };

  const t = (key: keyof Messages) => messages[locale][key] || key;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
