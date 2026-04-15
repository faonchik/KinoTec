import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { validateMassOperation } from "@/lib/security/massOperation";
import { logSecurityEvent } from "@/lib/security/logger";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, type } = body; // type: watchlist, favorites, ratings

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Неверный формат данных" }, { status: 400 });
    }

    // Защита от массовых операций
    const massCheck = validateMassOperation(data, "BATCH_IMPORT", request);
    if (!massCheck.valid) {
      return NextResponse.json({ error: massCheck.error }, { status: 400 });
    }

    let imported = 0;
    let errors = 0;

    for (const item of data) {
      try {
        // Ищем фильм по названию или ID
        let movie = null;
        
        if (item.movieId) {
          movie = await prisma.movie.findUnique({ where: { id: item.movieId } });
        } else if (item.title) {
          movie = await prisma.movie.findFirst({
            where: {
              OR: [
                { title: { contains: item.title, mode: "insensitive" } },
                { originalTitle: { contains: item.title, mode: "insensitive" } },
              ],
            },
          });
        }

        if (!movie) {
          errors++;
          continue;
        }

        if (type === "watchlist") {
          await prisma.watchlist.upsert({
            where: {
              userId_movieId: {
                userId: session.user.id,
                movieId: movie.id,
              },
            },
            create: {
              userId: session.user.id,
              movieId: movie.id,
              type: item.type || "WANT_TO_WATCH",
            },
            update: {},
          });
          imported++;
        } else if (type === "favorites") {
          await prisma.favorite.upsert({
            where: {
              userId_movieId: {
                userId: session.user.id,
                movieId: movie.id,
              },
            },
            create: {
              userId: session.user.id,
              movieId: movie.id,
            },
            update: {},
          });
          imported++;
        } else if (type === "ratings" && item.value) {
          await prisma.rating.upsert({
            where: {
              userId_movieId: {
                userId: session.user.id,
                movieId: movie.id,
              },
            },
            create: {
              userId: session.user.id,
              movieId: movie.id,
              value: Math.max(1, Math.min(10, item.value)),
            },
            update: {
              value: Math.max(1, Math.min(10, item.value)),
            },
          });
          imported++;
        }
      } catch (error) {
        errors++;
        console.error("Import item error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors,
      message: `Импортировано: ${imported}, ошибок: ${errors}`,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Ошибка импорта" }, { status: 500 });
  }
}

