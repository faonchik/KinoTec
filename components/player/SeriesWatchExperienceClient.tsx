"use client";

import { useEffect } from "react";
import { MovieEmbedPlayer } from "@/components/player/MovieEmbedPlayer";

type SeriesWatchExperienceClientProps = {
  seriesId: string;
  title: string;
  embedSrc: string | null;
  season: number;
  episode: number;
  isAuthenticated: boolean;
};

async function postSeriesProgress(seriesId: string, season: number, episode: number) {
  await fetch(`/api/watch/series/${seriesId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ season, episode }),
  });
}

export function SeriesWatchExperienceClient({
  seriesId,
  title,
  embedSrc,
  season,
  episode,
  isAuthenticated,
}: SeriesWatchExperienceClientProps) {
  useEffect(() => {
    if (!isAuthenticated || !embedSrc) return;

    const save = () => {
      void postSeriesProgress(seriesId, season, episode).catch(() => {});
    };

    save();
    const id = window.setInterval(save, 180_000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, embedSrc, seriesId, season, episode]);

  return (
    <div className="w-full bg-black">
      <div className="mx-auto max-w-[1920px]">
        <MovieEmbedPlayer src={embedSrc} title={`Смотреть: ${title}`} className="w-full rounded-none md:rounded-xl" />
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
