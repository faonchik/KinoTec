import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TMDBService } from "@/lib/tmdb";

// Этот endpoint можно вызывать через cron job для автоматического обновления премьер
export async function GET(request: NextRequest) {
  try {
    // Проверяем, что запрос идёт от авторизованного админа или с правильным ключом
    const session = await getServerSession(authOptions);
    const authHeader = request.headers.get("authorization");
    
    if (!session?.user && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tmdb = new TMDBService();
    
    // Получаем предстоящие фильмы из TMDB
    const upcomingMovies = await tmdb.getUpcomingMovies();
    
    if (!upcomingMovies || upcomingMovies.length === 0) {
      return NextResponse.json({ message: "No upcoming movies found", synced: 0 });
    }

    let synced = 0;

    for (const tmdbMovie of upcomingMovies) {
      try {
        // Проверяем, существует ли фильм
        const existing = await prisma.movie.findFirst({
          where: {
            OR: [
              { tmdbId: tmdbMovie.id.toString() },
              { title: tmdbMovie.title },
            ],
          },
        });

        if (existing) {
          // Обновляем дату релиза, если она изменилась
          if (tmdbMovie.release_date && new Date(tmdbMovie.release_date) > new Date()) {
            await prisma.movie.update({
              where: { id: existing.id },
              data: {
                releaseDate: new Date(tmdbMovie.release_date),
                updatedAt: new Date(),
              },
            });
            synced++;
          }
        } else {
          // Создаём новый фильм
          await prisma.movie.create({
            data: {
              title: tmdbMovie.title,
              originalTitle: tmdbMovie.original_title,
              description: tmdbMovie.overview || null,
              poster: tmdbMovie.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
                : null,
              backdrop: tmdbMovie.backdrop_path
                ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}`
                : null,
              releaseDate: tmdbMovie.release_date
                ? new Date(tmdbMovie.release_date)
                : null,
              runtime: tmdbMovie.runtime || null,
              tmdbId: tmdbMovie.id.toString(),
              popularity: tmdbMovie.vote_average * tmdbMovie.vote_count || 0,
            },
          });
          synced++;
        }
      } catch (error) {
        console.error(`Error syncing movie ${tmdbMovie.id}:`, error);
        // Продолжаем обработку других фильмов
      }
    }

    return NextResponse.json({
      message: "Premieres synced successfully",
      synced,
      total: upcomingMovies.length,
    });
  } catch (error) {
    console.error("Sync premieres error:", error);
    return NextResponse.json(
      { error: "Failed to sync premieres" },
      { status: 500 }
    );
  }
}

