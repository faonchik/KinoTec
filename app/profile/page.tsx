import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ProfileClient } from "./ProfileClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Мой профиль",
  description: "Управление профилем и настройки",
};

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          reviews: true,
          ratings: true,
          favorites: true,
          watchlists: true,
          watchHistory: { where: { completed: true } },
        },
      },
    },
  });

  // Последние избранные
  const recentFavorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      movie: {
        select: { id: true, title: true, poster: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  // Последние в списке просмотра
  const recentWatchlist = await prisma.watchlist.findMany({
    where: { userId },
    include: {
      movie: {
        select: { id: true, title: true, poster: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  // Отзывы пользователя с его оценками к фильму
  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      movie: {
        select: {
          id: true,
          title: true,
          poster: true,
          ratings: {
            where: { userId },
            select: { value: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Комментарии пользователя к фильмам
  const movieComments = await prisma.movieComment.findMany({
    where: { userId },
    include: {
      movie: {
        select: {
          id: true,
          title: true,
          poster: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const movieCommentsCount = await prisma.movieComment.count({
    where: { userId },
  });

  if (user) {
    user._count.reviews = user._count.reviews + movieCommentsCount;
  }

  const mappedReviews = reviews.map((r) => ({
    id: r.id,
    type: "review" as const,
    content: r.content,
    createdAt: r.createdAt,
    movie: {
      id: r.movie.id,
      title: r.movie.title,
      poster: r.movie.poster,
      ratings: r.movie.ratings,
    },
  }));

  const mappedComments = movieComments.map((c) => ({
    id: c.id,
    type: "comment" as const,
    content: c.content,
    createdAt: c.createdAt,
    movie: {
      id: c.movie.id,
      title: c.movie.title,
      poster: c.movie.poster,
      ratings: [],
    },
  }));

  const combinedReviewsAndComments = [...mappedReviews, ...mappedComments].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return { user, recentFavorites, recentWatchlist, reviews: combinedReviewsAndComments };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { user, recentFavorites, recentWatchlist, reviews } = await getUserData(session.user.id);

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <ProfileClient
      user={user}
      recentFavorites={recentFavorites}
      recentWatchlist={recentWatchlist}
      reviews={reviews}
    />
  );
}
