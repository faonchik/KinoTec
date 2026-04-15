import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { code } = await params;
    const body = await request.json();
    const { name, isPublic, password, maxUsers } = body;

    const party = await prisma.watchParty.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!party) {
      return NextResponse.json({ error: "Комната не найдена" }, { status: 404 });
    }

    if (party.hostId !== session.user.id) {
      return NextResponse.json({ error: "Только хост может изменять настройки" }, { status: 403 });
    }

    const updated = await prisma.watchParty.update({
      where: { id: party.id },
      data: {
        name,
        isPublic,
        password: isPublic ? null : password,
        maxUsers: Math.min(Math.max(maxUsers || 10, 2), 50),
      },
    });

    return NextResponse.json({ party: updated });
  } catch (error) {
    console.error("Party settings error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

