import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Cron-задача для проверки новых сезонов
// Вызывается через cron или вручную
export async function POST(request: NextRequest) {
  // Проверка секретного ключа для безопасности
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Получаем всех пользователей, которые следят за сериалами
    const usersWithSeriesWatchlists = await prisma.user.findMany({
      where: {
        seriesWatchlists: { some: {} },
        settings: {
          notifyNewSeasons: true,
        },
      },
      include: {
        seriesWatchlists: {
          include: {
            series: {
              include: {
                seasons: {
                  orderBy: { seasonNumber: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
        settings: true,
      },
    });

    let notificationsCreated = 0;

    for (const user of usersWithSeriesWatchlists) {
      for (const watchlist of user.seriesWatchlists) {
        const series = watchlist.series;
        const latestSeason = series.seasons[0];

        if (!latestSeason || !latestSeason.airDate) continue;

        // Проверяем, был ли сезон добавлен недавно (за последние 7 дней)
        const seasonDate = new Date(latestSeason.airDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        if (seasonDate >= weekAgo && seasonDate <= new Date()) {
          // Проверяем, не отправляли ли уже уведомление
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              seriesId: series.id,
              type: "NEW_SEASON",
              createdAt: {
                gte: weekAgo,
              },
            },
          });

          if (!existingNotification) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                seriesId: series.id,
                type: "NEW_SEASON",
                title: `Новый сезон: ${series.title}`,
                message: `Вышел ${latestSeason.name || `сезон ${latestSeason.seasonNumber}`}`,
                link: `/series/${series.id}`,
              },
            });
            notificationsCreated++;
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      notificationsCreated,
      usersChecked: usersWithSeriesWatchlists.length,
    });
  } catch (error) {
    console.error("Check seasons error:", error);
    return NextResponse.json({ error: "Ошибка проверки сезонов" }, { status: 500 });
  }
}

