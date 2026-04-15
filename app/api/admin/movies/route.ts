import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { movieSchema } from "@/lib/validations/movie";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const body = await request.json();

    const validated = movieSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const movie = await prisma.movie.create({
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
        genres: validated.data.genreIds
          ? {
              create: validated.data.genreIds.map((genreId) => ({
                genreId,
              })),
            }
          : undefined,
      },
      include: {
        director: true,
        genres: { include: { genre: true } },
      },
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error("Movie creation error:", error);
    return NextResponse.json(
      { error: "Ошибка при создании фильма" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        director: true,
        genres: { include: { genre: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(movies);
  } catch (error) {
    console.error("Movies fetch error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении фильмов" },
      { status: 500 }
    );
  }
}

