import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Проверить в списке просмотра
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ inWatchlist: false });
  }

  const { movieId } = await params;

  const watchlist = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: {
        userId: session.user.id,
        movieId,
      },
    },
  });

  return NextResponse.json({ inWatchlist: !!watchlist });
}

// Добавить в список просмотра
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
    await prisma.watchlist.create({
      data: {
        userId: session.user.id,
        movieId,
        type: "WANT_TO_WATCH",
      },
    });

    // Создаём активность
    await prisma.activity.create({
      data: {
        type: "ADDED_TO_WATCHLIST",
        userId: session.user.id,
        movieId,
      },
    });

    return NextResponse.json({ success: true, inWatchlist: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: true, inWatchlist: true });
    }
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

// Удалить из списка просмотра
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
    await prisma.watchlist.delete({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
    });

    return NextResponse.json({ success: true, inWatchlist: false });
  } catch {
    return NextResponse.json({ success: true, inWatchlist: false });
  }
}

