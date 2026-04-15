import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "all";
  const genres = searchParams.get("genres")?.split(",").filter(Boolean);
  const year = searchParams.get("year");
  const country = searchParams.get("country");
  const minRating = parseInt(searchParams.get("minRating") || "0");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results: Array<{
    id: string;
    type: "movie" | "actor" | "director";
    title: string;
    subtitle?: string;
    image?: string;
    year?: number;
    genres?: string[];
    rating?: number;
  }> = [];

  try {
    // Разбиваем запрос на слова для более гибкого поиска
    const searchWords = query.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Поиск фильмов
    if (type === "all" || type === "movies") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orConditions: any[] = [
        // Поиск по полному запросу
        { title: { contains: query, mode: "insensitive" } },
        { originalTitle: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        // Поиск по началу слова (startsWith)
        { title: { startsWith: query, mode: "insensitive" } },
        { originalTitle: { startsWith: query, mode: "insensitive" } },
      ];

      // Добавляем поиск по каждому слову отдельно
      searchWords.forEach((word) => {
        orConditions.push(
          { title: { contains: word, mode: "insensitive" } },
          { originalTitle: { contains: word, mode: "insensitive" } }
        );
      });

      const movieWhere: any = {
        OR: orConditions,
      };

      if (genres?.length) {
        movieWhere.genres = {
          some: { genre: { slug: { in: genres } } },
        };
      }

      if (year) {
        const yearNum = parseInt(year);
        movieWhere.releaseDate = {
          gte: new Date(`${yearNum}-01-01`),
          lt: new Date(`${yearNum + 1}-01-01`),
        };
      }

      if (country) {
        movieWhere.country = { contains: country, mode: "insensitive" };
      }

      const movies = await prisma.movie.findMany({
        where: movieWhere,
        include: {
          genres: { include: { genre: true } },
          ratings: true,
          director: true,
        },
        take: 20,
        orderBy: { popularity: "desc" },
      });

      for (const movie of movies) {
        const avgRating = movie.ratings.length
          ? movie.ratings.reduce((acc, r) => acc + r.value, 0) / movie.ratings.length
          : null;

        // Фильтр по рейтингу
        if (minRating > 0 && (!avgRating || avgRating < minRating)) {
          continue;
        }

        results.push({
          id: movie.id,
          type: "movie",
          title: movie.title,
          subtitle: [
            movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : null,
            movie.director?.name,
          ].filter(Boolean).join(" • "),
          image: movie.poster || undefined,
          year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined,
          genres: movie.genres.map((g) => g.genre.name),
          rating: avgRating || undefined,
        });
      }
    }

    // Поиск актёров
    if (type === "all" || type === "actors") {
      const actorOrConditions: any[] = [
        { name: { contains: query, mode: "insensitive" } },
        { name: { startsWith: query, mode: "insensitive" } },
      ];

      // Добавляем поиск по каждому слову
      searchWords.forEach((word) => {
        actorOrConditions.push({ name: { contains: word, mode: "insensitive" } });
      });

      const actors = await prisma.actor.findMany({
        where: {
          OR: actorOrConditions,
        },
        include: {
          _count: { select: { movies: true } },
        },
        take: 10,
      });

      for (const actor of actors) {
        results.push({
          id: actor.id,
          type: "actor",
          title: actor.name,
          subtitle: `${actor._count.movies} фильмов`,
          image: actor.photo || undefined,
        });
      }
    }

    // Поиск режиссёров
    if (type === "all" || type === "directors") {
      const directorOrConditions: any[] = [
        { name: { contains: query, mode: "insensitive" } },
        { name: { startsWith: query, mode: "insensitive" } },
      ];

      // Добавляем поиск по каждому слову
      searchWords.forEach((word) => {
        directorOrConditions.push({ name: { contains: word, mode: "insensitive" } });
      });

      const directors = await prisma.director.findMany({
        where: {
          OR: directorOrConditions,
        },
        include: {
          _count: { select: { movies: true } },
        },
        take: 10,
      });

      for (const director of directors) {
        results.push({
          id: director.id,
          type: "director",
          title: director.name,
          subtitle: `${director._count.movies} фильмов`,
          image: director.photo || undefined,
        });
      }
    }

    // Сортировка: фильмы с рейтингом первые
    results.sort((a, b) => {
      if (a.rating && !b.rating) return -1;
      if (!a.rating && b.rating) return 1;
      if (a.rating && b.rating) return b.rating - a.rating;
      return 0;
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Ошибка поиска" }, { status: 500 });
  }
}

