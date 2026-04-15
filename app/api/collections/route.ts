import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { rateLimits } from "@/lib/security/rateLimit";
import { sanitizeText } from "@/lib/security/sanitize";
// sanitizeRequestBody — доступен при необходимости
import { validateMassOperation } from "@/lib/security/massOperation";
import { validateId, collectionSchema } from "@/lib/security/validation";

// Получить подборки пользователя
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || session?.user?.id;
  const publicOnly = searchParams.get("public") === "true";

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const collections = await prisma.collection.findMany({
      where: {
        userId,
        ...(publicOnly ? { isPublic: true } : {}),
      },
      include: {
        movies: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                poster: true,
                releaseDate: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Get collections error:", error);
    return NextResponse.json({ error: "Ошибка получения подборок" }, { status: 500 });
  }
}

// Создать подборку
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const limitResult = await rateLimits.create(request);
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
    const body = await request.json();

    // Валидация
    const validated = collectionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { cover, isPublic, movieIds } = validated.data;
    let { title, description } = validated.data;

    // Санитизация
    title = sanitizeText(title.trim());
    if (description) {
      description = sanitizeText(description.trim());
    }

    // Валидация movieIds
    if (movieIds && Array.isArray(movieIds)) {
      // Защита от массовых операций
      const massCheck = validateMassOperation(movieIds, "BATCH_CREATE", request);
      if (!massCheck.valid) {
        return NextResponse.json({ error: massCheck.error }, { status: 400 });
      }

      // Валидация всех ID
      for (const movieId of movieIds) {
        if (!validateId(movieId)) {
          return NextResponse.json(
            { error: `Неверный формат ID фильма: ${movieId}` },
            { status: 400 }
          );
        }
      }
    }

    // Генерация slug из title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100) + `-${Date.now()}`;

    const collection = await prisma.collection.create({
      data: {
        title,
        slug,
        description: description || null,
        cover: cover || null,
        isPublic: isPublic || false,
        userId: session.user.id,
        movies: {
          create: (movieIds || []).map((movieId: string, index: number) => ({
            movieId,
            order: index,
          })),
        },
      },
      include: {
        movies: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                poster: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json({ error: "Ошибка создания подборки" }, { status: 500 });
  }
}

