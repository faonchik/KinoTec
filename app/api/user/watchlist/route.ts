import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";


const watchlistSchema = z.object({
  movieId: z.string(),
  type: z.enum(["WANT_TO_WATCH", "WATCHING", "WATCHED"]),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const watchlist = await prisma.watchlist.findMany({
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

    return NextResponse.json(watchlist);
  } catch (error) {
    console.error("Watchlist fetch error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении списка" },
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

    const body = await request.json();
    const validated = watchlistSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { movieId, type } = validated.data;

    const watchlistItem = await prisma.watchlist.upsert({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
      update: { type },
      create: {
        userId: session.user.id,
        movieId,
        type,
      },
    });

    try {
      revalidatePath("/profile");
      revalidatePath(`/movies/${movieId}`);
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json(watchlistItem, { status: 201 });
  } catch (error) {
    console.error("Watchlist add error:", error);
    return NextResponse.json(
      { error: "Ошибка при добавлении в список" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { movieId } = await request.json();

    if (!movieId) {
      return NextResponse.json({ error: "ID фильма обязателен" }, { status: 400 });
    }

    await prisma.watchlist.delete({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
    });

    try {
      revalidatePath("/profile");
      revalidatePath(`/movies/${movieId}`);
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watchlist remove error:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении из списка" },
      { status: 500 }
    );
  }
}

