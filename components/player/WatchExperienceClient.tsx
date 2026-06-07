"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { MovieEmbedPlayer } from "@/components/player/MovieEmbedPlayer";
import { KinoboxPlayer } from "@/components/player/KinoboxPlayer";
import { isUsableDirectVideoUrlForNativePlayer } from "@/lib/player/directVideoUrl";

type WatchExperienceClientProps = {
  movieId: string;
  title: string;
  videoUrl: string | null;
  embedSrc: string | null;
  /** TMDB / Кинопоиск — для альтернативного плеера Kinobox (по кнопке или при NEXT_PUBLIC_WATCH_USE_KINOBOX_FIRST). */
  playerTmdbId?: string | null;
  playerKinopoiskId?: string | null;
  /** Свой `NEXT_PUBLIC_PLAYER_MOVIE_EMBED_URL` с плейсхолдерами — оставляем iframe. */
  forceIframeEmbed?: boolean;
  releaseYear?: number | null;
  poster?: string | null;
  backdrop?: string | null;
  initialProgress: number;
  isAuthenticated: boolean;
  /** Для оценки прогресса при embed (минуты). */
  runtimeMinutes?: number | null;
};

async function postProgress(movieId: string, progress: number) {
  await fetch(`/api/watch/${movieId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress: Math.min(100, Math.max(0, Math.floor(progress))) }),
  });
}

async function postComplete(movieId: string) {
  await fetch(`/api/watch/${movieId}/complete`, { method: "POST" });
}

/** VidSrc/кастомный iframe стабильнее; Kinobox — опционально (редиректы на YouTube и т.п.). */
function computePreferIframeOverKinobox(): boolean {
  if (process.env.NEXT_PUBLIC_WATCH_USE_IFRAME_EMBED === "true") return true;
  if (process.env.NEXT_PUBLIC_WATCH_USE_KINOBOX_FIRST === "true") return false;
  // By default, prefer Kinobox (false) since vidsrc.to iframe is blocked in Russia
  return false;
}

/**
 * Единый клиент просмотра: прямой файл/HLS → VideoPlayer с реальным прогрессом;
 * иначе внешний embed → эвристический прогресс по времени + явная кнопка «досмотрел».
 */
export function WatchExperienceClient({
  movieId,
  title,
  videoUrl,
  embedSrc,
  playerTmdbId,
  playerKinopoiskId,
  forceIframeEmbed = false,
  releaseYear,
  poster,
  backdrop,
  initialProgress,
  isAuthenticated,
  runtimeMinutes,
}: WatchExperienceClientProps) {
  const useDirect = isUsableDirectVideoUrlForNativePlayer(videoUrl);
  const useKinobox = useMemo(() => {
    if (forceIframeEmbed) return false;
    const kp = playerKinopoiskId?.trim();
    const tmdb = playerTmdbId?.trim();
    return Boolean(kp || tmdb || title?.trim());
  }, [forceIframeEmbed, playerKinopoiskId, playerTmdbId, title]);
  const [kinoboxBroken, setKinoboxBroken] = useState(false);
  /** true = сначала VidSrc iframe; false = сначала Kinobox (если есть id). */
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
  }, [movieId, playerTmdbId, playerKinopoiskId, embedSrc]);

  const [completeBusy, setCompleteBusy] = useState(false);
  const [completeOk, setCompleteOk] = useState(false);

  const handleProgress = useCallback(
    async (progress: number) => {
      if (!isAuthenticated) return;
      try {
        await postProgress(movieId, progress);
      } catch (e) {
        console.error("watch progress:", e);
      }
    },
    [isAuthenticated, movieId]
  );

  const handleComplete = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      await postComplete(movieId);
    } catch (e) {
      console.error("watch complete:", e);
    }
  }, [isAuthenticated, movieId]);

  useEffect(() => {
    if (useDirect || !isAuthenticated || (!embedSrc && !useKinobox)) return;

    const runtimeMs = (runtimeMinutes && runtimeMinutes > 0 ? runtimeMinutes : 100) * 60_000;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, Math.floor((elapsed / runtimeMs) * 100));
      void postProgress(movieId, Math.max(pct, 5));
    };

    void postProgress(movieId, 5);

    const id = window.setInterval(tick, 120_000);
    return () => window.clearInterval(id);
  }, [useDirect, isAuthenticated, embedSrc, useKinobox, movieId, runtimeMinutes]);

  const onMarkWatched = async () => {
    if (!isAuthenticated) return;
    setCompleteBusy(true);
    try {
      await postProgress(movieId, 100);
      await postComplete(movieId);
      setCompleteOk(true);
    } catch {
      setCompleteOk(false);
    } finally {
      setCompleteBusy(false);
    }
  };

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
        {useDirect ? (
          <VideoPlayer
            src={videoUrl!}
            poster={backdrop || poster || undefined}
            title={title}
            initialProgress={initialProgress}
            onProgress={handleProgress}
            onComplete={handleComplete}
          />
        ) : useKinobox && !kinoboxBroken && !preferIframeOverKinobox ? (
          <KinoboxPlayer
            key={`${playerKinopoiskId ?? ""}-${playerTmdbId ?? ""}`}
            kinopoiskId={playerKinopoiskId?.trim() || undefined}
            tmdbId={playerTmdbId?.trim() || undefined}
            title={title}
            year={releaseYear ?? undefined}
            className="w-full rounded-none md:rounded-xl"
            onFallback={onKinoboxFallback}
          />
        ) : embedSrc ? (
          <MovieEmbedPlayer src={embedSrc} title={`Смотреть: ${title}`} className="w-full rounded-none md:rounded-xl" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-none bg-[#141414] px-6 text-center md:rounded-xl">
            <p className="max-w-md text-sm text-white/50">
              Плеер не загрузился, а запасной embed недоступен. Проверьте tmdbId / Kinopoisk id у фильма или настройки плеера.
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
          {!useDirect && embedSrc?.trim() && useKinobox && (
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

        {!useDirect && (Boolean(embedSrc?.trim()) || useKinobox) && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950 px-4 py-3">
            <p className="text-sm text-white/55">
              {isAuthenticated
                ? "Прогресс сохраняется по времени на странице. После просмотра нажмите кнопку справа."
                : "Войдите, чтобы сохранять просмотр и получать рекомендации."}
            </p>
            {isAuthenticated && (
              <button
                type="button"
                disabled={completeBusy || completeOk}
                onClick={() => void onMarkWatched()}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {completeOk ? "Сохранено" : completeBusy ? "…" : "Отметить просмотренным"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
