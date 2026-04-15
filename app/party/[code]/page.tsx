import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { PartyClient } from "./PartyClient";

interface PartyPageProps {
  params: Promise<{ code: string }>;
}

async function getParty(code: string) {
  const party = await prisma.watchParty.findUnique({
    where: { code },
    include: {
      movie: {
        select: {
          id: true,
          title: true,
          poster: true,
          originalTitle: true,
        },
      },
      host: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
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

  return party;
}

export async function generateMetadata({ params }: PartyPageProps): Promise<Metadata> {
  const { code } = await params;
  const party = await getParty(code);

  return {
    title: party ? `Watch Party: ${party.movie.title}` : "Watch Party",
    description: "Смотрите фильмы вместе с друзьями",
  };
}

export default async function PartyPage({ params }: PartyPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { code } = await params;
  const party = await getParty(code);

  if (!party || !party.isActive) {
    notFound();
  }

  // Добавляем пользователя в участники если его нет
  const isParticipant = party.participants.some(
    (p) => p.user.id === session.user.id
  );

  if (!isParticipant) {
    await prisma.watchPartyParticipant.create({
      data: {
        partyId: party.id,
        userId: session.user.id,
      },
    });
  }

  return (
    <PartyClient
      party={party}
      currentUserId={session.user.id}
      isHost={party.hostId === session.user.id}
    />
  );
}

