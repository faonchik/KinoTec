import { tmdb } from "@/lib/tmdb";
import { getMovieEmbedSrc, getTvEmbedSrc, normalizeTmdbId } from "./embedUrl";

export type MovieEmbedInput = {
  tmdbId?: string | number | null;
  kinopoiskId?: string | null;
  title: string;
  originalTitle?: string | null;
  releaseDate?: Date | null;
};

export type SeriesEmbedInput = {
  tmdbId?: string | number | null;
  title: string;
  originalTitle?: string | null;
  firstAirDate?: Date | null;
  season: number;
  episode: number;
};

function releaseYear(d: Date | null | undefined): number | null {
  if (!d) return null;
  const y = new Date(d).getFullYear();
  return Number.isFinite(y) ? y : null;
}

function pickMovieIdFromResults(
  results: { id: number; release_date: string }[],
  year: number | null
): string | null {
  if (!results.length) return null;
  if (year) {
    const byYear = results.find((r) => {
      if (!r.release_date) return false;
      const ry = new Date(r.release_date).getFullYear();
      return ry === year;
    });
    if (byYear) return String(byYear.id);
  }
  return String(results[0].id);
}

async function lookupMovieTmdbId(movie: MovieEmbedInput): Promise<string | null> {
  const year = releaseYear(movie.releaseDate ?? null);
  const terms = [movie.title, movie.originalTitle]
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim());

  const uniqueTerms = [...new Set(terms)];

  for (const term of uniqueTerms) {
    const queries = year ? [`${term} ${year}`, term] : [term];
    for (const q of queries) {
      const search = await tmdb.searchMovies(q, 1);
      const results = search?.results ?? [];
      const id = pickMovieIdFromResults(results, year);
      if (id) return id;
    }
  }

  return null;
}

function pickTvIdFromResults(
  results: { id: number; first_air_date: string }[],
  year: number | null
): string | null {
  if (!results.length) return null;
  if (year) {
    const byYear = results.find((r) => {
      if (!r.first_air_date) return false;
      const ry = new Date(r.first_air_date).getFullYear();
      return ry === year;
    });
    if (byYear) return String(byYear.id);
  }
  return String(results[0].id);
}

async function lookupTvTmdbId(series: Omit<SeriesEmbedInput, "season" | "episode">): Promise<string | null> {
  const year = releaseYear(series.firstAirDate ?? null);
  const terms = [series.title, series.originalTitle]
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim());

  const uniqueTerms = [...new Set(terms)];

  for (const term of uniqueTerms) {
    const queries = year ? [`${term} ${year}`, term] : [term];
    for (const q of queries) {
      const search = await tmdb.searchTv(q, 1);
      const results = search?.results ?? [];
      const id = pickTvIdFromResults(results, year);
      if (id) return id;
    }
  }

  return null;
}

/**
 * Готовый URL iframe + флаг, что id добыт через поиск TMDB (можно позже сохранить в БД).
 */
export async function resolveMovieWatchEmbed(movie: MovieEmbedInput): Promise<{
  embedSrc: string | null;
  tmdbResolved: string | null;
  usedTmdbSearch: boolean;
}> {
  let tmdb = normalizeTmdbId(movie.tmdbId);
  let usedTmdbSearch = false;

  let embedSrc = getMovieEmbedSrc({
    tmdbId: tmdb,
    kinopoiskId: movie.kinopoiskId,
  });

  if (embedSrc) {
    return { embedSrc, tmdbResolved: tmdb, usedTmdbSearch };
  }

  if (!tmdb) {
    const found = await lookupMovieTmdbId(movie);
    if (found) {
      tmdb = found;
      usedTmdbSearch = true;
      embedSrc = getMovieEmbedSrc({
        tmdbId: tmdb,
        kinopoiskId: movie.kinopoiskId,
      });
    }
  }

  return { embedSrc, tmdbResolved: tmdb, usedTmdbSearch };
}

export async function resolveSeriesWatchEmbed(series: SeriesEmbedInput): Promise<{
  embedSrc: string | null;
  tmdbResolved: string | null;
  usedTmdbSearch: boolean;
}> {
  let tmdb = normalizeTmdbId(series.tmdbId);
  let usedTmdbSearch = false;

  let embedSrc: string | null = null;
  if (tmdb) {
    embedSrc = getTvEmbedSrc({
      tmdbId: tmdb,
      season: series.season,
      episode: series.episode,
    });
  }

  if (embedSrc) {
    return { embedSrc, tmdbResolved: tmdb, usedTmdbSearch };
  }

  const found = await lookupTvTmdbId(series);
  if (found) {
    tmdb = found;
    usedTmdbSearch = true;
    embedSrc = getTvEmbedSrc({
      tmdbId: tmdb,
      season: series.season,
      episode: series.episode,
    });
  }

  return { embedSrc, tmdbResolved: tmdb, usedTmdbSearch };
}
