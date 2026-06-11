import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { SeriesWatchExperienceClient } from "@/components/player/SeriesWatchExperienceClient";
import { resolveSeriesWatchEmbed } from "@/lib/player/resolveWatchEmbed";
import { getTranslations, getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

interface WatchSeriesPageProps {
  params: Promise<{ id: string }>;
}

const getSeries = cache(async (id: string) => {
  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      genres: { include: { genre: true } },
      actors: {
        include: { actor: true },
        orderBy: { order: "asc" },
      },
      ratings: true,
      seasons: {
        include: {
          episodes: { orderBy: { episodeNumber: "asc" } },
        },
        orderBy: { seasonNumber: "asc" },
      },
    },
  });

  if (!series) notFound();
  return series;
});

async function getRecommendations(seriesId: string, genreIds: string[]) {
  return await prisma.series.findMany({
    where: {
      id: { not: seriesId },
      genres: {
        some: {
          genreId: { in: genreIds },
        },
      },
    },
    include: {
      genres: { include: { genre: true } },
      ratings: true,
    },
    take: 6,
    orderBy: { popularity: "desc" },
  });
}

export async function generateMetadata({ params }: WatchSeriesPageProps): Promise<Metadata> {
  const { id } = await params;
  const series = await getSeries(id);
  const t = await getTranslations("series");

  return {
    title: t("watch.seoTitle", { title: series.title }) || `Смотреть ${series.title} онлайн`,
    description: t("watch.seoDescription", {
      title: series.title,
      originalTitle: series.originalTitle || "",
    }) || `Смотреть сериал ${series.title} (${series.originalTitle || ""}) онлайн бесплатно в хорошем качестве`,
  };
}

