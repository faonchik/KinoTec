import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const genre = searchParams.get("genre");
  const year = searchParams.get("year");
  const minRating = searchParams.get("minRating");

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

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

    // Получаем фильмы
    const movies = await prisma.movie.findMany({
      where,
      include: {
        genres: { include: { genre: true } },
        ratings: true,
        director: true,
      },
      orderBy: { popularity: "desc" },
      take: 100,
    });

    // Фильтруем по рейтингу если нужно
    let filteredMovies = movies;
    if (minRating) {
      const minVal = parseFloat(minRating);
      filteredMovies = movies.filter((movie) => {
        if (movie.ratings.length === 0) return false;
        const avg = movie.ratings.reduce((acc, r) => acc + r.value, 0) / movie.ratings.length;
        return avg >= minVal;
      });
    }

    return NextResponse.json({ movies: filteredMovies });
  } catch (error) {
    console.error("Roulette error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
