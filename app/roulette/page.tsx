import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { RouletteClient } from "./RouletteClient";

import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("roulette");
  return {
    title: t("title") || "КиноРулетка",
    description: t("subtitle") || "Не знаете что посмотреть? Покрутите рулетку!",
  };
}

async function getGenres() {
  return await prisma.genre.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function RoulettePage() {
  const genres = await getGenres();

  return <RouletteClient genres={genres} />;
}
