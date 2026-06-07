import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
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

function mapHomeToPreview(arr: unknown[]): StreamingPreviewMovie[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((m) => homeMovieToStreamingPreview(m as HomeMovieForPreview));
}

function pickHero(...lists: StreamingPreviewMovie[][]): StreamingPreviewMovie | null {
  for (const list of lists) {
    const withVisual = list.find((m) => m.backdrop || m.poster);
    if (withVisual) return withVisual;
    if (list[0]) return list[0];
  }
  return null;
}

export async function getStreamingPreviewPayload(): Promise<StreamingPreviewPayload> {
  const t = await getTranslations("home");
  const session = await getServerSession(authOptions);

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

  const hero = pickHero(popularMapped, latestMapped, topMapped, personalMapped);
  const fallback = buildPayloadFromPool(pool);

  return {
    hero: hero ?? fallback.hero,
    rows: rows.filter((r) => r.movies.length > 0),
    pool: takeUniqueById([...pool, ...fallback.pool], 200),
  };
}
