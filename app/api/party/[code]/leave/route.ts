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
    });

    if (!party) {
      return NextResponse.json({ error: "Комната не найдена" }, { status: 404 });
    }

    // Если хост выходит - закрываем комнату
    if (party.hostId === session.user.id) {
      await prisma.watchParty.update({
        where: { id: party.id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, closed: true });
    }

    // Удаляем участника
    await prisma.watchPartyParticipant.deleteMany({
      where: {
        partyId: party.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave party error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

