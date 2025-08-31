"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { 
    setMounted(true); 
  }, []);

  // Read current theme from DOM classes to avoid hydration mismatch
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      const hasDarkClass = root.classList.contains('dark');
      setIsDark(hasDarkClass);
    }
  }, [mounted, theme]);

  const handleToggle = () => {
    if (mounted) {
      const newTheme = isDark ? "light" : "dark";
      setTheme(newTheme);
      
      // Immediately update local state and DOM
      setIsDark(!isDark);
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    }
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={handleToggle}
      className="inline-flex items-center gap-2 text-sm border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
      title={isDark ? "Light theme" : "Dark theme"}
      style={{ visibility: mounted ? "visible" : "hidden" }}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
