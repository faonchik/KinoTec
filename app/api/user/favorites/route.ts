import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            ratings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites.map((f) => f.movie));
  } catch (error) {
    console.error("Favorites fetch error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении избранного" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { movieId } = await request.json();

    if (!movieId) {
      return NextResponse.json({ error: "ID фильма обязателен" }, { status: 400 });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      try {
        revalidatePath("/profile");
        revalidatePath(`/movies/${movieId}`);
      } catch (e) {
        console.error("Revalidation error:", e);
      }
      return NextResponse.json({ action: "removed" });
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          movieId,
        },
      });
      try {
        revalidatePath("/profile");
        revalidatePath(`/movies/${movieId}`);
      } catch (e) {
        console.error("Revalidation error:", e);
      }
      return NextResponse.json({ action: "added" }, { status: 201 });
    }
  } catch (error) {
    console.error("Favorite toggle error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении избранного" },
      { status: 500 }
    );
  }
}

