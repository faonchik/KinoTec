"use client";

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";

/** Сторонний kinobox.min.js часто вставляет оверлеи/ссылки на YouTube; клик по «чёрному» уводил с сайта. */
function isYoutubeNavigationHref(href: string): boolean {
  try {
    const u = new URL(href, "https://kinobox.tv");
    const h = u.hostname.toLowerCase();
    return h === "youtube.com" || h === "www.youtube.com" || h === "m.youtube.com" || h === "youtu.be";
  } catch {
    return /youtube\.com|youtu\.be/i.test(href);
  }
}

type KinoboxGlobal = {
  Kinobox?: new (selector: string, options: { search: Record<string, string> }) => { init: () => void };
};

interface KinoboxPlayerProps {
  kinopoiskId?: string | number;
  imdbId?: string;
  tmdbId?: string | number;
  title?: string;
  year?: number;
  className?: string;
  /** Если Kinobox не вставил iframe/видео за несколько секунд — переключиться на запасной embed. */
  onFallback?: () => void;
}

export function KinoboxPlayer({
  kinopoiskId,
  imdbId,
  tmdbId,
  title,
  year,
  className = "",
  onFallback,
}: KinoboxPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  /** Уникальный id для селектора — документация: `new Kinobox('.kinobox_player', { search }).init()` */
  const rootIdRef = useRef(`kinobox-root-${Math.random().toString(36).slice(2, 12)}`);
  const [isLoading, setIsLoading] = useState(true);
  const onFallbackRef = useRef(onFallback);
  onFallbackRef.current = onFallback;

  const searchQuery = !kinopoiskId && !tmdbId && !imdbId && title
    ? (year ? `${title} ${year}` : title)
    : undefined;

  const blockYoutubeLinkTakeover = useCallback((e: SyntheticEvent) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const a = t.closest("a[href]");
    if (!(a instanceof HTMLAnchorElement)) return;
    if (!isYoutubeNavigationHref(a.href)) return;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const container = el;
    const rootId = rootIdRef.current;
    let cancelled = false;
    container.innerHTML = "";

    const scriptId = `kinobox-script-${rootId}`;
    const existingSame = document.getElementById(scriptId);
    if (existingSame) existingSame.remove();
    const existingLegacy = document.getElementById("kinobox-script");
    if (existingLegacy) existingLegacy.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://kinobox.tv/kinobox.min.js";
    script.async = true;

    const hideLoader = () => {
      if (!cancelled) setIsLoading(false);
    };

    let probeId: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const runKinoboxInit = () => {
      if (cancelled) return;
      const KinoboxCtor = (window as unknown as KinoboxGlobal).Kinobox;
      if (typeof KinoboxCtor !== "function") {
        onFallbackRef.current?.();
        return;
      }

      const search: Record<string, string> = {};
      if (kinopoiskId != null && String(kinopoiskId).trim()) {
        search.kinopoisk = String(kinopoiskId).trim();
      }
      if (tmdbId != null && String(tmdbId).trim()) {
        search.tmdb = String(tmdbId).trim();
      }
      if (imdbId != null && String(imdbId).trim()) {
        search.imdb = String(imdbId).trim();
      }
      if (Object.keys(search).length === 0 && searchQuery?.trim()) {
        search.title = searchQuery.trim();
      }
      if (Object.keys(search).length === 0) {
        onFallbackRef.current?.();
        return;
      }

      try {
        new KinoboxCtor(`#${rootId}`, { search }).init();
      } catch {
        onFallbackRef.current?.();
        return;
      }

      const probeMs = 12_000;
      probeId = window.setTimeout(() => {
        if (cancelled) return;
        const hasEmbed = Boolean(container.querySelector("iframe, video, object, embed"));
        if (!hasEmbed) onFallbackRef.current?.();
      }, probeMs);
    };

    script.onload = () => {
      hideLoader();
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          if (cancelled) return;
          if (!document.getElementById(rootId)) {
            onFallbackRef.current?.();
            return;
          }
          runKinoboxInit();
        }, 50);
      });
    };
    script.onerror = () => {
      hideLoader();
      if (!cancelled) onFallbackRef.current?.();
    };

    const fallback = window.setTimeout(hideLoader, 14_000);

    document.head.appendChild(script);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      if (probeId !== undefined) window.clearTimeout(probeId);
      script.remove();
      container.innerHTML = "";
    };
  }, [kinopoiskId, imdbId, tmdbId, title, year]);

  if (!kinopoiskId && !imdbId && !tmdbId && !title) {
    return (
      <div className={`bg-[#0D1420] rounded-xl flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-white/45 font-mono text-[13px]">Не указаны параметры для поиска</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full aspect-video ${className}`}
      onClickCapture={blockYoutubeLinkTakeover}
      onAuxClickCapture={(e) => {
        if (e.button === 1) blockYoutubeLinkTakeover(e);
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-[#0D1420] flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#ffb84d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-[13px] text-white/45">Загрузка плеера...</p>
          </div>
        </div>
      )}
      <div
        id={rootIdRef.current}
        ref={containerRef}
        className="kinobox_player w-full h-full"
      />
    </div>
  );
}
