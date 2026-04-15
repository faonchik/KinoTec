import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;

  try {
    const party = await prisma.watchParty.findUnique({
      where: { code },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
          take: 100,
        },
      },
    });

    if (!party) {
      return NextResponse.json({ error: "Пати не найдено" }, { status: 404 });
    }

    return NextResponse.json({
      isPlaying: party.isPlaying,
      currentTime: party.currentTime,
      participants: party.participants,
      messages: party.messages,
    });
  } catch (error) {
    console.error("Get status error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

