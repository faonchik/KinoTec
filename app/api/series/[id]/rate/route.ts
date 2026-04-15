import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;
    const { value } = await request.json();

    if (!value || value < 1 || value > 10) {
      return NextResponse.json({ error: "Оценка должна быть от 1 до 10" }, { status: 400 });
    }

    // Проверяем существование сериала
    const series = await prisma.series.findUnique({
      where: { id },
    });

    if (!series) {
      return NextResponse.json({ error: "Сериал не найден" }, { status: 404 });
    }

    // Upsert рейтинга
    const rating = await prisma.seriesRating.upsert({
      where: {
        userId_seriesId: {
          userId: session.user.id,
          seriesId: id,
        },
      },
      update: { value },
      create: {
        userId: session.user.id,
        seriesId: id,
        value,
      },
    });

    // Начисляем монеты за первую оценку
    const isFirstRating = rating.createdAt.getTime() === rating.createdAt.getTime(); // Новая запись
    if (isFirstRating) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: {
            coins: { increment: 2 },
            totalCoinsEarned: { increment: 2 },
          },
        }),
        prisma.coinTransaction.create({
          data: {
            userId: session.user.id,
            amount: 2,
            type: "EARN_RATING",
            description: `Оценка сериала: ${series.title}`,
          },
        }),
      ]);
    }

    return NextResponse.json({ rating });
  } catch (error) {
    console.error("Rate series error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

