import { prisma } from "@/lib/prisma";
import { SeriesListClient } from "./SeriesListClient";

export const metadata = {
  title: "Сериалы | КиноТека",
  description: "Каталог сериалов с рейтингами и отзывами",
};

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

