import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ProfileClient } from "./ProfileClient";

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
          achievements: true,
          watchHistory: { where: { completed: true } },
        },
      },
      purchasedItems: {
        where: { isEquipped: true },
        include: { item: true },
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

  return { user, recentFavorites, recentWatchlist };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { user, recentFavorites, recentWatchlist } = await getUserData(session.user.id);

  if (!user) {
    redirect("/auth/signin");
  }

  return <ProfileClient user={user} recentFavorites={recentFavorites} recentWatchlist={recentWatchlist} />;
}
