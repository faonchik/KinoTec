import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { movieSchema } from "@/lib/validations/movie";

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

// Получить один фильм для редактирования
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        genres: true,
      },
    });

    if (!movie) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Movie fetch error:", error);
    return NextResponse.json({ error: "Ошибка при получении фильма" }, { status: 500 });
  }
}

// Обновить фильм
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const validated = movieSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    // Обновляем основные поля
    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: {
        title: validated.data.title,
        originalTitle: validated.data.originalTitle || null,
        description: validated.data.description || null,
        poster: validated.data.poster || null,
        backdrop: validated.data.backdrop || null,
        trailer: validated.data.trailer || null,
        releaseDate: validated.data.releaseDate
          ? new Date(validated.data.releaseDate)
          : null,
        runtime: validated.data.runtime || null,
        country: validated.data.country || null,
        directorId: validated.data.directorId || null,
      },
    });

    // Обновляем жанры (пересоздаём связи)
    if (validated.data.genreIds) {
      await prisma.movieGenre.deleteMany({
        where: { movieId: id },
      });

      if (validated.data.genreIds.length > 0) {
        await prisma.movieGenre.createMany({
          data: validated.data.genreIds.map((genreId) => ({
            movieId: id,
            genreId,
          })),
        });
      }
    }

    const movieWithRelations = await prisma.movie.findUnique({
      where: { id: updatedMovie.id },
      include: {
        director: true,
        genres: { include: { genre: true } },
      },
    });

    return NextResponse.json(movieWithRelations);
  } catch (error) {
    console.error("Movie update error:", error);
    
    // Проверяем, является ли это ошибкой уникальности kinopoiskId
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Этот Kinopoisk ID уже используется другим фильмом" },
        { status: 400 }
      );
    }
    
    // Проверяем другие ошибки Prisma
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Этот Kinopoisk ID уже используется другим фильмом" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка при обновлении фильма" },
      { status: 500 }
    );
  }
}

// Удалить фильм
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.movie.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Movie delete error:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении фильма" },
      { status: 500 }
    );
  }
}


