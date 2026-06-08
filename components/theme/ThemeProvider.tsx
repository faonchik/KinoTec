"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

type Theme = "dark" | "light" | string;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback(() => {
    if (typeof document === "undefined") return;
    
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light", "theme-midnight", "theme-forest", "theme-amethyst", "theme-retro", "theme-noir", "theme-cyberpunk", "theme-hollywood", "theme-space", "theme-chameleon");
    root.classList.add("theme-dark");
  }, []);

  // Загружаем тему из БД или localStorage
  useEffect(() => {
    setThemeState("dark");
    applyTheme();
    setMounted(true);
  }, [applyTheme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState("dark");
    applyTheme();
    void newTheme;
  }, [applyTheme]);

  const contextValue = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

