import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Просмотренные фильмы за неделю
    const watchedMovies = await prisma.watchHistory.findMany({
      where: {
        userId: session.user.id,
        completed: true,
        lastWatched: { gte: weekAgo },
      },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            ratings: true,
          },
        },
      },
      orderBy: { lastWatched: "desc" },
    });

    // Просмотренные сериалы
    const watchedSeries = await prisma.seriesWatchHistory.findMany({
      where: {
        userId: session.user.id,
        lastWatched: { gte: weekAgo },
      },
      include: {
        series: {
          include: {
            genres: { include: { genre: true } },
            ratings: true,
          },
        },
      },
      orderBy: { lastWatched: "desc" },
    });

    // Оставленные оценки
    const ratings = await prisma.rating.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: weekAgo },
      },
      include: {
        movie: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Написанные отзывы
    const reviews = await prisma.review.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: weekAgo },
      },
      include: {
        movie: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Статистика
    const totalMinutes = watchedMovies.reduce((acc, wh) => acc + (wh.movie.runtime || 0), 0);
    const genreStats: Record<string, number> = {};
    
    watchedMovies.forEach((wh) => {
      wh.movie.genres.forEach((mg) => {
        genreStats[mg.genre.name] = (genreStats[mg.genre.name] || 0) + 1;
      });
    });

    const topGenres = Object.entries(genreStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    const avgRating = ratings.length
      ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length
      : 0;

    return NextResponse.json({
      period: {
        from: weekAgo.toISOString(),
        to: new Date().toISOString(),
      },
      watchedMovies: watchedMovies.length,
      watchedSeries: watchedSeries.length,
      totalMinutes,
      hours: Math.floor(totalMinutes / 60),
      ratings: ratings.length,
      reviews: reviews.length,
      avgRating: avgRating.toFixed(1),
      topGenres,
      movies: watchedMovies.map((wh) => ({
        id: wh.movie.id,
        title: wh.movie.title,
        poster: wh.movie.poster,
        watchedAt: wh.lastWatched,
      })),
      series: watchedSeries.map((wh) => ({
        id: wh.series.id,
        title: wh.series.title,
        poster: wh.series.poster,
        watchedAt: wh.lastWatched,
      })),
    });
  } catch (error) {
    console.error("Weekly report error:", error);
    return NextResponse.json({ error: "Ошибка получения отчёта" }, { status: 500 });
  }
}

// Отправить отчёт на email
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await fetch(`${request.nextUrl.origin}/api/user/weekly-report`).then(r => r.json());
    
    if (report.error) {
      return NextResponse.json({ error: report.error }, { status: 500 });
    }

    const emailHtml = `
      <h2>Ваш еженедельный отчёт КиноТека</h2>
      <p>Привет, ${session.user.name || "киноман"}!</p>
      
      <h3>📊 Статистика за неделю:</h3>
      <ul>
        <li>Просмотрено фильмов: ${report.watchedMovies}</li>
        <li>Просмотрено сериалов: ${report.watchedSeries}</li>
        <li>Всего времени: ${report.hours} ч ${report.totalMinutes % 60} мин</li>
        <li>Оставлено оценок: ${report.ratings}</li>
        <li>Написано отзывов: ${report.reviews}</li>
        <li>Средняя оценка: ${report.avgRating}</li>
      </ul>

      ${report.topGenres.length > 0 ? `
        <h3>🎭 Любимые жанры:</h3>
        <p>${report.topGenres.join(", ")}</p>
      ` : ""}

      ${report.movies.length > 0 ? `
        <h3>🎬 Просмотренные фильмы:</h3>
        <ul>
          ${report.movies.map((m: { title: string }) => `<li>${m.title}</li>`).join("")}
        </ul>
      ` : ""}

      <p><a href="${request.nextUrl.origin}/profile/stats">Посмотреть полную статистику</a></p>
    `;

    await sendEmail({
      to: session.user.email,
      subject: "Ваш еженедельный отчёт КиноТека",
      html: emailHtml,
    });

    return NextResponse.json({ success: true, message: "Отчёт отправлен на email" });
  } catch (error) {
    console.error("Send weekly report error:", error);
    return NextResponse.json({ error: "Ошибка отправки отчёта" }, { status: 500 });
  }
}

