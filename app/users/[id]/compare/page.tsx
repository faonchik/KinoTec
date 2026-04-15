import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { CompareClient } from "./CompareClient";

interface ComparePageProps {
  params: Promise<{ id: string }>;
}

async function getComparisonData(currentUserId: string, otherUserId: string) {
  // Получаем оценки обоих пользователей
  const [currentUserRatings, otherUserRatings] = await Promise.all([
    prisma.rating.findMany({
      where: { userId: currentUserId },
      include: { movie: { include: { genres: { include: { genre: true } } } } },
    }),
    prisma.rating.findMany({
      where: { userId: otherUserId },
      include: { movie: { include: { genres: { include: { genre: true } } } } },
    }),
  ]);

  // Находим общие фильмы
  const currentUserMovieMap = new Map(
    currentUserRatings.map((r) => [r.movieId, r])
  );
  const otherUserMovieMap = new Map(
    otherUserRatings.map((r) => [r.movieId, r])
  );

  const commonMovies: Array<{
    movie: { id: string; title: string; poster: string | null };
    rating1: number;
    rating2: number;
    diff: number;
  }> = [];

  currentUserRatings.forEach((r) => {
    const otherRating = otherUserMovieMap.get(r.movieId);
    if (otherRating) {
      commonMovies.push({
        movie: {
          id: r.movie.id,
          title: r.movie.title,
          poster: r.movie.poster,
        },
        rating1: r.value,
        rating2: otherRating.value,
        diff: Math.abs(r.value - otherRating.value),
      });
    }
  });

  // Рассчитываем совпадение вкусов
  let compatibility = 0;
  if (commonMovies.length > 0) {
    const avgDiff = commonMovies.reduce((acc, m) => acc + m.diff, 0) / commonMovies.length;
    compatibility = Math.max(0, 100 - avgDiff * 10);
  }

  // Жанровые предпочтения
  const getGenreStats = (ratings: typeof currentUserRatings) => {
    const genreRatings: Record<string, { total: number; count: number }> = {};
    ratings.forEach((r) => {
      r.movie.genres.forEach((mg) => {
        if (!genreRatings[mg.genre.name]) {
          genreRatings[mg.genre.name] = { total: 0, count: 0 };
        }
        genreRatings[mg.genre.name].total += r.value;
        genreRatings[mg.genre.name].count++;
      });
    });
    
    return Object.entries(genreRatings)
      .map(([genre, { total, count }]) => ({
        genre,
        avgRating: total / count,
        count,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  };

  const currentUserGenres = getGenreStats(currentUserRatings);
  const otherUserGenres = getGenreStats(otherUserRatings);

  // Фильмы, которые понравились одному, но не смотрел другой
  const recommendFromOther = otherUserRatings
    .filter((r) => r.value >= 8 && !currentUserMovieMap.has(r.movieId))
    .slice(0, 6)
    .map((r) => ({
      id: r.movie.id,
      title: r.movie.title,
      poster: r.movie.poster,
      rating: r.value,
    }));

  const recommendToOther = currentUserRatings
    .filter((r) => r.value >= 8 && !otherUserMovieMap.has(r.movieId))
    .slice(0, 6)
    .map((r) => ({
      id: r.movie.id,
      title: r.movie.title,
      poster: r.movie.poster,
      rating: r.value,
    }));

  return {
    compatibility,
    commonMoviesCount: commonMovies.length,
    commonMovies: commonMovies.sort((a, b) => a.diff - b.diff).slice(0, 10),
    biggestDisagreements: commonMovies.sort((a, b) => b.diff - a.diff).slice(0, 5),
    currentUserGenres,
    otherUserGenres,
    recommendFromOther,
    recommendToOther,
  };
}

async function getOtherUser(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  });
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getOtherUser(id);

  return {
    title: user ? `Сравнение вкусов с ${user.name}` : "Сравнение вкусов",
    description: "Узнайте насколько совпадают ваши вкусы в кино",
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id: otherUserId } = await params;

  if (session.user.id === otherUserId) {
    redirect("/profile");
  }

  const otherUser = await getOtherUser(otherUserId);
  if (!otherUser) {
    notFound();
  }

  const comparison = await getComparisonData(session.user.id, otherUserId);

  return (
    <CompareClient
      currentUser={{ id: session.user.id, name: session.user.name || "Вы", avatar: null }}
      otherUser={otherUser}
      comparison={comparison}
    />
  );
}

