"use client";

import { useEffect, useRef, useState } from "react";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

interface KinoboxPlayerProps {
  kinopoiskId?: string | number;
  imdbId?: string;
  tmdbId?: string | number;
  title?: string;
  year?: number;
  className?: string;
  /** Если Kinobox не вернул источников — переключиться на запасной embed. */
  onFallback?: () => void;
}

interface VideoSource {
  type: string;
  iframeUrl: string;
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
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onFallbackRef = useRef(onFallback);
  onFallbackRef.current = onFallback;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setSources([]);
    setSelectedSource(null);

    const searchParams = new URLSearchParams();
    if (kinopoiskId != null && String(kinopoiskId).trim()) {
      searchParams.set("kinopoisk", String(kinopoiskId).trim());
    }
    if (tmdbId != null && String(tmdbId).trim()) {
      searchParams.set("tmdb", String(tmdbId).trim());
    }
    if (imdbId != null && String(imdbId).trim()) {
      searchParams.set("imdb", String(imdbId).trim());
    }
    if ([...searchParams.keys()].length === 0 && title?.trim()) {
      searchParams.set("title", year ? `${title.trim()} ${year}` : title.trim());
    }

    if ([...searchParams.keys()].length === 0) {
      setIsLoading(false);
      onFallbackRef.current?.();
      return;
    }

    const fetchSources = async () => {
      try {
        const url = `/api/player/sources?${searchParams.toString()}`;
        const res = await fetch(url, { method: "GET" });

        if (!res.ok) {
          throw new Error("Источники не найдены");
        }

        const json = await res.json();
        if (cancelled) return;

        if (json && Array.isArray(json.data) && json.data.length > 0) {
          const validSources: VideoSource[] = json.data
            .filter((s: any) => s && s.type && s.iframeUrl)
            .map((s: any) => ({
              type: s.type,
              iframeUrl: s.iframeUrl,
            }));

          if (validSources.length > 0) {
            setSources(validSources);
            
            // Восстанавливаем сохраненный плеер, если есть
            const preferred = localStorage.getItem("kinobox-preferred-source");
            const preferredSource = validSources.find((s) => s.type === preferred);
            setSelectedSource(preferredSource || validSources[0]);
            setIsLoading(false);
            return;
          }
        }

        throw new Error("Источники пусты");
      } catch (err: any) {
        console.error("Kinobox fetch error:", err);
        if (!cancelled) {
          setIsLoading(false);
          setError("Источники видео недоступны");
          onFallbackRef.current?.();
        }
      }
    };

    fetchSources();

    return () => {
      cancelled = true;
    };
  }, [kinopoiskId, imdbId, tmdbId, title, year]);

  const selectSource = (source: VideoSource) => {
    setSelectedSource(source);
    localStorage.setItem("kinobox-preferred-source", source.type);
  };

  if (isLoading) {
    return (
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-[#0D1420] ${className}`}>
        <LoadingOverlay />
      </div>
    );
  }

  if (error || !selectedSource) {
    return (
      <div className={`bg-[#0D1420] rounded-xl flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-white/45 font-mono text-[13px]">{error || "Плеер не найден"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-3">
      {/* Плеер */}
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-[#0a0a0f] border border-white/5 ${className}`}>
        <iframe
          src={selectedSource.iframeUrl}
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          title={title ?? "Kinobox Player"}
        />
      </div>

      {/* Выбор источников в стиле KinoTec */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
        <span className="text-[11px] text-white/40 font-mono px-2">Источник:</span>
        {sources.map((s) => (
          <button
            key={s.type}
            type="button"
            onClick={() => selectSource(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedSource.type === s.type
                ? "bg-[#ffb84d] text-black font-semibold shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            {s.type}
          </button>
        ))}
      </div>
    </div>
  );
}
