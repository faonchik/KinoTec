"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";

interface Series {
  id: string;
  title: string;
  originalTitle: string | null;
  poster: string | null;
  firstAirDate: Date | null;
  status: string;
  genres: Array<{ genre: { id: string; name: string; slug: string } }>;
  seasons: Array<{ id: string }>;
  ratings: Array<{ value: number }>;
}

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface SeriesListClientProps {
  series: Series[];
  genres: Genre[];
}

export function SeriesListClient({ series, genres }: SeriesListClientProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSeries = series.filter((s) => {
    const matchesGenre = !selectedGenre || s.genres.some((g) => g.genre.id === selectedGenre);
    const matchesSearch = !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const getAvgRating = (ratings: Array<{ value: number }>) => {
    if (!ratings.length) return null;
    return (ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length).toFixed(1);
  };

  const statusLabels: Record<string, string> = {
    RETURNING: "В эфире",
    ENDED: "Завершён",
    CANCELED: "Отменён",
    IN_PRODUCTION: "В производстве",
  };

  const statusColors: Record<string, string> = {
    RETURNING: "bg-green-500",
    ENDED: "bg-white/20 text-white",
    CANCELED: "bg-red-500",
    IN_PRODUCTION: "bg-[#ffb84d] text-black",
  };

  return (
    <div className="min-h-full bg-[#0b0f14]">
      {/* Title Section */}
      <div className="px-4 pb-3 pt-6 sm:px-8 sm:pt-8 lg:px-12">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl">Сериалы</h1>
        </div>
        <div className="inline-block rounded-full border border-white/[0.08] bg-[#121821] px-4 py-2 ring-1 ring-white/[0.06]">
          <p className="text-sm font-medium text-white/80">Найдите свой следующий любимый сериал</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 px-4 sm:px-8 lg:px-12 py-4 sm:py-5">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск сериала..."
            className="h-12 w-full rounded-2xl border border-white/[0.08] bg-[#121821] pl-12 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:ring-1 focus:ring-[#ffb84d]/40 sm:min-w-[200px]"
          />
        </div>

        <div className="relative">
          <select
            value={selectedGenre || ""}
            onChange={(e) => setSelectedGenre(e.target.value || null)}
            className="h-12 w-full rounded-2xl border border-white/[0.08] bg-[#121821] px-4 pr-10 text-sm text-white/65 outline-none transition focus:ring-1 focus:ring-[#ffb84d]/40 sm:h-12 sm:min-w-[200px]"
          >
            <option value="">Все жанры</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Series Grid */}
      <div className="px-4 sm:px-8 lg:px-12 py-6">
        {filteredSeries.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="mb-2 font-display text-2xl font-semibold text-white">Сериалы не найдены</h2>
            <p className="text-sm text-white/35">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSeries.map((s) => (
              <Link key={s.id} href={`/series/${s.id}`} className="group">
                <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-2xl bg-[#121821] ring-1 ring-white/[0.08]">
                  {s.poster ? (() => {
                    const url = getProxiedImageUrl(s.poster);
                    return shouldUseUnoptimized(url) ? (
                      <img src={url!} alt={s.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <Image src={url!} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" />
                    );
                  })() : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#121821] to-[#0b0f14] font-mono text-xs text-white/25">
                      КТ
                    </div>
                  )}

                  {/* Rating */}
                  {getAvgRating(s.ratings) && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <span className="text-xs text-[#ffb84d]">★</span>
                      <span className="text-white font-mono text-[11px] font-bold">{getAvgRating(s.ratings)}</span>
                    </div>
                  )}

                  {/* Bottom badges row */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    {/* Status badge */}
                    <span className={`rounded-lg px-2 py-1 font-mono text-[10px] font-medium text-white ${statusColors[s.status] || "bg-[#ffb84d] text-black"}`}>
                      {statusLabels[s.status] || s.status}
                    </span>

                    {/* Seasons badge */}
                    <span className="font-mono text-[10px] px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white">
                      {s.seasons.length} сез.
                    </span>
                  </div>
                </div>

                <h3 className="line-clamp-2 text-sm font-semibold text-white transition group-hover:text-[#ffb84d]">
                  {s.title}
                </h3>
                {s.firstAirDate && (
                  <p className="font-mono text-[11px] text-white/35">
                    {new Date(s.firstAirDate).getFullYear()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
