import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json"; // json или csv
  const type = searchParams.get("type") || "all"; // all, watchlist, favorites, watched

  try {
    const data: Record<string, unknown> = {};

    if (type === "all" || type === "watchlist") {
      const watchlist = await prisma.watchlist.findMany({
        where: { userId: session.user.id },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              originalTitle: true,
              releaseDate: true,
              runtime: true,
              poster: true,
            },
          },
        },
      });
      data.watchlist = watchlist.map((w) => ({
        type: w.type,
        addedAt: w.createdAt,
        movie: w.movie,
      }));
    }

    if (type === "all" || type === "favorites") {
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              originalTitle: true,
              releaseDate: true,
              runtime: true,
              poster: true,
            },
          },
        },
      });
      data.favorites = favorites.map((f) => ({
        addedAt: f.createdAt,
        movie: f.movie,
      }));
    }

    if (type === "all" || type === "watched") {
      const watched = await prisma.watchHistory.findMany({
        where: { userId: session.user.id, completed: true },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              originalTitle: true,
              releaseDate: true,
              runtime: true,
              poster: true,
            },
          },
        },
      });
      data.watched = watched.map((w) => ({
        completed: w.completed,
        lastWatched: w.lastWatched,
        movie: w.movie,
      }));
    }

    if (type === "all") {
      const ratings = await prisma.rating.findMany({
        where: { userId: session.user.id },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
      data.ratings = ratings.map((r) => ({
        value: r.value,
        createdAt: r.createdAt,
        movie: r.movie,
      }));
    }

    if (format === "csv") {
      // Генерируем CSV
      const csvRows: string[] = [];
      
      if (data.watchlist) {
        csvRows.push("Type,Title,Original Title,Release Date,Runtime,Added At");
        data.watchlist.forEach((item: any) => {
          csvRows.push(
            `${item.type},"${item.movie.title}","${item.movie.originalTitle || ""}",${item.movie.releaseDate || ""},${item.movie.runtime || ""},${item.addedAt}`
          );
        });
      }

      const csv = csvRows.join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="kinoteka-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON формат
    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="kinoteka-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Ошибка экспорта" }, { status: 500 });
  }
}

