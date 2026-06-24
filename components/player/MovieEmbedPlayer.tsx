"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { getMovieEmbedSources, getTvEmbedSources, normalizeTmdbId } from "@/lib/player/embedUrl";

type Props = {
  src: string | null;
  title: string;
  className?: string;
  tmdbId?: string | null;
  season?: number;
  episode?: number;
};

/**
 * Обёртка над внешним embed (iframe): свой UI вокруг, без сторонних скриптов на странице.
 * 
 * Поддерживает:
 * - Автоматический и ручной fallback между источниками (vidsrc, videasy, vidking, etc.)
 * - Переключение источников через премиальный drop-up селектор
 * - Синхронизацию акцентного цвета плеера с активной темой сайта (через MutationObserver)
 * - Передачу локали для субтитров в поддерживающие плееры
 */
export function MovieEmbedPlayer({ src, title, className = "", tmdbId, season, episode }: Props) {
  const locale = useLocale();
  const [accentColor, setAccentColor] = useState("e50914"); // Netflix-red по умолчанию
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Синхронизация акцентного цвета с темой сайта
  useEffect(() => {
    const htmlEl = document.documentElement;
    const updateAccent = () => {
      let activeTheme = "theme-dark";
      for (const cls of Array.from(htmlEl.classList)) {
        if (cls.startsWith("theme-")) {
          activeTheme = cls;
          break;
        }
      }
      const themeColorMap: Record<string, string> = {
        "theme-dark": "e50914",
        "theme-light": "f59e0b",
        "theme-midnight": "6366f1",
        "theme-forest": "10b981",
        "theme-amethyst": "a855f7",
        "theme-retro": "fbbf24",
        "theme-noir": "ffffff",
        "theme-cyberpunk": "ff0080",
        "theme-hollywood": "ffb800",
        "theme-space": "818cf8",
        "theme-chameleon": "f59e0b",
      };
      setAccentColor(themeColorMap[activeTheme] || "e50914");
    };

    updateAccent();

    const observer = new MutationObserver(updateAccent);
    observer.observe(htmlEl, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  // Динамическое формирование списка источников с подставленными query-параметрами
  const allSources = useMemo(() => {
    const list: string[] = [];

    // 1. Добавляем основной embed-источник, если он передан
    if (src?.trim()) {
      let adjustedSrc = src.trim();
      try {
        const urlObj = new URL(adjustedSrc);
        if (urlObj.hostname.includes("videasy.to") || urlObj.hostname.includes("vidking.net")) {
          if (!urlObj.searchParams.has("color") && accentColor) {
            urlObj.searchParams.set("color", accentColor);
          }
        }
        if (urlObj.hostname.includes("vsembed.su")) {
          if (!urlObj.searchParams.has("ds_lang") && locale) {
            urlObj.searchParams.set("ds_lang", locale);
          }
        }
        adjustedSrc = urlObj.toString();
      } catch {
        // Если ссылка некорректная, используем как есть
      }
      list.push(adjustedSrc);
    }

    // 2. Добавляем стандартные fallback-источники по tmdbId
    if (tmdbId) {
      const tmdb = normalizeTmdbId(tmdbId);
      if (tmdb) {
        const standards = season !== undefined && episode !== undefined
          ? getTvEmbedSources(tmdb, season, episode, { color: accentColor, lang: locale })
          : getMovieEmbedSources(tmdb, { color: accentColor, lang: locale });

        for (const s of standards) {
          // Исключаем дубликаты по домену и пути
          const exists = list.some((item) => {
            try {
              const urlA = new URL(item);
              const urlB = new URL(s);
              return urlA.hostname === urlB.hostname && urlA.pathname === urlB.pathname;
            } catch {
              return item === s;
            }
          });
          if (!exists) {
            list.push(s);
          }
        }
      }
    }

    return list;
  }, [src, tmdbId, season, episode, accentColor, locale]);

  const currentSrc = allSources[currentIndex] ?? null;

  // Сброс состояния при изменении контента
  useEffect(() => {
    setCurrentIndex(0);
    setLoaded(false);
    setFailed(false);
    setShowSourceMenu(false);
  }, [src, tmdbId, season, episode]);

  const onLoad = useCallback(() => {
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
    setLoaded(true);
    setFailed(false);
  }, []);

  const tryNextSource = useCallback(() => {
    if (currentIndex < allSources.length - 1) {
      setCurrentIndex((i) => i + 1);
      setLoaded(false);
      setFailed(false);
    } else {
      setFailed(true);
    }
  }, [currentIndex, allSources.length]);

  const onError = useCallback(() => {
    tryNextSource();
  }, [tryNextSource]);

  // fallback по таймауту 12 секунд
  useEffect(() => {
    if (loaded || failed || !currentSrc) return;

    loadTimerRef.current = setTimeout(() => {
      if (!loaded) {
        tryNextSource();
      }
    }, 12_000);

    return () => {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
        loadTimerRef.current = null;
      }
    };
  }, [currentSrc, currentIndex, loaded, failed, tryNextSource]);

  /** Вычислить красивое название источника из URL. */
  function sourceLabel(url: string): string {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      if (host.includes("vidsrc.in")) return "VidSrc.in";
      if (host.includes("videasy.to")) return "Videasy";
      if (host.includes("vsembed.su")) return "VidSrc (su)";
      if (host.includes("vidking.net")) return "Vidking";
      if (host.includes("multiembed.mov")) return "Multiembed";
      if (host.includes("vsembed.ru")) return "vsembed.ru";
      return host;
    } catch {
      return url.slice(0, 30);
    }
  }

  if (!allSources.length) {
    return (
      <div
        className={`flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-[#0D1420] px-6 text-center ${className}`}
      >
        <p className="mb-2 text-3xl opacity-80" aria-hidden>
          🎬
        </p>
        <p className="max-w-md font-mono text-[13px] text-white/55">
          Нет источников для отображения. Проверьте настройки плеера.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black ${className}`}>
      {!loaded && !failed && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#0D1420]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
            <p className="font-mono text-[13px] text-white/45">
              Загрузка плеера{currentIndex > 0 ? ` (источник ${currentIndex + 1}/${allSources.length})` : ""}…
            </p>
          </div>
        </div>
      )}
      
      {failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0D1420] px-4 text-center">
          <p className="mb-2 text-white/80">Не удалось загрузить плеер</p>
          <p className="font-mono text-xs text-white/45 mb-4">Все источники embed недоступны</p>
        </div>
      )}

      {currentSrc && (
        <iframe
          key={currentSrc}
          title={title}
          src={currentSrc}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="origin"
          onLoad={onLoad}
          onError={onError}
        />
      )}

      {/* Premium Drop-Up Source Selector */}
      {loaded && allSources.length > 1 && (
        <div className="absolute bottom-3 right-3 z-20">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSourceMenu(!showSourceMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-black/85 hover:bg-black text-white/95 hover:text-white border border-white/10 hover:border-amber-500/50 transition-all backdrop-blur-md shadow-lg font-mono"
            >
              <span>💿 {sourceLabel(currentSrc || "")}</span>
              <svg className={`w-3 h-3 transition-transform duration-200 ${showSourceMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            
            {showSourceMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSourceMenu(false)} />
                <div className="absolute bottom-full right-0 mb-2 z-20 w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[9px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5 font-mono">
                      Источники плеера
                    </div>
                    {allSources.map((s, i) => {
                      const isSelected = i === currentIndex;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setCurrentIndex(i);
                            setShowSourceMenu(false);
                            setLoaded(false);
                            setFailed(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-mono transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-amber-500/15 text-amber-400 font-semibold"
                              : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                          }`}
                        >
                          <span>{sourceLabel(s)}</span>
                          {isSelected && <span className="text-amber-400 text-[10px]">●</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
