"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "campussphere-theme";

function readPreferredTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {
    // Continue with the system preference when storage is unavailable.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const preferredTheme = readPreferredTheme();
    setTheme(preferredTheme);
    applyTheme(preferredTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The visual preference still applies for this session.
    }
  }

  const nextThemeLabel = theme === "light" ? "dark" : "light";

  return (
    <button
      aria-label={`Switch to ${nextThemeLabel} theme`}
      aria-pressed={theme === "dark"}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white/75 px-3 text-xs font-bold text-[#526963] transition-colors hover:border-[#8bcabd] hover:text-[#0d7f78] dark:bg-[#17211f]/80 dark:text-[#b7cbc4] dark:hover:border-[#386d63] dark:hover:text-[#a3e8d7]"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {theme === "light" ? "☾" : "☀"}
      </span>
      <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
    </button>
  );
}
