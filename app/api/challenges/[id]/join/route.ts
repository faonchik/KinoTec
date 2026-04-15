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

  const { id: challengeId } = await params;

  try {
    // Проверяем существование челленджа
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Челлендж не найден" }, { status: 404 });
    }

    if (!challenge.isActive) {
      return NextResponse.json({ error: "Челлендж неактивен" }, { status: 400 });
    }

    // Присоединяемся
    const userChallenge = await prisma.userChallenge.create({
      data: {
        userId: session.user.id,
        challengeId,
      },
    });

    return NextResponse.json({ userChallenge });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Вы уже участвуете" }, { status: 400 });
    }
    console.error("Join challenge error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

