import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");
  const genre = searchParams.get("genre");
  const year = searchParams.get("year");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { originalTitle: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (genre) {
    where.genres = {
      some: {
        genre: {
          slug: genre,
        },
      },
    };
  }

  if (year) {
    const yearNum = parseInt(year);
    where.releaseDate = {
      gte: new Date(`${yearNum}-01-01`),
      lt: new Date(`${yearNum + 1}-01-01`),
    };
  }

  try {
    const movies = await prisma.movie.findMany({
      where,
      orderBy: { popularity: "desc" },
      take: 500, // Ограничиваем для производительности
      include: {
        genres: { include: { genre: true } },
        director: true,
        ratings: true,
      },
    });

    return NextResponse.json(movies);
  } catch {
    return NextResponse.json(
      { error: "Ошибка получения данных" },
      { status: 500 }
    );
  }
}

