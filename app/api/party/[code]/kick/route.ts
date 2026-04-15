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
    const { userId } = await request.json();

    const party = await prisma.watchParty.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!party) {
      return NextResponse.json({ error: "Комната не найдена" }, { status: 404 });
    }

    if (party.hostId !== session.user.id) {
      return NextResponse.json({ error: "Только хост может выгонять участников" }, { status: 403 });
    }

    // Нельзя выгнать хоста
    if (userId === party.hostId) {
      return NextResponse.json({ error: "Нельзя выгнать хоста" }, { status: 400 });
    }

    await prisma.watchPartyParticipant.deleteMany({
      where: {
        partyId: party.id,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kick user error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

