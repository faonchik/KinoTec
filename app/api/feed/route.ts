import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    // Получаем список подписок
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    // Включаем свою активность тоже
    followingIds.push(session.user.id);

    // Получаем активности
    const activities = await prisma.activity.findMany({
      where: {
        userId: { in: followingIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = activities.length > limit;
    if (hasMore) activities.pop();

    // Обогащаем данные о фильмах
    const movieIds = activities
      .filter((a) => a.movieId)
      .map((a) => a.movieId as string);

    const movies = await prisma.movie.findMany({
      where: { id: { in: movieIds } },
      select: {
        id: true,
        title: true,
        poster: true,
      },
    });

    const movieMap = new Map(movies.map((m) => [m.id, m]));

    const enrichedActivities = activities.map((activity) => ({
      ...activity,
      movie: activity.movieId ? movieMap.get(activity.movieId) : null,
    }));

    return NextResponse.json({
      activities: enrichedActivities,
      nextCursor: hasMore ? activities[activities.length - 1].id : null,
    });
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

