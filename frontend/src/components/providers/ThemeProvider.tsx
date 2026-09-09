"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type ThemeMode = "dark" | "light" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "dark",
  isDarkMode: true,
  setThemeMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((mode: ThemeMode) => {
    let isDark = true;
    if (mode === "light") {
      isDark = false;
    } else if (mode === "dark") {
      isDark = true;
    } else {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem("copycoach_theme", mode);
    applyTheme(mode);
  }, [applyTheme]);

  useEffect(() => {
    const init = () => {
      setMounted(true);
      const saved = localStorage.getItem("copycoach_theme") as ThemeMode | null;
      if (saved === "light" || saved === "dark" || saved === "system") {
        setThemeModeState(saved);
        applyTheme(saved);
      } else {
        applyTheme("dark");
      }
    };
    const rafId = requestAnimationFrame(init);
    return () => cancelAnimationFrame(rafId);
  }, [applyTheme]);

  useEffect(() => {
    if (!mounted) return;
    if (themeMode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        }
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [themeMode, mounted]);

  return (
    <ThemeContext.Provider value={{ themeMode, isDarkMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
