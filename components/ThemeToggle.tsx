"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const ls = localStorage.getItem("theme");
      const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(ls ? ls === "dark" : prefers);
    } catch {
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    if (isDark === null) return;
    document.documentElement.classList.toggle("dark", isDark);
    try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  if (isDark === null) return null;

  return (
    <button
      onClick={() => setIsDark(v => !v)}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm
                 bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800
                 shadow-sm hover:shadow-md transition-all duration-200"
      title="Téma váltása"
      aria-label="Téma váltása"
    >
      <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600
                       transition-all"
            style={{ background: isDark ? "currentColor" : "transparent" }}/>
      {isDark ? "Sötét mód" : "Világos mód"}
    </button>
  );
}