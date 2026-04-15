"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof document === "undefined") return;
    
    const root = document.documentElement;
    
    // Удаляем все классы тем
    root.classList.remove("theme-dark", "theme-light", "theme-midnight", "theme-forest", "theme-amethyst", "theme-retro", "theme-noir", "theme-cyberpunk", "theme-hollywood", "theme-space", "theme-chameleon");
    
    // Добавляем новый класс
    if (newTheme.startsWith("theme-")) {
      root.classList.add(newTheme);
    } else {
      root.classList.add(`theme-${newTheme}`);
    }

    // Сохраняем в localStorage
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      // Игнорируем ошибки localStorage
    }
  }, []);

  // Загружаем тему из БД или localStorage
  useEffect(() => {
    const loadTheme = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/user/theme");
          if (res.ok) {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await res.json();
              if (data.theme) {
                setThemeState(data.theme);
                applyTheme(data.theme);
                return;
              }
            }
          }
        } catch {
          // Игнорируем ошибки
        }
      }

      // Fallback на localStorage
      const saved = localStorage.getItem("theme") || "dark";
      setThemeState(saved);
      applyTheme(saved);
    };

    loadTheme();
    setMounted(true);
  }, [session?.user?.id, applyTheme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    // Сохраняем в БД если авторизован
    if (session?.user?.id) {
      try {
        await fetch("/api/user/theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newTheme }),
        });
      } catch {
        // Игнорируем ошибки
      }
    }
  }, [session?.user?.id, applyTheme]);

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

