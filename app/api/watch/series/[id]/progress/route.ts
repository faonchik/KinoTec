import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const { id: seriesId } = await params;
  const body = await request.json().catch(() => ({}));
  const season = Number(body.season);
  const episode = Number(body.episode);

  if (!Number.isFinite(season) || season < 1 || !Number.isFinite(episode) || episode < 1) {
    return NextResponse.json({ error: "Некорректные season / episode" }, { status: 400 });
  }

  try {
    await prisma.seriesWatchHistory.upsert({
      where: {
        userId_seriesId: {
          userId: session.user.id,
          seriesId,
        },
      },
      update: {
        lastSeasonNum: season,
        lastEpisodeNum: episode,
        lastWatched: new Date(),
      },
      create: {
        userId: session.user.id,
        seriesId,
        lastSeasonNum: season,
        lastEpisodeNum: episode,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сохранения прогресса" }, { status: 500 });
  }
}
