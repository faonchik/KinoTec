import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/** Сериализация для передачи в клиент (Prisma BigInt → string). */
export function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString() as unknown as T;
  /** Date is `object`; a naive key-copy would turn it into `{}` and break callers (e.g. releaseDate). */
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map((item) => serializeBigInt(item)) as unknown as T;
  if (typeof obj === "object") {
    const result = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeBigInt((obj as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }
  return obj;
}

export const getPopularMovies = unstable_cache(
  async () => {
    try {
      const movies = await prisma.movie.findMany({
        take: 5,
        orderBy: { popularity: "desc" },
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
      });
      return serializeBigInt(movies);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      return [];
    }
  },
  ["popular-movies"],
  { revalidate: 3600 }
);

export const getLatestMovies = unstable_cache(
  async () => {
    try {
      const movies = await prisma.movie.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
      });
      return serializeBigInt(movies);
    } catch (error) {
      console.error("Error fetching latest movies:", error);
      return [];
    }
  },
  ["latest-movies"],
  { revalidate: 1800 }
);

export const getTopRatedMovies = unstable_cache(
  async () => {
    try {
      const movies = await prisma.movie.findMany({
        take: 50,
        include: {
          genres: { include: { genre: true } },
          ratings: {
            select: { value: true },
          },
        },
        orderBy: { popularity: "desc" },
      });

      const result = movies
        .map((movie) => ({
          ...movie,
          avgRating: movie.ratings.length
            ? movie.ratings.reduce((acc, r) => acc + r.value, 0) / movie.ratings.length
            : 0,
        }))
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 10);

      return serializeBigInt(result);
    } catch (error) {
      console.error("Error fetching top rated movies:", error);
      return [];
    }
  },
  ["top-rated-movies"],
  { revalidate: 3600 }
);

export const getGenres = unstable_cache(
  async () => {
    try {
      const genres = await prisma.genre.findMany({
        take: 6,
        orderBy: { name: "asc" },
      });
      return genres;
    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  },
  ["home-genres"],
  { revalidate: 86400 }
);

export async function getPersonalRecommendations(userId: string) {
  try {
    const watchHistory = await prisma.watchHistory.findMany({
      where: { userId, completed: true },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            director: true,
            actors: { include: { actor: true }, take: 5 },
            ratings: true,
          },
        },
      },
      take: 50,
      orderBy: { lastWatched: "desc" },
    });

    const userRatings = await prisma.rating.findMany({
      where: { userId },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            ratings: true,
          },
        },
      },
      take: 50,
    });

    if (watchHistory.length === 0 && userRatings.length === 0) {
      return [];
    }

    const genreWeights: Record<string, number> = {};
    const directorWeights: Record<string, number> = {};
    const watchedMovieIds = new Set<string>();

    watchHistory.forEach((wh) => {
      watchedMovieIds.add(wh.movie.id);
      wh.movie.genres.forEach((mg) => {
        genreWeights[mg.genre.id] = (genreWeights[mg.genre.id] || 0) + 1;
      });
      if (wh.movie.director) {
        directorWeights[wh.movie.director.id] = (directorWeights[wh.movie.director.id] || 0) + 1;
      }
    });

    userRatings.forEach((rating) => {
      watchedMovieIds.add(rating.movie.id);
      const weight = rating.value >= 8 ? 2 : rating.value >= 6 ? 1 : 0.5;
      rating.movie.genres.forEach((mg) => {
        genreWeights[mg.genre.id] = (genreWeights[mg.genre.id] || 0) + weight;
      });
    });

    const topGenres = Object.entries(genreWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topDirectors = Object.entries(directorWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const orFilter = [
      ...(topGenres.length > 0
        ? [
            {
              genres: { some: { genreId: { in: topGenres } } },
            },
          ]
        : []),
      ...(topDirectors.length > 0
        ? [
            {
              directorId: { in: topDirectors },
            },
          ]
        : []),
    ];
    if (orFilter.length === 0) {
      return [];
    }

    const recommendations = await prisma.movie.findMany({
      where: {
        id: { notIn: Array.from(watchedMovieIds) },
        OR: orFilter,
      },
      include: {
        genres: { include: { genre: true } },
        ratings: true,
      },
      take: 6,
      orderBy: { popularity: "desc" },
    });

    return serializeBigInt(recommendations);
  } catch (error) {
    console.error("Personal recommendations error:", error);
    return [];
  }
}
