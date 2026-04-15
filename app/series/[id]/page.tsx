import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SeriesDetailClient } from "./SeriesDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const series = await prisma.series.findUnique({
    where: { id },
    select: { title: true, description: true },
  });

  if (!series) return { title: "Сериал не найден" };

  return {
    title: `${series.title} | КиноТека`,
    description: series.description?.substring(0, 160),
  };
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { id } = await params;

  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      genres: { include: { genre: true } },
      actors: {
        include: { actor: true },
        orderBy: { order: "asc" },
        // Показываем всех актёров
      },
      seasons: {
        include: {
          episodes: { orderBy: { episodeNumber: "asc" } },
        },
        orderBy: { seasonNumber: "asc" },
      },
      ratings: { select: { value: true, userId: true } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!series) {
    notFound();
  }

  // Похожие сериалы
  const genreIds = series.genres.map((g) => g.genreId);
  const similar = await prisma.series.findMany({
    where: {
      id: { not: series.id },
      genres: { some: { genreId: { in: genreIds } } },
    },
    take: 6,
    include: {
      ratings: { select: { value: true } },
    },
  });

  return <SeriesDetailClient series={series} similar={similar} />;
}

