import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import {
  getPopularMovies,
  getLatestMovies,
  getTopRatedMovies,
  getPersonalRecommendations,
} from "@/lib/movies/homeFeed";
import {
  homeMovieToStreamingPreview,
  takeUniqueById,
  type HomeMovieForPreview,
} from "@/lib/streaming-preview/mapHomeMovie";
import { buildPayloadFromPool, padRowWithDemoMovies } from "@/lib/streaming-preview/fallbackMovies";
import type { StreamingPreviewMovie, StreamingPreviewPayload } from "@/components/streaming-preview/types";

export async function getStreamingPreviewPayload(): Promise<StreamingPreviewPayload> {
  const t = await getTranslations("home");
  const session = await getServerSession(authOptions);

  // Fetch watch history progress for all displayed movies if user is logged in
  const watchHistories = session?.user?.id
    ? await prisma.watchHistory.findMany({
        where: { userId: session.user.id },
      })
    : [];
  const progressMap = new Map<string, number>();
  watchHistories.forEach((wh) => progressMap.set(wh.movieId, wh.progress));

  function mapHomeToPreview(arr: unknown[]): StreamingPreviewMovie[] {
    if (!Array.isArray(arr)) return [];
    return arr.map((m) => homeMovieToStreamingPreview(m as HomeMovieForPreview, progressMap));
  }

  const [popularRaw, latestRaw, topRaw, personalRaw] = await Promise.all([
    getPopularMovies(),
    getLatestMovies(),
    getTopRatedMovies(),
    session?.user?.id ? getPersonalRecommendations(session.user.id) : Promise.resolve([]),
  ]);

  const popularMapped = mapHomeToPreview(popularRaw);
  const latestMapped = mapHomeToPreview(latestRaw);
  const topMapped = mapHomeToPreview(Array.isArray(topRaw) ? topRaw : []);
  const personalMapped = mapHomeToPreview(Array.isArray(personalRaw) ? personalRaw : []);

  const pool = takeUniqueById(
    [...popularMapped, ...latestMapped, ...topMapped, ...personalMapped],
    200
  );

  if (pool.length === 0) {
    return buildPayloadFromPool([]);
  }

  const rows: StreamingPreviewPayload["rows"] = [];

  if (popularMapped.length > 0) {
    rows.push({
      key: "popular",
      title: t("popular"),
      movies: padRowWithDemoMovies(popularMapped, 5),
    });
  }

  if (topMapped.length > 0) {
    rows.push({
      key: "topRated",
      title: t("topRatedTitle"),
      subtitle: t("topRatedDescription"),
      movies: padRowWithDemoMovies(topMapped, 5),
    });
  }

  if (session?.user && personalMapped.length > 0) {
    rows.push({
      key: "personal",
      title: "✨ Для вас",
      subtitle: "Рекомендации на основе ваших просмотров",
      movies: padRowWithDemoMovies(personalMapped, 5),
    });
  }

  rows.push({
    key: "recent",
    title: t("recent"),
    subtitle: t("recentDescription"),
    movies: padRowWithDemoMovies(latestMapped, 5),
  });

  // Hero selection logic:
  // 1. If user has watch history, use the last watched movie with actual progress.
  // 2. Otherwise, use the newest premiere (released or upcoming).
  let hero: StreamingPreviewMovie | null = null;

  if (session?.user?.id) {
    const lastWatch = await prisma.watchHistory.findFirst({
      where: { userId: session.user.id },
      orderBy: { lastWatched: "desc" },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            ratings: true,
          },
        },
      },
    });

    if (lastWatch && lastWatch.movie) {
      hero = homeMovieToStreamingPreview(lastWatch.movie as unknown as HomeMovieForPreview, progressMap);
      hero.demoProgress = lastWatch.progress;
    }
  }

  if (!hero) {
    const newestPremiere = await prisma.movie.findFirst({
      where: {
        releaseDate: { not: null },
      },
      orderBy: {
        releaseDate: "desc",
      },
      include: {
        genres: { include: { genre: true } },
        ratings: true,
      },
    });

    if (newestPremiere) {
      hero = homeMovieToStreamingPreview(newestPremiere as unknown as HomeMovieForPreview, progressMap);
      hero.demoProgress = 0; // Pre-premiere has no watch progress
    }
  }

  const fallback = buildPayloadFromPool(pool);

  return {
    hero: hero ?? fallback.hero,
    rows: rows.filter((r) => r.movies.length > 0),
    pool: takeUniqueById([...pool, ...fallback.pool], 200),
  };
}
