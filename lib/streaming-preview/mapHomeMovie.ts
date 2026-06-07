import type { StreamingPreviewMovie } from "@/components/streaming-preview/types";

/** Демо-прогресс для превью (стабильно от id). */
export function demoProgressFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 3)) % 100;
  if (h < 12) return 0;
  return Math.min(98, h);
}

type RatingsLike = { value: number }[] | undefined;
type GenresLike = { genre: { name: string; slug: string } }[] | undefined;

function releaseDateToIso(rd: unknown): string | null {
  if (rd == null || rd === "") return null;
  if (typeof rd === "string") {
    const s = rd.trim();
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toISOString();
  }
  if (rd instanceof Date) return Number.isNaN(rd.getTime()) ? null : rd.toISOString();
  if (typeof rd === "number" && Number.isFinite(rd)) {
    const d = new Date(rd);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const d = new Date(rd as string | number);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Фильм с главной (Prisma + serializeBigInt). */
export type HomeMovieForPreview = {
  id: string;
  title: string;
  originalTitle: string | null;
  description: string | null;
  poster: string | null;
  backdrop: string | null;
  trailer: string | null;
  videoUrl: string | null;
  runtime: number | null;
  releaseDate: Date | string | null;
  popularity: number;
  genres?: GenresLike;
  ratings?: RatingsLike;
  avgRating?: number;
};

export function homeMovieToStreamingPreview(m: HomeMovieForPreview): StreamingPreviewMovie {
  const ratings = m.ratings ?? [];
  const avgRating =
    typeof m.avgRating === "number"
      ? m.avgRating
      : ratings.length
        ? ratings.reduce((a, r) => a + r.value, 0) / ratings.length
        : 0;
  const genres = m.genres ?? [];
  const rd = m.releaseDate;
  return {
    id: m.id,
    title: m.title,
    originalTitle: m.originalTitle,
    description: m.description,
    poster: m.poster,
    backdrop: m.backdrop,
    trailer: m.trailer,
    videoUrl: m.videoUrl,
    runtime: m.runtime,
    releaseDate: releaseDateToIso(rd),
    popularity: m.popularity,
    genreNames: genres.map((g) => g.genre.name),
    genreSlugs: genres.map((g) => g.genre.slug),
    avgRating,
    demoProgress: demoProgressFromId(m.id),
  };
}

export function takeUniqueById<T extends { id: string }>(items: T[], max: number): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of items) {
    if (seen.has(x.id)) continue;
    seen.add(x.id);
    out.push(x);
    if (out.length >= max) break;
  }
  return out;
}
