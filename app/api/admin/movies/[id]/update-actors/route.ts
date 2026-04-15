import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import tmdb from "@/lib/tmdb";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return null;
  }
  return session;
}

/**
 * Обновляет актёров для фильма из TMDB
 * POST /api/admin/movies/[id]/update-actors
 */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        actors: true,
      },
    });

    if (!movie) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    // Ищем фильм в TMDB по названию
    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined;
    
    let tmdbId: number | null = null;

    // Пробуем поиск по основному названию
    const searchResults = await tmdb.searchMovies(movie.title);
    if (searchResults && searchResults.results && searchResults.results.length > 0) {
      // Если указан год, ищем наиболее подходящий результат
      if (year) {
        const matching = searchResults.results.find(
          (m) => m.release_date && new Date(m.release_date).getFullYear() === year
        );
        tmdbId = matching ? matching.id : searchResults.results[0].id;
      } else {
        tmdbId = searchResults.results[0].id;
      }
    }

    // Если не нашли, пробуем по оригинальному названию
    if (!tmdbId && movie.originalTitle && movie.originalTitle !== movie.title) {
      const searchResultsAlt = await tmdb.searchMovies(movie.originalTitle);
      if (searchResultsAlt && searchResultsAlt.results && searchResultsAlt.results.length > 0) {
        if (year) {
          const matching = searchResultsAlt.results.find(
            (m) => m.release_date && new Date(m.release_date).getFullYear() === year
          );
          tmdbId = matching ? matching.id : searchResultsAlt.results[0].id;
        } else {
          tmdbId = searchResultsAlt.results[0].id;
        }
      }
    }

    if (!tmdbId) {
      return NextResponse.json(
        { error: "Фильм не найден в TMDB. Попробуйте импортировать через TMDB ID." },
        { status: 404 }
      );
    }

    // Получаем актёров из TMDB
    const credits = await tmdb.getMovieCredits(tmdbId);
    const actors = credits?.cast || [];

    if (actors.length === 0) {
      return NextResponse.json(
        { error: "В TMDB нет информации об актёрах для этого фильма" },
        { status: 404 }
      );
    }

    let added = 0;
    let skipped = 0;

    for (const tmdbActor of actors) {
      try {
        // Проверяем, есть ли уже такой актёр в базе
        let actor = await prisma.actor.findFirst({
          where: { name: tmdbActor.name },
        });

        // Проверяем, не связан ли уже этот актёр с фильмом
        if (actor) {
          const existingLink = await prisma.movieActor.findUnique({
            where: {
              movieId_actorId: {
                movieId: id,
                actorId: actor.id,
              },
            },
          });

          if (existingLink) {
            skipped++;
            continue;
          }
        }

        // Создаём актёра, если его нет
        if (!actor) {
          const personDetails = await tmdb.getPerson(tmdbActor.id);

          actor = await prisma.actor.create({
            data: {
              name: tmdbActor.name,
              bio: personDetails?.biography || null,
              photo: tmdb.getImageUrl(tmdbActor.profile_path),
              birthDate: personDetails?.birthday ? new Date(personDetails.birthday) : null,
              birthPlace: personDetails?.place_of_birth || null,
              deathDate: personDetails?.deathday ? new Date(personDetails.deathday) : null,
            },
          });
        }

        // Связываем актёра с фильмом
        await prisma.movieActor.create({
          data: {
            movieId: id,
            actorId: actor.id,
            character: tmdbActor.character || "",
            order: tmdbActor.order || 0,
          },
        });

        added++;
      } catch (error) {
        console.error(`Error adding actor ${tmdbActor.name}:`, error);
        skipped++;
      }
    }

    // Получаем обновлённый фильм
    const updatedMovie = await prisma.movie.findUnique({
      where: { id },
      include: {
        actors: {
          include: { actor: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Добавлено актёров: ${added}, пропущено: ${skipped}`,
      movie: updatedMovie,
    });
  } catch (error) {
    console.error("Update actors error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении актёров" },
      { status: 500 }
    );
  }
}

