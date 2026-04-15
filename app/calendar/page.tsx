import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { CalendarClient } from "./CalendarClient";

export const metadata: Metadata = {
  title: "Календарь премьер",
  description: "Узнайте о предстоящих премьерах фильмов",
};

async function getUpcomingMovies() {
  const now = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const movies = await prisma.movie.findMany({
    where: {
      releaseDate: {
        gte: now,
        lte: threeMonthsLater,
      },
    },
    include: {
      genres: { include: { genre: true } },
      director: true,
    },
    orderBy: { releaseDate: "asc" },
  });

  return movies;
}

async function getRecentReleases() {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const movies = await prisma.movie.findMany({
    where: {
      releaseDate: {
        gte: oneMonthAgo,
        lt: now,
      },
    },
    include: {
      genres: { include: { genre: true } },
      director: true,
      ratings: true,
    },
    orderBy: { releaseDate: "desc" },
    take: 10,
  });

  return movies;
}

export default async function CalendarPage() {
  const [upcoming, recent] = await Promise.all([
    getUpcomingMovies(),
    getRecentReleases(),
  ]);

  return <CalendarClient upcoming={upcoming} recent={recent} />;
}

