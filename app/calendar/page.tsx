import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { CalendarClient } from "./CalendarClient";

export const metadata: Metadata = {
  title: "Календарь премьер",
  description: "Узнайте о предстоящих премьерах фильмов",
};

/** Широкий диапазон дат: календарь и виджеты не пустые при типичном каталоге с разными годами релиза. */
async function getMoviesForPremiereCalendar() {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 20);
  const end = new Date();
  end.setFullYear(end.getFullYear() + 3);

  return prisma.movie.findMany({
    where: {
      releaseDate: {
        not: null,
        gte: start,
        lte: end,
      },
    },
    include: {
      genres: { include: { genre: true } },
      director: true,
      ratings: true,
    },
    orderBy: { releaseDate: "asc" },
  });
}

export default async function CalendarPage() {
  const all = await getMoviesForPremiereCalendar();
  const now = new Date();
  const upcoming = all.filter((m) => m.releaseDate && m.releaseDate >= now);
  const recent = all.filter((m) => m.releaseDate && m.releaseDate < now);

  return <CalendarClient upcoming={upcoming} recent={recent} />;
}
