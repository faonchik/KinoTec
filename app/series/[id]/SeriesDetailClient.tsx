"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/Badge";
import { SeriesComments } from "@/components/comments/SeriesComments";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";

interface Actor {
  id: string;
  name: string;
  photo: string | null;
}

interface Episode {
  id: string;
  episodeNumber: number;
  name: string;
  overview: string | null;
  stillPath: string | null;
  airDate: Date | null;
  runtime: number | null;
}

interface Season {
  id: string;
  seasonNumber: number;
  name: string | null;
  overview: string | null;
  poster: string | null;
  airDate: Date | null;
  episodes: Episode[];
}

interface Review {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; avatar: string | null };
}

interface Series {
  id: string;
  title: string;
  originalTitle: string | null;
  description: string | null;
  poster: string | null;
  backdrop: string | null;
  trailer: string | null;
  firstAirDate: Date | null;
  lastAirDate: Date | null;
  status: string;
  episodeRuntime: number | null;
  country: string | null;
  genres: Array<{ genre: { id: string; name: string; slug: string } }>;
  actors: Array<{ character: string | null; actor: Actor }>;
  seasons: Season[];
  ratings: Array<{ value: number; userId: string }>;
  reviews: Review[];
}

interface Similar {
  id: string;
  title: string;
  poster: string | null;
  ratings: Array<{ value: number }>;
}

interface SeriesDetailClientProps {
  series: Series;
  similar: Similar[];
}

export function SeriesDetailClient({ series, similar }: SeriesDetailClientProps) {
  const { data: session } = useSession();
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(
    series.ratings.find((r) => r.userId === session?.user?.id)?.value || null
  );

  const avgRating = series.ratings.length
    ? (series.ratings.reduce((acc, r) => acc + r.value, 0) / series.ratings.length).toFixed(1)
    : null;

  const totalEpisodes = series.seasons.reduce((acc, s) => acc + s.episodes.length, 0);

  const statusLabels: Record<string, { label: string; color: string }> = {
    RETURNING: { label: "В эфире", color: "bg-green-500" },
    ENDED: { label: "Завершён", color: "bg-slate-500" },
    CANCELED: { label: "Отменён", color: "bg-red-500" },
    IN_PRODUCTION: { label: "В производстве", color: "bg-amber-500" },
  };

  const handleRate = async (value: number) => {
    if (!session) return;
    
    try {
      await fetch(`/api/series/${series.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      setUserRating(value);
    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  const currentSeason = series.seasons[selectedSeason];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden bg-slate-950">
        <HeroBackdrop backdrop={series.backdrop} poster={series.poster} />
      </div>

      <div className="container mx-auto px-4 -mt-48 relative z-10">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Постер */}
          <div>
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              {series.poster ? (
                <Image
                  src={series.poster}
                  alt={series.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-6xl">
                  📺
                </div>
              )}
            </div>

            {/* Рейтинг */}
            <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400">Рейтинг</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl text-amber-400">★</span>
                  <span className="text-2xl text-white font-bold">{avgRating || "—"}</span>
                  <span className="text-slate-500">/ 10</span>
                </div>
              </div>

              {/* Оценить */}
              {session && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Ваша оценка:</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRate(value)}
                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                          userRating === value
                            ? "bg-amber-500 text-white"
                            : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Информация */}
          <div>
            <div className="flex items-start gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm text-white ${statusLabels[series.status]?.color || "bg-slate-500"}`}>
                {statusLabels[series.status]?.label || series.status}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">{series.title}</h1>
            {series.originalTitle && series.originalTitle !== series.title && (
              <p className="text-xl text-slate-400 mb-4">{series.originalTitle}</p>
            )}

            {/* Мета-информация */}
            <div className="flex flex-wrap gap-4 text-slate-400 mb-6">
              {series.firstAirDate && (
                <span>{new Date(series.firstAirDate).getFullYear()}</span>
              )}
              {series.lastAirDate && series.status === "ENDED" && (
                <span>— {new Date(series.lastAirDate).getFullYear()}</span>
              )}
              <span>{series.seasons.length} сезонов</span>
              <span>{totalEpisodes} эпизодов</span>
              {series.episodeRuntime && <span>~{series.episodeRuntime} мин/эпизод</span>}
              {series.country && <span>{series.country}</span>}
            </div>

            {/* Жанры */}
            <div className="flex flex-wrap gap-2 mb-6">
              {series.genres.map((g) => (
                <Badge key={g.genre.id} variant="primary">
                  {g.genre.name}
                </Badge>
              ))}
            </div>

            {/* Описание */}
            {series.description && (
              <p className="text-slate-300 leading-relaxed mb-8">{series.description}</p>
            )}

            {/* Кнопки действий */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {/* Кнопка просмотра */}
              <Link
                href={`/watch/series/${series.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-500/25"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Смотреть сериал
              </Link>

              {/* Трейлер */}
              {series.trailer && (
                <a
                  href={series.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Трейлер
                </a>
              )}
            </div>

            {/* Актёры */}
            {series.actors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">В главных ролях</h2>
                <div className="flex flex-wrap gap-3">
                  {series.actors.map((sa) => (
                    <Link
                      key={sa.actor.id}
                      href={`/actors/${sa.actor.id}`}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {sa.actor.photo ? (
                        <Image
                          src={sa.actor.photo}
                          alt={sa.actor.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm">
                          {sa.actor.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm">{sa.actor.name}</p>
                        {sa.character && (
                          <p className="text-slate-500 text-xs">{sa.character}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Сезоны и эпизоды */}
        {series.seasons.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Сезоны и эпизоды</h2>

            {/* Табы сезонов */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {series.seasons.map((season, idx) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(idx)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedSeason === idx
                      ? "bg-amber-500 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {season.name || `Сезон ${season.seasonNumber}`}
                </button>
              ))}
            </div>

            {/* Эпизоды */}
            {currentSeason && (
              <div className="space-y-3">
                {currentSeason.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex gap-4">
                      {ep.stillPath && (
                        <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={ep.stillPath}
                            alt={ep.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amber-400 font-medium">
                            {ep.episodeNumber}.
                          </span>
                          <h3 className="text-white font-medium">{ep.name}</h3>
                        </div>
                        {ep.overview && (
                          <p className="text-slate-400 text-sm line-clamp-2">{ep.overview}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-slate-500">
                          {ep.airDate && (
                            <span>{new Date(ep.airDate).toLocaleDateString("ru")}</span>
                          )}
                          {ep.runtime && <span>{ep.runtime} мин</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Отзывы */}
        {series.reviews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Отзывы</h2>
            <div className="space-y-4">
              {series.reviews.map((review) => (
                <div key={review.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    {review.user.avatar ? (
                      <Image
                        src={review.user.avatar}
                        alt={review.user.name || ""}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        {review.user.name?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{review.user.name}</p>
                      <p className="text-slate-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString("ru")}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-300">{review.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Похожие */}
        {similar.length > 0 && (
          <section className="mt-12 pb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Похожие сериалы</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.map((s) => (
                <Link key={s.id} href={`/series/${s.id}`} className="group">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800">
                    {s.poster ? (
                      <Image
                        src={s.poster}
                        alt={s.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📺</div>
                    )}
                  </div>
                  <h3 className="text-white mt-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {s.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <section className="container mx-auto px-4 py-12">
          <SeriesComments seriesId={series.id} />
        </section>
      </div>
    </div>
  );
}

