import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Получить историю изменений рейтинга фильма
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: movieId } = await params;

  try {
    // Получаем все рейтинги фильма с историей
    const ratings = await prisma.rating.findMany({
      where: { movieId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Формируем историю изменений
    const history = ratings.flatMap((rating) => {
      if (rating.history.length === 0) {
        // Если нет истории, но есть рейтинг - это первая оценка
        return [{
          ratingId: rating.id,
          user: rating.user,
          oldValue: null,
          newValue: rating.value,
          createdAt: rating.createdAt,
        }];
      }
      return rating.history.map((h) => ({
        ratingId: rating.id,
        user: rating.user,
        oldValue: h.oldValue,
        newValue: h.newValue,
        createdAt: h.createdAt,
      }));
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Get rating history error:", error);
    return NextResponse.json({ error: "Ошибка получения истории" }, { status: 500 });
  }
}

