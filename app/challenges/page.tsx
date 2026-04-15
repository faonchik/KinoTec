import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ChallengesClient } from "./ChallengesClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("challenges");
  return {
    title: t("title"),
    description: t("description"),
  };
}

async function getChallenges(userId?: string) {
  const challenges = await prisma.challenge.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { participants: true } },
      ...(userId && {
        participants: {
          where: { userId },
        },
      }),
    },
    orderBy: { createdAt: "desc" },
  });

  // Получаем обложки фильмов для челленджей
  const challengesWithCovers = await Promise.all(
    challenges.map(async (challenge) => {
      let coverMovie = null;

      // Пытаемся найти фильм по условиям челленджа
      if (challenge.conditions && typeof challenge.conditions === "object") {
        const conditions = challenge.conditions as Record<string, unknown>;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (conditions.genre) {
          const genre = await prisma.genre.findFirst({
            where: { slug: conditions.genre as string },
          });
          if (genre) {
            where.genres = { some: { genreId: genre.id } };
          }
        }

        if (conditions.director) {
          const director = await prisma.director.findFirst({
            where: { name: { contains: conditions.director as string, mode: "insensitive" } },
          });
          if (director) {
            where.directorId = director.id;
          }
        }

        coverMovie = await prisma.movie.findFirst({
          where,
          select: { id: true, poster: true, title: true },
          orderBy: { popularity: "desc" },
        });
      }

      // Если не нашли по условиям, берём любой популярный фильм
      if (!coverMovie) {
        coverMovie = await prisma.movie.findFirst({
          where: { poster: { not: null } },
          select: { id: true, poster: true, title: true },
          orderBy: { popularity: "desc" },
        });
      }

      return {
        ...challenge,
        coverMovie: coverMovie?.poster || null,
      };
    })
  );

  return challengesWithCovers;
}

async function getUserProgress(userId: string) {
  const userChallenges = await prisma.userChallenge.findMany({
    where: { userId },
    include: {
      challenge: {
        include: {
          _count: { select: { participants: true } },
        },
      },
    },
  });

  return userChallenges;
}

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions);
  const challenges = await getChallenges(session?.user?.id);
  const userProgress = session?.user?.id 
    ? await getUserProgress(session.user.id)
    : [];

  return (
    <ChallengesClient
      challenges={challenges}
      userProgress={userProgress}
      isLoggedIn={!!session}
    />
  );
}

