import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Необходима авторизация" },
      { status: 401 }
    );
  }

  const { id: movieId } = await params;

  try {
    // Отмечаем фильм как просмотренный
    await prisma.watchHistory.upsert({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
      update: {
        completed: true,
        lastWatched: new Date(),
      },
      create: {
        userId: session.user.id,
        movieId,
        completed: true,
        progress: 0,
      },
    });

    // Также обновляем watchlist на "WATCHED"
    await prisma.watchlist.upsert({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
      update: {
        type: "WATCHED",
      },
      create: {
        userId: session.user.id,
        movieId,
        type: "WATCHED",
      },
    });

    // Проверяем достижения
    const watchedCount = await prisma.watchHistory.count({
      where: {
        userId: session.user.id,
        completed: true,
      },
    });

    // Выдаём достижения за количество просмотров
    const achievementCodes = [];
    if (watchedCount === 1) achievementCodes.push("FIRST_MOVIE");
    if (watchedCount === 10) achievementCodes.push("WATCHED_10");
    if (watchedCount === 50) achievementCodes.push("WATCHED_50");
    if (watchedCount === 100) achievementCodes.push("WATCHED_100");

    for (const code of achievementCodes) {
      const achievement = await prisma.achievement.findUnique({
        where: { code },
      });
      
      if (achievement) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: session.user.id,
              achievementId: achievement.id,
            },
          },
          update: {},
          create: {
            userId: session.user.id,
            achievementId: achievement.id,
          },
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      watchedCount,
      newAchievements: achievementCodes,
    });
  } catch {
    return NextResponse.json(
      { error: "Ошибка отметки просмотра" },
      { status: 500 }
    );
  }
}

