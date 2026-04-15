import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { CreatePartyClient } from "./CreatePartyClient";

export const metadata: Metadata = {
  title: "Создать Watch Party",
  description: "Смотрите фильмы вместе с друзьями",
};

async function getMovies() {
  return await prisma.movie.findMany({
    select: {
      id: true,
      title: true,
      poster: true,
    },
    orderBy: { title: "asc" },
    take: 100,
  });
}

export default async function CreatePartyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const movies = await getMovies();

  return <CreatePartyClient movies={movies} />;
}

