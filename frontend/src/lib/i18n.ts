"use client";

export type Locale = "en";

import en from "@/locales/en.json";

const messages: Record<Locale, Record<string, string>> = { en } as const;

const currentLocale: Locale = "en";

export function t(key: string): string {
  return (messages[currentLocale] && messages[currentLocale][key]) || key;
}

export function setLocalePreference() {
  // No-op since we only support English
}

export function getLocalePreference(): Locale {
  return currentLocale;
}

export function changeLocale() {
  // No-op since we only support English
}


