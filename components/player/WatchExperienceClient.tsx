"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { MovieEmbedPlayer } from "@/components/player/MovieEmbedPlayer";
import { KinoboxPlayer } from "@/components/player/KinoboxPlayer";
import { WatchAvailableFilmsStrip, type WatchStripItem } from "@/components/player/WatchAvailableFilmsStrip";
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
  /** Фильмы с тем же типом доступа к онлайн-просмотру (полоса под плеером). */
  availableFilms?: WatchStripItem[];
  availableFilmsTitle?: string;
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
function computePreferIframeOverKinobox(embedSrc: string | null | undefined): boolean {
  if (process.env.NEXT_PUBLIC_WATCH_USE_IFRAME_EMBED === "true") return true;
  if (process.env.NEXT_PUBLIC_WATCH_USE_KINOBOX_FIRST === "true") return false;
  return Boolean(embedSrc?.trim());
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
  availableFilms = [],
  availableFilmsTitle = "",
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
    computePreferIframeOverKinobox(embedSrc)
  );
  const onKinoboxFallback = useCallback(() => {
    setKinoboxBroken(true);
  }, []);

  useEffect(() => {
    setKinoboxBroken(false);
    setPreferIframeOverKinobox(computePreferIframeOverKinobox(embedSrc));
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
    <div className="w-full bg-black">
      <div className="mx-auto max-w-[1920px]">
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
          <div className="flex aspect-video w-full items-center justify-center rounded-none bg-[#0D1420] px-6 text-center md:rounded-xl">
            <p className="max-w-md text-sm text-white/50">
              Плеер не загрузился, а запасной embed недоступен. Проверьте tmdbId / Kinopoisk id у фильма или настройки плеера.
            </p>
          </div>
        )}

        {!useDirect && embedSrc?.trim() && useKinobox && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-b border-white/10 bg-black/40 px-3 py-2 md:px-4">
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

        {availableFilms.length > 0 && availableFilmsTitle ? (
          <WatchAvailableFilmsStrip title={availableFilmsTitle} items={availableFilms} currentMovieId={movieId} />
        ) : null}

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
