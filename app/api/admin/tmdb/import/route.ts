import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import tmdb, { TMDBService } from "@/lib/tmdb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { tmdbId } = await request.json();

    if (!tmdbId) {
      return NextResponse.json({ error: "TMDB ID обязателен" }, { status: 400 });
    }

    // Получаем данные фильма из TMDB
    const tmdbMovie = await tmdb.getMovie(tmdbId);

    if (!tmdbMovie) {
      return NextResponse.json({ error: "Фильм не найден в TMDB" }, { status: 404 });
    }

    // Получаем актёров и режиссёра
    const credits = await tmdb.getMovieCredits(tmdbId);

    // Находим режиссёра
    const tmdbDirector = credits?.crew.find((c) => c.job === "Director");
    let directorId: string | null = null;

    if (tmdbDirector) {
      // Проверяем, есть ли режиссёр в базе
      let director = await prisma.director.findFirst({
        where: { name: tmdbDirector.name },
      });

      if (!director) {
        // Получаем подробную информацию о режиссёре
        const personDetails = await tmdb.getPerson(tmdbDirector.id);

        director = await prisma.director.create({
          data: {
            name: tmdbDirector.name,
            bio: personDetails?.biography || null,
            photo: TMDBService.getImageUrl(tmdbDirector.profile_path),
            birthDate: personDetails?.birthday ? new Date(personDetails.birthday) : null,
            birthPlace: personDetails?.place_of_birth || null,
            deathDate: personDetails?.deathday ? new Date(personDetails.deathday) : null,
          },
        });
      }

      directorId = director.id;
    }

    // Создаём или находим жанры
    const genreIds: string[] = [];
    for (const tmdbGenre of tmdbMovie.genres) {
      const slug = tmdbGenre.name.toLowerCase().replace(/\s+/g, "-");
      
      let genre = await prisma.genre.findFirst({
        where: { name: tmdbGenre.name },
      });

      if (!genre) {
        genre = await prisma.genre.create({
          data: {
            name: tmdbGenre.name,
            slug,
          },
        });
      }

      genreIds.push(genre.id);
    }

    // Создаём фильм
    const movie = await prisma.movie.create({
      data: {
        title: tmdbMovie.title,
        originalTitle: tmdbMovie.original_title,
        description: tmdbMovie.overview,
        poster: TMDBService.getImageUrl(tmdbMovie.poster_path),
        backdrop: TMDBService.getBackdropUrl(tmdbMovie.backdrop_path),
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        runtime: tmdbMovie.runtime || null,
        budget: tmdbMovie.budget ? BigInt(tmdbMovie.budget) : null,
        revenue: tmdbMovie.revenue ? BigInt(tmdbMovie.revenue) : null,
        country: tmdbMovie.production_countries.map((c) => c.name).join(", ") || null,
        popularity: tmdbMovie.vote_average * 10,
        directorId,
        genres: {
          create: genreIds.map((genreId) => ({ genreId })),
        },
      },
      include: {
        director: true,
        genres: { include: { genre: true } },
      },
    });

    // Добавляем актёров (все из cast, обычно до 20-30)
    const topActors = credits?.cast || [];

    for (const tmdbActor of topActors) {
      // Проверяем, есть ли актёр в базе
      let actor = await prisma.actor.findFirst({
        where: { name: tmdbActor.name },
      });

      if (!actor) {
        const personDetails = await tmdb.getPerson(tmdbActor.id);

        actor = await prisma.actor.create({
          data: {
            name: tmdbActor.name,
            bio: personDetails?.biography || null,
            photo: TMDBService.getImageUrl(tmdbActor.profile_path),
            birthDate: personDetails?.birthday ? new Date(personDetails.birthday) : null,
            birthPlace: personDetails?.place_of_birth || null,
            deathDate: personDetails?.deathday ? new Date(personDetails.deathday) : null,
          },
        });
      }

      // Связываем актёра с фильмом
      await prisma.movieActor.create({
        data: {
          movieId: movie.id,
          actorId: actor.id,
          character: tmdbActor.character,
          order: tmdbActor.order,
        },
      });
    }

    return NextResponse.json({
      success: true,
      movie: {
        id: movie.id,
        title: movie.title,
      },
    });
  } catch (error) {
    console.error("TMDB import error:", error);
    return NextResponse.json({ error: "Ошибка при импорте фильма" }, { status: 500 });
  }
}

