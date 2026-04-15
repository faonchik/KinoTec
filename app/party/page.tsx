import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PartyListClient } from "./PartyListClient";

export const metadata = {
  title: "Совместный просмотр | КиноТека",
  description: "Смотрите фильмы вместе с друзьями",
};

export default async function PartyListPage() {
  const session = await getServerSession(authOptions);

  // Получаем активные публичные комнаты
  const parties = await prisma.watchParty.findMany({
    where: {
      isActive: true,
    },
    include: {
      host: {
        select: { id: true, name: true, avatar: true },
      },
      movie: {
        select: { id: true, title: true, poster: true },
      },
      participants: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Мои комнаты (если авторизован)
  const myParties = session?.user?.id
    ? await prisma.watchParty.findMany({
        where: {
          hostId: session.user.id,
        },
        include: {
          movie: { select: { id: true, title: true, poster: true } },
          participants: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <PartyListClient
      parties={parties}
      myParties={myParties}
      currentUserId={session?.user?.id || null}
      isAuthenticated={!!session}
    />
  );
}

