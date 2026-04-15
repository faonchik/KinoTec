import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { SearchClient } from "./SearchClient";

export const metadata: Metadata = {
  title: "Поиск",
  description: "Поиск фильмов, актёров и режиссёров",
};

async function getGenres() {
  return await prisma.genre.findMany({ orderBy: { name: "asc" } });
}

async function getYears() {
  const movies = await prisma.movie.findMany({
    where: { releaseDate: { not: null } },
    select: { releaseDate: true },
    distinct: ["releaseDate"],
  });
  
  const years = [...new Set(
    movies
      .filter((m) => m.releaseDate)
      .map((m) => new Date(m.releaseDate!).getFullYear())
  )].sort((a, b) => b - a);
  
  return years;
}

async function getCountries() {
  const movies = await prisma.movie.findMany({
    where: { country: { not: null } },
    select: { country: true },
    distinct: ["country"],
  });
  
  return movies
    .map((m) => m.country!)
    .filter(Boolean)
    .sort();
}

export default async function SearchPage() {
  const [genres, years, countries] = await Promise.all([
    getGenres(),
    getYears(),
    getCountries(),
  ]);

  return <SearchClient genres={genres} years={years} countries={countries} />;
}
