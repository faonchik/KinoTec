import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Сообщение пустое" }, { status: 400 });
  }

  try {
    const party = await prisma.watchParty.findUnique({
      where: { code },
    });

    if (!party || !party.isActive) {
      return NextResponse.json({ error: "Пати не найдено" }, { status: 404 });
    }

    const message = await prisma.watchPartyMessage.create({
      data: {
        content: content.trim(),
        partyId: party.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

