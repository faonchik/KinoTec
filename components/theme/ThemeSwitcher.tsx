"use client";

import { useTheme } from "./ThemeProvider";
import { useState } from "react";
import { useTranslations } from "next-intl";

const themes = [
  { id: "dark", icon: "🌙", rarity: null },
  { id: "light", icon: "☀️", rarity: null },
  { id: "theme-midnight", icon: "🌌", rarity: "UNCOMMON" },
  { id: "theme-forest", icon: "🌲", rarity: "UNCOMMON" },
  { id: "theme-amethyst", icon: "💜", rarity: "UNCOMMON" },
  { id: "theme-retro", icon: "🎞️", rarity: "RARE" },
  { id: "theme-noir", icon: "🎩", rarity: "RARE" },
  { id: "theme-cyberpunk", icon: "🤖", rarity: "RARE" },
  { id: "theme-hollywood", icon: "⭐", rarity: "EPIC" },
  { id: "theme-space", icon: "🚀", rarity: "EPIC" },
  { id: "theme-chameleon", icon: "🦎", rarity: "LEGENDARY" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("theme");

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        aria-label={t("switcherAriaLabel")}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-20 max-h-[600px] overflow-y-auto">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">{t("title")}</h3>
            </div>
            <div className="p-2">
              {themes.map((themeItem) => {
                const themeKey = themeItem.id.startsWith("theme-") ? themeItem.id.substring(6) : themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    onClick={() => {
                      setTheme(themeItem.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      theme === themeItem.id
                        ? "bg-amber-500/20 border border-amber-500/50"
                        : "hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-2xl">{themeItem.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{t(`${themeKey}.name`)}</span>
                        {themeItem.rarity && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            themeItem.rarity === "UNCOMMON" ? "bg-green-500/20 text-green-400" :
                            themeItem.rarity === "RARE" ? "bg-blue-500/20 text-blue-400" :
                            themeItem.rarity === "EPIC" ? "bg-purple-500/20 text-purple-400" :
                            "bg-amber-500/20 text-amber-400"
                          }`}>
                            {t(`rarity.${themeItem.rarity}`)}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs">{t(`${themeKey}.desc`)}</p>
                    </div>
                    {theme === themeItem.id && (
                      <span className="text-amber-400">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

