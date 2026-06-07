import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { rateLimits } from "@/lib/security/rateLimit";
import { sanitizeText } from "@/lib/security/sanitize";

export async function GET(request: NextRequest) {
  // Rate limiting
  const limitResult = await rateLimits.search(request);
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    let query = searchParams.get("q");
    const genre = searchParams.get("genre");
    const year = searchParams.get("year");
    let limit = parseInt(searchParams.get("limit") || "20");
    let offset = parseInt(searchParams.get("offset") || "0");

    // Валидация и санитизация
    if (query) {
      query = sanitizeText(query);
      if (query.length > 100) {
        return NextResponse.json(
          { error: "Поисковый запрос слишком длинный (максимум 100 символов)" },
          { status: 400 }
        );
      }
    }

    // Ограничение limit и offset
    limit = Math.min(Math.max(1, limit), 100);
    offset = Math.max(0, offset);

    const where: Prisma.MovieWhereInput = {};

    if (query) {
      // Разбиваем запрос на слова для более гибкого поиска
      const searchWords = query.trim().split(/\s+/).filter(word => word.length > 0);
      
      const orConditions: Prisma.MovieWhereInput[] = [
        // Поиск по полному запросу
        { title: { contains: query, mode: "insensitive" } },
        { originalTitle: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        // Поиск по началу слова
        { title: { startsWith: query, mode: "insensitive" } },
        { originalTitle: { startsWith: query, mode: "insensitive" } },
        {
          actors: {
            some: {
              actor: {
                name: { contains: query, mode: "insensitive" },
              },
            },
          },
        },
        {
          director: {
            name: { contains: query, mode: "insensitive" },
          },
        },
      ];

      // Добавляем поиск по каждому слову отдельно
      searchWords.forEach((word) => {
        orConditions.push(
          { title: { contains: word, mode: "insensitive" } },
          { originalTitle: { contains: word, mode: "insensitive" } }
        );
      });

      where.OR = orConditions;
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

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
        orderBy: { popularity: "desc" },
      }),
      prisma.movie.count({ where }),
    ]);

    return NextResponse.json({
      movies,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Ошибка при поиске" },
      { status: 500 }
    );
  }
}

