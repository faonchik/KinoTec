"use client";

import { useMemo, useState, useEffect, useRef } from "react";

interface KinoboxPlayerProps {
  // Можно искать по разным параметрам
  kinopoiskId?: string | number;
  imdbId?: string;
  tmdbId?: string | number;
  title?: string;
  year?: number;
  className?: string;
  autoSearch?: boolean;
}

export function KinoboxPlayer({
  kinopoiskId,
  imdbId,
  tmdbId,
  title,
  year,
  className = "",
  autoSearch = false,
}: KinoboxPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Формируем URL для iframe с параметрами поиска
  const iframeUrl = useMemo(() => {
    const baseUrl = "https://kinobox.in/";
    const params = new URLSearchParams();

    // Приоритет поиска: kinopoisk > imdb > tmdb > title
    if (kinopoiskId) {
      params.set("kinopoisk", String(kinopoiskId));
    } else if (imdbId) {
      params.set("imdb", imdbId);
    } else if (tmdbId) {
      params.set("tmdb", String(tmdbId));
    } else if (title) {
      // Для поиска по названию используем параметр search
      // Kinobox автоматически заполнит поле поиска
      // Формируем точный запрос: "название (год)" для лучшего поиска
      const searchQuery = year ? `${title} (${year})` : title;
      params.set("search", searchQuery);
    }

    // Если есть параметры, добавляем их к URL
    if (params.toString()) {
      return `${baseUrl}?${params.toString()}`;
    }

    return baseUrl;
  }, [kinopoiskId, imdbId, tmdbId, title, year]);

  // Попытка автоматически запустить поиск после загрузки iframe
  useEffect(() => {
    if (!title || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const handleLoad = () => {
      // Kinobox должен автоматически обработать параметр search в URL
      // Но если это не работает, попробуем отправить сообщение через postMessage
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
          // Ждём немного, чтобы страница полностью загрузилась
          setTimeout(() => {
            try {
              const searchQuery = year ? `${title} ${year}` : title;
              // Пытаемся отправить сообщение в iframe (если поддерживается postMessage)
              iframeWindow.postMessage(
                { 
                  type: "kinobox-search", 
                  query: searchQuery,
                  action: "search"
                },
                "https://kinobox.in"
              );
            } catch (e) {
              // Игнорируем ошибки CORS
            }
          }, 3000);
        }
      } catch (e) {
        // Игнорируем ошибки доступа к iframe
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => {
      iframe.removeEventListener("load", handleLoad);
    };
  }, [title, year]);

  // Проверяем, что есть хотя бы один параметр для поиска
  if (!kinopoiskId && !imdbId && !tmdbId && !title) {
    return (
      <div className={`bg-slate-800 rounded-xl flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-slate-400">Не указаны параметры для поиска фильма</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Загрузка плеера...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-slate-800 rounded-xl flex items-center justify-center z-10">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">😔</div>
            <p className="text-slate-400">Не удалось загрузить плеер</p>
            <p className="text-slate-500 text-sm mt-2">
              Попробуйте обновить страницу или выбрать другой фильм
            </p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="kinobox_iframe w-full aspect-video rounded-xl border-0 bg-black"
        allowFullScreen
        src={iframeUrl}
        title="Kinobox Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ minHeight: "500px" }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}

