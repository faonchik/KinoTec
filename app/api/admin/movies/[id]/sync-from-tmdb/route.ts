import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import tmdb, { TMDBService } from "@/lib/tmdb";
import { serializeMovieForAdminJson } from "@/lib/admin/serializeMovie";

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

/** POST — подтянуть метаданные существующего фильма из TMDB по числовому ID. */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { tmdbId?: number | string };

    const raw = body.tmdbId;
    const tmdbId = typeof raw === "number" ? raw : parseInt(String(raw ?? "").trim(), 10);
    if (!tmdbId || Number.isNaN(tmdbId)) {
      return NextResponse.json({ error: "Укажите числовой TMDB ID" }, { status: 400 });
    }

    const existing = await prisma.movie.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    const tmdbMovie = await tmdb.getMovie(tmdbId);
    if (!tmdbMovie) {
      return NextResponse.json({ error: "Фильм не найден в TMDB" }, { status: 404 });
    }

    const credits = await tmdb.getMovieCredits(tmdbId);
    const tmdbDirector = credits?.crew.find((c) => c.job === "Director");
    let directorId: string | null = existing.directorId;

    if (tmdbDirector) {
      let director = await prisma.director.findFirst({
        where: { name: tmdbDirector.name },
      });

      if (!director) {
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

    const genreIds: string[] = [];
    for (const tmdbGenre of tmdbMovie.genres) {
      const slug = tmdbGenre.name.toLowerCase().replace(/\s+/g, "-");
      let genre = await prisma.genre.findFirst({
        where: { name: tmdbGenre.name },
      });
      if (!genre) {
        genre = await prisma.genre.create({
          data: { name: tmdbGenre.name, slug },
        });
      }
      genreIds.push(genre.id);
    }

    await prisma.movieGenre.deleteMany({ where: { movieId: id } });
    if (genreIds.length > 0) {
      await prisma.movieGenre.createMany({
        data: genreIds.map((genreId) => ({ movieId: id, genreId })),
      });
    }

    const updated = await prisma.movie.update({
      where: { id },
      data: {
        title: tmdbMovie.title,
        originalTitle: tmdbMovie.original_title || null,
        description: tmdbMovie.overview || null,
        poster: TMDBService.getImageUrl(tmdbMovie.poster_path),
        backdrop: TMDBService.getBackdropUrl(tmdbMovie.backdrop_path),
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        runtime: tmdbMovie.runtime || null,
        budget: tmdbMovie.budget ? BigInt(tmdbMovie.budget) : null,
        revenue: tmdbMovie.revenue ? BigInt(tmdbMovie.revenue) : null,
        country: tmdbMovie.production_countries.map((c) => c.name).join(", ") || null,
        popularity: tmdbMovie.vote_average * 10,
        directorId,
        tmdbId: String(tmdbId),
      },
      include: {
        director: true,
        genres: { include: { genre: true } },
      },
    });

    return NextResponse.json({
      success: true,
      movie: serializeMovieForAdminJson(updated as unknown as Record<string, unknown>),
    });
  } catch (error) {
    console.error("sync-from-tmdb error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка синхронизации с TMDB" },
      { status: 500 }
    );
  }
}
