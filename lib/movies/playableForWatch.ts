import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

/** Фильмы, для которых в принципе можно собрать плеер (БД + TMDB/Kinobox/файл). */
export const moviePlayableWhere: Prisma.MovieWhereInput = {
  OR: [{ kinopoiskId: { not: null } }, { tmdbId: { not: null } }, { videoUrl: { not: null } }],
};

export async function getPlayableMoviesForWatchStrip(excludeId: string, take = 18) {
  return prisma.movie.findMany({
    where: {
      AND: [{ id: { not: excludeId } }, moviePlayableWhere],
    },
    select: { id: true, title: true, poster: true },
    orderBy: { popularity: "desc" },
    take,
  });
}
