import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { RouletteClient } from "./RouletteClient";

export const metadata: Metadata = {
  title: "КиноРулетка",
  description: "Не знаете что посмотреть? Покрутите рулетку!",
};

async function getGenres() {
  return await prisma.genre.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function RoulettePage() {
  const genres = await getGenres();

  return <RouletteClient genres={genres} />;
}
