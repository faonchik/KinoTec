import { Metadata } from "next";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { SearchClient } from "./SearchClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return {
    title: t("search") || "Поиск",
    description: t("searchAdvanced") || "Поиск фильмов, актёров и режиссёров",
  };
}

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
  const t = await getTranslations("common");
  const [genres, years, countries] = await Promise.all([
    getGenres(),
    getYears(),
    getCountries(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-slate-900 text-white/50">
          {t("loading")}
        </div>
      }
    >
      <SearchClient genres={genres} years={years} countries={countries} />
    </Suspense>
  );
}
