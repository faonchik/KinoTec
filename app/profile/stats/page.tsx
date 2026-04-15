import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { StatsClient } from "./StatsClient";

export const metadata: Metadata = {
  title: "Моя статистика",
  description: "Статистика просмотров и активности",
};

async function getUserStats(userId: string) {
  // Просмотренные фильмы
  const watchedMovies = await prisma.watchHistory.findMany({
    where: { userId, completed: true },
    include: {
      movie: {
        include: {
          genres: { include: { genre: true } },
          director: true,
        },
      },
    },
    orderBy: { lastWatched: "desc" },
  });

  // Отзывы
  const reviews = await prisma.review.count({ where: { userId } });

  // Рейтинги
  const ratings = await prisma.rating.findMany({
    where: { userId },
    include: { movie: true },
  });

  // Избранное
  const favorites = await prisma.favorite.count({ where: { userId } });

  // Список просмотра
  const watchlist = await prisma.watchlist.count({ where: { userId } });

  // Достижения
  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" },
  });

  // Подсчёт жанров
  const genreStats: Record<string, number> = {};
  watchedMovies.forEach((wh) => {
    wh.movie.genres.forEach((mg) => {
      genreStats[mg.genre.name] = (genreStats[mg.genre.name] || 0) + 1;
    });
  });

  // Подсчёт режиссёров
  const directorStats: Record<string, number> = {};
  watchedMovies.forEach((wh) => {
    if (wh.movie.director) {
      directorStats[wh.movie.director.name] = (directorStats[wh.movie.director.name] || 0) + 1;
    }
  });

  // Подсчёт по годам
  const yearStats: Record<number, number> = {};
  watchedMovies.forEach((wh) => {
    if (wh.movie.releaseDate) {
      const year = new Date(wh.movie.releaseDate).getFullYear();
      yearStats[year] = (yearStats[year] || 0) + 1;
    }
  });

  // Подсчёт по месяцам (когда смотрел)
  const monthlyActivity: Record<string, number> = {};
  watchedMovies.forEach((wh) => {
    const month = new Date(wh.lastWatched).toLocaleDateString("ru-RU", { year: "numeric", month: "short" });
    monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
  });

  // Общее время просмотра
  const totalMinutes = watchedMovies.reduce((acc, wh) => acc + (wh.movie.runtime || 0), 0);

  // Средняя оценка
  const avgUserRating = ratings.length
    ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length
    : 0;

  return {
    totalWatched: watchedMovies.length,
    totalMinutes,
    reviews,
    favorites,
    watchlist,
    avgUserRating,
    achievements,
    genreStats: Object.entries(genreStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    directorStats: Object.entries(directorStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    yearStats: Object.entries(yearStats)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .slice(0, 10),
    monthlyActivity: Object.entries(monthlyActivity).slice(-12),
    recentlyWatched: watchedMovies.slice(0, 8),
    ratings,
  };
}

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const stats = await getUserStats(session.user.id);

  return <StatsClient stats={stats} userName={session.user.name || "Киноман"} />;
}

