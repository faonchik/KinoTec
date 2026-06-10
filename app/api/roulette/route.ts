import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/movies/homeFeed";

/** Fallback movies when database is empty — well-known TMDB titles */
const FALLBACK_MOVIES = [
  {
    id: "_roulette-1",
    title: "Интерстеллар",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    releaseDate: "2014-11-05T00:00:00.000Z",
    genres: [{ genre: { name: "Фантастика" } }, { genre: { name: "Драма" } }],
    ratings: [{ value: 9 }],
  },
  {
    id: "_roulette-2",
    title: "Dune: Part Two",
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    releaseDate: "2024-02-27T00:00:00.000Z",
    genres: [{ genre: { name: "Фантастика" } }, { genre: { name: "Приключения" } }],
    ratings: [{ value: 9 }],
  },
  {
    id: "_roulette-3",
    title: "Oppenheimer",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    releaseDate: "2023-07-19T00:00:00.000Z",
    genres: [{ genre: { name: "Драма" } }, { genre: { name: "История" } }],
    ratings: [{ value: 9 }],
  },
  {
    id: "_roulette-4",
    title: "The Batman",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7RHQpOJQjS0qOusrycN1.jpg",
    releaseDate: "2022-03-01T00:00:00.000Z",
    genres: [{ genre: { name: "Криминал" } }, { genre: { name: "Драма" } }],
    ratings: [{ value: 8 }],
  },
  {
    id: "_roulette-5",
    title: "Everything Everywhere All at Once",
    poster: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    releaseDate: "2022-03-24T00:00:00.000Z",
    genres: [{ genre: { name: "Комедия" } }, { genre: { name: "Фантастика" } }],
    ratings: [{ value: 9 }],
  },
  {
    id: "_roulette-6",
    title: "Parasite",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    releaseDate: "2019-05-30T00:00:00.000Z",
    genres: [{ genre: { name: "Триллер" } }, { genre: { name: "Драма" } }],
    ratings: [{ value: 9 }],
  },
  {
    id: "_roulette-7",
    title: "Blade Runner 2049",
    poster: "https://image.tmdb.org/t/p/w500/gajY2tTN9PIF47QsdGYZa52v8XA.jpg",
    releaseDate: "2017-10-04T00:00:00.000Z",
    genres: [{ genre: { name: "Фантастика" } }, { genre: { name: "Триллер" } }],
    ratings: [{ value: 9 }],
  },
  {
    id: "_roulette-8",
    title: "Mad Max: Fury Road",
    poster: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNh8bs43K8.jpg",
    releaseDate: "2015-05-13T00:00:00.000Z",
    genres: [{ genre: { name: "Боевик" } }, { genre: { name: "Фантастика" } }],
    ratings: [{ value: 9 }],
  },
  {
    id: "_roulette-9",
    title: "Whiplash",
    poster: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    releaseDate: "2014-10-10T00:00:00.000Z",
    genres: [{ genre: { name: "Драма" } }, { genre: { name: "Музыка" } }],
    ratings: [{ value: 9 }],
  },
  {
    id: "_roulette-10",
    title: "Joker",
    poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    releaseDate: "2019-10-01T00:00:00.000Z",
    genres: [{ genre: { name: "Криминал" } }, { genre: { name: "Триллер" } }],
    ratings: [{ value: 8 }],
  },
  {
    id: "_roulette-11",
    title: "Spider-Man: Into the Spider-Verse",
    poster: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    releaseDate: "2018-12-07T00:00:00.000Z",
    genres: [{ genre: { name: "Анимация" } }, { genre: { name: "Боевик" } }],
    ratings: [{ value: 9 }],
  },
  {
    id: "_roulette-12",
    title: "The Grand Budapest Hotel",
    poster: "https://image.tmdb.org/t/p/w500/eWDyPq7GFv2hLsMUH4bJkEgw0mO.jpg",
    releaseDate: "2014-02-26T00:00:00.000Z",
    genres: [{ genre: { name: "Комедия" } }, { genre: { name: "Драма" } }],
    ratings: [{ value: 8 }],
  },
];

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

    // Получаем фильмы — увеличен лимит до 200
    const movies = await prisma.movie.findMany({
      where,
      include: {
        genres: { include: { genre: true } },
        ratings: true,
        director: true,
      },
      orderBy: { popularity: "desc" },
      take: 200,
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

    // Если фильмов нет — возвращаем fallback
    if (filteredMovies.length === 0) {
      return NextResponse.json({ movies: FALLBACK_MOVIES, isFallback: true });
    }

    return NextResponse.json({ movies: serializeBigInt(filteredMovies) });
  } catch (error) {
    console.error("Roulette error:", error);
    // Even on error, return fallback so UI is never empty
    return NextResponse.json({ movies: FALLBACK_MOVIES, isFallback: true });
  }
}
