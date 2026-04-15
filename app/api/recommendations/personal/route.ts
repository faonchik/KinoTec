import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Получаем историю просмотров пользователя
    const watchHistory = await prisma.watchHistory.findMany({
      where: { 
        userId: session.user.id,
        completed: true,
      },
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

    // Получаем оценки пользователя
    const userRatings = await prisma.rating.findMany({
      where: { userId: session.user.id },
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

    // Если нет истории, возвращаем популярные фильмы
    if (watchHistory.length === 0 && userRatings.length === 0) {
      const popularMovies = await prisma.movie.findMany({
        take: 12,
        orderBy: { popularity: "desc" },
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
      });

      return NextResponse.json({ movies: popularMovies });
    }

    // Анализируем предпочтения
    const genreWeights: Record<string, number> = {};
    const directorWeights: Record<string, number> = {};
    const actorWeights: Record<string, number> = {};
    const watchedMovieIds = new Set<string>();

    // Анализ просмотренных фильмов
    watchHistory.forEach((wh) => {
      watchedMovieIds.add(wh.movie.id);
      
      wh.movie.genres.forEach((mg) => {
        genreWeights[mg.genre.id] = (genreWeights[mg.genre.id] || 0) + 1;
      });

      if (wh.movie.director) {
        directorWeights[wh.movie.director.id] = (directorWeights[wh.movie.director.id] || 0) + 1;
      }

      wh.movie.actors.forEach((ma) => {
        actorWeights[ma.actor.id] = (actorWeights[ma.actor.id] || 0) + 0.5;
      });
    });

    // Анализ оценок (высокие оценки весят больше)
    userRatings.forEach((rating) => {
      watchedMovieIds.add(rating.movie.id);
      const weight = rating.value >= 8 ? 2 : rating.value >= 6 ? 1 : 0.5;

      rating.movie.genres.forEach((mg) => {
        genreWeights[mg.genre.id] = (genreWeights[mg.genre.id] || 0) + weight;
      });
    });

    // Получаем топ жанров, режиссёров и актёров
    const topGenres = Object.entries(genreWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topDirectors = Object.entries(directorWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const topActors = Object.entries(actorWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    // Ищем похожие фильмы
    const recommendations = await prisma.movie.findMany({
      where: {
        id: { notIn: Array.from(watchedMovieIds) },
        OR: [
          ...(topGenres.length > 0 ? [{
            genres: {
              some: {
                genreId: { in: topGenres },
              },
            },
          }] : []),
          ...(topDirectors.length > 0 ? [{
            directorId: { in: topDirectors },
          }] : []),
          ...(topActors.length > 0 ? [{
            actors: {
              some: {
                actorId: { in: topActors },
              },
            },
          }] : []),
        ],
      },
      include: {
        genres: { include: { genre: true } },
        ratings: true,
        director: true,
      },
      take: 20,
      orderBy: { popularity: "desc" },
    });

    // Сортируем по релевантности
    const scoredMovies = recommendations.map((movie) => {
      let score = movie.popularity || 0;

      // Бонус за совпадение жанров
      const matchingGenres = movie.genres.filter((mg) => topGenres.includes(mg.genreId)).length;
      score += matchingGenres * 10;

      // Бонус за режиссёра
      if (movie.directorId && topDirectors.includes(movie.directorId)) {
        score += 15;
      }

      // Бонус за рейтинг
      if (movie.ratings.length > 0) {
        const avgRating = movie.ratings.reduce((acc, r) => acc + r.value, 0) / movie.ratings.length;
        score += avgRating * 2;
      }

      return { ...movie, score };
    });

    scoredMovies.sort((a, b) => b.score - a.score);

    return NextResponse.json({ 
      movies: scoredMovies.slice(0, 12).map(({ score: _unused, ...movie }) => movie),
    });
  } catch (error) {
    console.error("Personal recommendations error:", error);
    return NextResponse.json({ error: "Ошибка получения рекомендаций" }, { status: 500 });
  }
}

