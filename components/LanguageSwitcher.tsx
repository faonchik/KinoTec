"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tCommon = useTranslations("common");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocaleChange = async (locale: Locale) => {
    // Сохраняем позицию скролла
    const scrollPosition = window.scrollY || window.pageYOffset;
    sessionStorage.setItem('scrollPosition', scrollPosition.toString());
    
    // Устанавливаем cookie с выбранным языком (next-intl использует NEXT_LOCALE)
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
    // Также устанавливаем старый формат для совместимости
    document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
    setIsOpen(false);
    // Принудительно обновляем страницу для применения нового языка
    window.location.reload();
  };
  
  // Восстанавливаем позицию скролла после загрузки
  useEffect(() => {
    const restoreScroll = () => {
      const savedScrollPosition = sessionStorage.getItem('scrollPosition');
      if (savedScrollPosition) {
        // Используем requestAnimationFrame для восстановления после рендера
        requestAnimationFrame(() => {
          window.scrollTo({
            top: parseInt(savedScrollPosition, 10),
            behavior: 'instant' as ScrollBehavior
          });
          sessionStorage.removeItem('scrollPosition');
        });
      }
    };
    
    // Пробуем восстановить сразу и после небольшой задержки
    restoreScroll();
    const timeout = setTimeout(restoreScroll, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors"
        aria-label={tCommon("selectLanguage")}
      >
        <span className="text-lg leading-none">{localeFlags[currentLocale]}</span>
        <span className="text-sm text-slate-300 hidden sm:inline leading-none">
          {localeNames[currentLocale]}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 min-w-[150px]">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-700/50 transition-colors ${
                locale === currentLocale ? "bg-slate-700/30" : ""
              }`}
            >
              <span className="text-lg leading-none flex-shrink-0">{localeFlags[locale]}</span>
              <span className="text-sm text-slate-200 leading-none">{localeNames[locale]}</span>
              {locale === currentLocale && (
                <svg className="w-4 h-4 text-amber-400 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

