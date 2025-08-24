"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "theme"; // тот же ключ, что использует ранний скрипт

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Инициализируемся по фактическому состоянию DOM/хранилища
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const theme = stored || system;
      setIsDark(theme === "dark");
    } catch {
      // no-op
    } finally {
      setMounted(true);
    }
  }, []);

  // Применяем тему к <html> и сохраняем
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      localStorage.setItem(STORAGE_KEY, "dark");
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      localStorage.setItem(STORAGE_KEY, "light");
    }
  }, [isDark, mounted]);

  if (!mounted) return null; // показываем кнопку только после монтирования

  return (
    <button
      type="button"
      aria-label="Переключить тему"
      onClick={() => setIsDark((v) => !v)}
      className="inline-flex items-center gap-2 text-sm border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
      title={isDark ? "Светлая тема" : "Тёмная тема"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{isDark ? "Светлая" : "Тёмная"}</span>
    </button>
  );
}
