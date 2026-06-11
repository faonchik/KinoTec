import { prisma } from "@/lib/prisma";
import { SeriesListClient } from "./SeriesListClient";

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("series");
  return {
    title: t("seoTitle") || "Сериалы | КиноТека",
    description: t("seoDescription") || "Каталог сериалов с рейтингами и отзывами",
  };
}

export default async function SeriesPage() {
  const series = await prisma.series.findMany({
    take: 50,
    orderBy: { popularity: "desc" },
    include: {
      genres: { include: { genre: true } },
      seasons: { select: { id: true } },
      ratings: { select: { value: true } },
    },
  });

  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
  });

  return <SeriesListClient series={series} genres={genres} />;
}

