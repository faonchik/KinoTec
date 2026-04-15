import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { code } = await params;
    
    const party = await prisma.watchParty.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        participants: true,
      },
    });

    if (!party) {
      return NextResponse.json({ error: "Комната не найдена" }, { status: 404 });
    }

    if (!party.isActive) {
      return NextResponse.json({ error: "Комната закрыта" }, { status: 400 });
    }

    // Проверяем лимит участников
    if (party.participants.length >= party.maxUsers) {
      return NextResponse.json({ error: "Комната полна" }, { status: 400 });
    }

    // Проверяем пароль для закрытых комнат
    if (!party.isPublic && party.password) {
      const body = await request.json().catch(() => ({}));
      if (body.password !== party.password) {
        return NextResponse.json({ error: "Неверный пароль" }, { status: 403 });
      }
    }

    // Проверяем, не присоединился ли уже
    const existingParticipant = party.participants.find(
      (p) => p.userId === session.user.id
    );

    if (existingParticipant) {
      return NextResponse.json({ success: true, alreadyJoined: true });
    }

    // Добавляем участника
    await prisma.watchPartyParticipant.create({
      data: {
        partyId: party.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Join party error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

