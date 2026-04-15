import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: followingId } = await params;
  const followerId = session.user.id;

  if (followerId === followingId) {
    return NextResponse.json({ error: "Нельзя подписаться на себя" }, { status: 400 });
  }

  try {
    // Проверяем существует ли пользователь
    const userExists = await prisma.user.findUnique({ where: { id: followingId } });
    if (!userExists) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // Создаём подписку
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Создаём активность
    await prisma.activity.create({
      data: {
        type: "FOLLOWED_USER",
        userId: followerId,
        metadata: { followingId, followingName: userExists.name },
      },
    });

    return NextResponse.json({ follow });
  } catch (error: unknown) {
    // Если уже подписан
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Уже подписаны" }, { status: 400 });
    }
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: followingId } = await params;
  const followerId = session.user.id;

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

