"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FavoriteButton } from "@/components/movies/FavoriteButton";
import { WatchlistButton } from "@/components/movies/WatchlistButton";
import { RatingButton } from "@/components/movies/RatingButton";

interface MovieActionsProps {
  movieId: string;
  trailer?: string | null;
}

export function MovieActions({ movieId, trailer }: MovieActionsProps) {
  const t = useTranslations("movies.details");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Кнопка просмотра */}
      <Link
        href={`/watch/${movieId}`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-500/25"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        {t("watch")}
      </Link>

      {/* Трейлер */}
      {trailer && (
        <a
          href={trailer}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {t("trailer")}
        </a>
      )}

      {/* Разделитель */}
      <div className="w-px h-8 bg-slate-700 mx-1" />

      {/* Избранное */}
      <FavoriteButton movieId={movieId} size="lg" />

      {/* Смотреть позже */}
      <WatchlistButton movieId={movieId} size="lg" />

      {/* Оценка */}
      <RatingButton movieId={movieId} />
    </div>
  );
}

