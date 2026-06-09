"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MovieEmbedPlayer } from "@/components/player/MovieEmbedPlayer";
import { TapeOperatorPlayer } from "@/components/player/TapeOperatorPlayer";

type SeriesWatchExperienceClientProps = {
  seriesId: string;
  title: string;
  embedSrc: string | null;
  season: number;
  episode: number;
  isAuthenticated: boolean;
  playerTmdbId?: string | null;
  playerKinopoiskId?: string | null;
  releaseYear?: number | null;

  poster?: string | null;
  backdrop?: string | null;
};

async function postSeriesProgress(seriesId: string, season: number, episode: number) {
  await fetch(`/api/watch/series/${seriesId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ season, episode }),
  });
}

function computePreferIframeOverKinobox(): boolean {
  if (process.env.NEXT_PUBLIC_WATCH_USE_IFRAME_EMBED === "true") return true;
  if (process.env.NEXT_PUBLIC_WATCH_USE_KINOBOX_FIRST === "true") return false;
  return false;
}

export function SeriesWatchExperienceClient({
  seriesId,
  title,
  embedSrc,
  season,
  episode,
  isAuthenticated,
  playerTmdbId,
  playerKinopoiskId,
  releaseYear,
  poster,
  backdrop,
}: SeriesWatchExperienceClientProps) {
  const useKinobox = useMemo(() => {
    const kp = playerKinopoiskId?.trim();
    const tmdb = playerTmdbId?.trim();
    return Boolean(kp || tmdb || title?.trim());
  }, [playerKinopoiskId, playerTmdbId, title]);

  const [kinoboxBroken, setKinoboxBroken] = useState(false);
  const [preferIframeOverKinobox, setPreferIframeOverKinobox] = useState(() =>
    computePreferIframeOverKinobox()
  );

  const onKinoboxFallback = useCallback(() => {
    setKinoboxBroken(true);
  }, []);

  const [bgTheme, setBgTheme] = useState<"cinematic" | "space" | "retro" | "black">("cinematic");

  useEffect(() => {
    const saved = localStorage.getItem("watch-bg-theme");
    if (saved === "space" || saved === "retro" || saved === "black" || saved === "cinematic") {
      setBgTheme(saved);
    }
  }, []);

  const changeBgTheme = (theme: "cinematic" | "space" | "retro" | "black") => {
    setBgTheme(theme);
    localStorage.setItem("watch-bg-theme", theme);
  };

  useEffect(() => {
    setKinoboxBroken(false);
    setPreferIframeOverKinobox(computePreferIframeOverKinobox());
  }, [seriesId, playerTmdbId, playerKinopoiskId, embedSrc]);

  useEffect(() => {
    if (!isAuthenticated || !embedSrc) return;

    const save = () => {
      void postSeriesProgress(seriesId, season, episode).catch(() => {});
    };

    save();
    const id = window.setInterval(save, 180_000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, embedSrc, seriesId, season, episode]);

  void poster;

  return (
    <div className="w-full relative overflow-hidden bg-black transition-colors duration-500">
      {/* Background backdrops */}
      {bgTheme === "cinematic" && backdrop && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center filter blur-3xl opacity-20 scale-105 pointer-events-none transition-all duration-700"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      )}
      {bgTheme === "space" && (
        <div
          className="absolute inset-0 z-0 opacity-25 pointer-events-none transition-all duration-700"
          style={{
            background: "radial-gradient(circle at 30% 20%, #1e1b4b 0%, transparent 60%), radial-gradient(circle at 80% 70%, #311042 0%, transparent 50%), #0a0a0f",
          }}
        />
      )}
      {bgTheme === "retro" && (
        <div
          className="absolute inset-0 z-0 opacity-15 pointer-events-none transition-all duration-700"
          style={{
            background: "linear-gradient(135deg, #2d1010 0%, #0d0606 100%)",
          }}
        />
      )}

      <div className="mx-auto max-w-[1920px] relative z-10">
        {useKinobox && !kinoboxBroken && !preferIframeOverKinobox ? (
          <TapeOperatorPlayer
            key={`${playerKinopoiskId ?? ""}-${playerTmdbId ?? ""}`}
            kinopoiskId={playerKinopoiskId?.trim() || undefined}
            tmdbId={playerTmdbId?.trim() || undefined}
            title={title}

            className="w-full rounded-none md:rounded-xl"
            onFallback={onKinoboxFallback}
          />
        ) : embedSrc ? (
          <MovieEmbedPlayer src={embedSrc} title={`Смотреть: ${title}`} className="w-full rounded-none md:rounded-xl" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-none bg-[#141414] px-6 text-center md:rounded-xl">
            <p className="max-w-md text-sm text-white/50">
              Плеер не загрузился, а запасной embed недоступен. Проверьте tmdbId / Kinopoisk id у сериала или настройки плеера.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/45 px-3 py-2.5 md:px-4">
          {/* Left: Background selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-mono">Фон:</span>
            <div className="flex rounded-lg bg-white/[0.05] p-0.5 border border-white/10">
              {(
                [
                  { key: "cinematic", label: "🎬 Амбиент" },
                  { key: "space", label: "🌌 Космос" },
                  { key: "retro", label: "🎞️ Ретро" },
                  { key: "black", label: "🌑 Темнота" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => changeBgTheme(t.key)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                    bgTheme === t.key
                      ? "bg-[#ffb84d] text-black font-semibold shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Embed switcher */}
          {embedSrc?.trim() && useKinobox && (
            <div>
              {preferIframeOverKinobox || kinoboxBroken ? (
                <button
                  type="button"
                  onClick={() => {
                    setPreferIframeOverKinobox(false);
                    setKinoboxBroken(false);
                  }}
                  className="text-xs text-amber-400/90 underline-offset-2 hover:text-amber-300 hover:underline"
                >
                  Снова открыть Kinobox
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPreferIframeOverKinobox(true)}
                  className="text-xs text-white/60 underline-offset-2 hover:text-white/90 hover:underline"
                >
                  Показать встроенный плеер (VidSrc / iframe)
                </button>
              )}
            </div>
          )}
        </div>

        {embedSrc && (
          <div className="border-t border-white/10 bg-slate-950 px-4 py-3 text-sm text-white/55">
            {isAuthenticated
              ? `Сохранена позиция: сезон ${season}, серия ${episode}.`
              : "Войдите, чтобы сохранять позицию в сериале."}
          </div>
        )}
      </div>
    </div>
  );
}
