import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Проверить в избранном
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ isFavorite: false });
  }

  const { movieId } = await params;

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_movieId: {
        userId: session.user.id,
        movieId,
      },
    },
  });

  return NextResponse.json({ isFavorite: !!favorite });
}

// Добавить в избранное
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId } = await params;

  try {
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        movieId,
      },
    });

    // Создаём активность
    await prisma.activity.create({
      data: {
        type: "ADDED_TO_FAVORITES",
        userId: session.user.id,
        movieId,
      },
    });

    return NextResponse.json({ success: true, isFavorite: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: true, isFavorite: true });
    }
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

// Удалить из избранного
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId } = await params;

  try {
    await prisma.favorite.delete({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
    });

    return NextResponse.json({ success: true, isFavorite: false });
  } catch {
    return NextResponse.json({ success: true, isFavorite: false });
  }
}

