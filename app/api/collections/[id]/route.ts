import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { checkResourceModification } from "@/lib/security/idor";
import { validateId } from "@/lib/security/validation";
import { sanitizeRequestBody } from "@/lib/security/requestSanitizer";
import { validateMassOperation } from "@/lib/security/massOperation";
import { sanitizeText } from "@/lib/security/sanitize";

// Получить подборку
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        movies: {
          include: {
            movie: {
              include: {
                genres: { include: { genre: true } },
                ratings: true,
                director: true,
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
    });

    if (!collection) {
      return NextResponse.json({ error: "Подборка не найдена" }, { status: 404 });
    }

    // Проверяем доступ
    if (!collection.isPublic && collection.userId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id !== collection.userId) {
        return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
      }
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Get collection error:", error);
    return NextResponse.json({ error: "Ошибка получения подборки" }, { status: 500 });
  }
}

// Обновить подборку
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Валидация ID
  if (!validateId(id)) {
    return NextResponse.json({ error: "Неверный формат ID" }, { status: 400 });
  }

  try {
    // Проверка прав через IDOR защиту
    const hasAccess = await checkResourceModification("collection", id, session.user.id, request);
    if (!hasAccess) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json({ error: "Подборка не найдена" }, { status: 404 });
    }

    const rawBody = await request.json();

    // Санитизация тела запроса
    const { sanitized: body, warnings } = sanitizeRequestBody(rawBody, request);
    if (warnings.length > 0) {
      console.warn("Request sanitization warnings:", warnings);
    }

    const { title, description, cover, isPublic, movieIds } = body;

    // Валидация и санитизация
    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Название не может быть пустым" }, { status: 400 });
      }
      const sanitizedTitle = sanitizeText(title.trim());
      if (sanitizedTitle.length > 100) {
        return NextResponse.json(
          { error: "Название слишком длинное (максимум 100 символов)" },
          { status: 400 }
        );
      }
      updateData.title = sanitizedTitle;
    }

    if (description !== undefined) {
      if (description === null || description === "") {
        updateData.description = null;
      } else if (typeof description === "string") {
        const sanitizedDescription = sanitizeText(description.trim());
        if (sanitizedDescription.length > 500) {
          return NextResponse.json(
            { error: "Описание слишком длинное (максимум 500 символов)" },
            { status: 400 }
          );
        }
        updateData.description = sanitizedDescription;
      }
    }

    if (cover !== undefined) {
      updateData.cover = cover || null;
    }

    if (isPublic !== undefined) {
      updateData.isPublic = Boolean(isPublic);
    }

    if (movieIds && Array.isArray(movieIds)) {
      // Защита от массовых операций
      const massCheck = validateMassOperation(movieIds, "BATCH_UPDATE", request);
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

      updateData.movies = {
        deleteMany: {},
        create: movieIds.map((movieId: string, index: number) => ({
          movieId,
          order: index,
        })),
      };
    }

    const updated = await prisma.collection.update({
      where: { id },
      data: updateData,
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
      },
    });

    return NextResponse.json({ collection: updated });
  } catch (error) {
    console.error("Update collection error:", error);
    return NextResponse.json({ error: "Ошибка обновления подборки" }, { status: 500 });
  }
}

// Удалить подборку
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Валидация ID
  if (!validateId(id)) {
    return NextResponse.json({ error: "Неверный формат ID" }, { status: 400 });
  }

  try {
    // Проверка прав через IDOR защиту
    const hasAccess = await checkResourceModification("collection", id, session.user.id, request);
    if (!hasAccess) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json({ error: "Подборка не найдена" }, { status: 404 });
    }

    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete collection error:", error);
    return NextResponse.json({ error: "Ошибка удаления подборки" }, { status: 500 });
  }
}