export default async function WatchSeriesPage({ params }: WatchSeriesPageProps) {
  const { id } = await params;
  const series = await getSeries(id);
  const t = await getTranslations("series");
  const locale = await getLocale();
  
  const genreIds = series.genres.map((g) => g.genreId);
  const recommendations = await getRecommendations(id, genreIds);

  const avgRating = series.ratings.length
    ? (series.ratings.reduce((acc, r) => acc + r.value, 0) / series.ratings.length).toFixed(1)
    : null;

  const year = series.firstAirDate ? new Date(series.firstAirDate).getFullYear() : null;

  const firstSeason = series.seasons[0];
  const seasonNum = firstSeason?.seasonNumber ?? 1;
  const episodeNum = firstSeason?.episodes[0]?.episodeNumber ?? 1;

  const { embedSrc, usedTmdbSearch } = await resolveSeriesWatchEmbed({
    tmdbId: series.tmdbId,
    title: series.title,
    originalTitle: series.originalTitle,
    firstAirDate: series.firstAirDate,
    season: seasonNum,
    episode: episodeNum,
  });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const hasPlayback = Boolean(embedSrc);

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Плеер */}
      <div className="w-full bg-black">
        <div className="mx-auto max-w-[1400px]">
          <SeriesWatchExperienceClient
            seriesId={series.id}
            title={series.title}
            embedSrc={embedSrc}
            season={seasonNum}
            episode={episodeNum}
            isAuthenticated={Boolean(userId)}
            playerTmdbId={series.tmdbId ? String(series.tmdbId) : null}
            playerKinopoiskId={series.kinopoiskId}
            releaseYear={series.firstAirDate ? new Date(series.firstAirDate).getFullYear() : null}
            poster={series.poster}
            backdrop={series.backdrop}
          />
          {!hasPlayback && (
            <p className="px-4 py-3 text-center text-sm text-white/50">
              {t("watch.playerError")}
              {usedTmdbSearch ? t("watch.playerErrorTmdb") : "."}
              {t("watch.playerErrorSuffix")}
            </p>
          )}
        </div>
      </div>

      {/* Информация о сериале */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Основная информация */}
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{series.title}</h1>
                {series.originalTitle && series.originalTitle !== series.title && (
                  <p className="text-white/45 text-lg">{series.originalTitle}</p>
                )}
              </div>
              
              {avgRating && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 rounded-lg">
                  <span className="text-amber-400 text-xl">★</span>
                  <span className="text-white font-bold text-xl">{avgRating}</span>
                </div>
              )}
            </div>

            {/* Мета */}
            <div className="flex flex-wrap items-center gap-4 text-white/45 mb-6">
              {year && <span>{year}</span>}
              {series.country && <span>{series.country}</span>}
              {series.episodeRuntime && <span>{t("watch.runtimeEpisode", { runtime: series.episodeRuntime })}</span>}
              {series.seasons.length > 0 && (
                <span>{t("watch.seasonsCount", { count: series.seasons.length })}</span>
              )}
              {series.status && (
                <span className={`px-2 py-1 rounded text-xs ${
                  series.status === "RETURNING" ? "bg-green-500/20 text-green-400" :
                  series.status === "ENDED" ? "bg-white/[0.08] text-white/60" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {t(`status.${series.status}`)}
                </span>
              )}
            </div>

            {/* Жанры */}
            <div className="flex flex-wrap gap-2 mb-6">
              {series.genres.map((sg) => (
                <Link key={sg.genre.id} href={`/series?genre=${sg.genre.slug}`}>
                  <Badge variant="primary" className="hover:bg-amber-600 transition-colors">
                    {sg.genre.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Описание */}
            {series.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">{t("watch.aboutSeries")}</h2>
                <p className="text-white/80 leading-relaxed">{series.description}</p>
              </div>
            )}

            {/* Сезоны */}
            {series.seasons.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">{t("watch.seasons")}</h2>
                <div className="space-y-4">
                  {series.seasons.map((season) => (
                    <div key={season.id} className="bg-[#1e1e1e]/60 rounded-xl p-4 border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {season.name || `${t("watch.seasonsCount", { count: 1 }).replace("1", "").trim()} ${season.seasonNumber}`}
                        </h3>
                        <span className="text-white/45 text-sm">
                          {t("watch.episodesCount", { count: season.episodes.length })}
                        </span>
                      </div>
                      {season.overview && (
                        <p className="text-white/60 text-sm mb-3 line-clamp-2">{season.overview}</p>
                      )}
                      {season.airDate && (
                        <p className="text-white/35 text-xs">
                          {t("watch.airDate", {
                            date: new Date(season.airDate).toLocaleDateString(locale, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Актёры */}
            {series.actors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">{t("watch.cast")}</h2>
                <div className="flex flex-wrap gap-3">
                  {series.actors.map((sa) => (
                    <Link
                      key={sa.actor.id}
                      href={`/actors/${sa.actor.id}`}
                      className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e]/60 hover:bg-[#282828] border border-white/[0.04] rounded-lg transition-colors"
                    >
                      {sa.actor.photo ? (
                        <Image
                          src={sa.actor.photo}
                          alt={sa.actor.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center text-xs">
                          {sa.actor.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm">{sa.actor.name}</p>
                        {sa.character && (
                          <p className="text-white/40 text-xs">{sa.character}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Кнопка на страницу сериала */}
            <Link
              href={`/series/${series.id}`}
              className="inline-flex items-center gap-2 text-white/60 hover:text-amber-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("watch.moreInfo")}
            </Link>
          </div>

          {/* Сайдбар с рекомендациями */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">{t("watch.similar")}</h2>
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const recRating = rec.ratings.length
                  ? (rec.ratings.reduce((acc, r) => acc + r.value, 0) / rec.ratings.length).toFixed(1)
                  : null;

                return (
                  <Link
                    key={rec.id}
                    href={`/watch/series/${rec.id}`}
                    className="flex gap-3 p-2 rounded-lg hover:bg-[#1e1e1e]/60 transition-colors group"
                  >
                    <div className="relative w-16 aspect-[2/3] flex-shrink-0 rounded overflow-hidden bg-[#1e1e1e]">
                      {rec.poster ? (
                        <Image
                          src={rec.poster}
                          alt={rec.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-white/40">
                          КТ
                        </div>
                      )}
                      
                      {/* Play icon on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-amber-400 transition-colors">
                        {rec.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                        {recRating && (
                          <span className="text-amber-400">★ {recRating}</span>
                        )}
                        {rec.genres[0] && (
                          <span>{rec.genres[0].genre.name}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

