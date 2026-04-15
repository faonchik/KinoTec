import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PartySettingsClient } from "./PartySettingsClient";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function PartySettingsPage({ params }: PageProps) {
  const { code } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const party = await prisma.watchParty.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      movie: { select: { id: true, title: true, poster: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });

  if (!party) {
    notFound();
  }

  // Только хост может редактировать
  if (party.hostId !== session.user.id) {
    redirect(`/party/${code}`);
  }

  return <PartySettingsClient party={party} />;
}

