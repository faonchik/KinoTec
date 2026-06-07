import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { MovieFilters } from "@/components/movies/MovieFilters";
import { Pagination } from "@/components/ui/Pagination";
import { ExportMoviesButton } from "@/components/movies/ExportMoviesButton";

export const metadata: Metadata = {
  title: "Каталог фильмов",
  description: "Каталог фильмов с фильтрацией по жанрам, годам и сортировкой",
};

interface MoviesPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    genre?: string;
    year?: string;
    sort?: string;
  }>;
}

const MOVIES_PER_PAGE = 18;

async function getMovies(searchParams: MoviesPageProps["searchParams"]) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const skip = (page - 1) * MOVIES_PER_PAGE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (params.q) {
    const searchWords = params.q.trim().split(/\s+/).filter(word => word.length > 0);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orConditions: any[] = [
      { title: { contains: params.q, mode: "insensitive" } },
      { originalTitle: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { title: { startsWith: params.q, mode: "insensitive" } },
      { originalTitle: { startsWith: params.q, mode: "insensitive" } },
    ];

    searchWords.forEach((word) => {
      orConditions.push(
        { title: { contains: word, mode: "insensitive" } },
        { originalTitle: { contains: word, mode: "insensitive" } }
      );
    });

    where.OR = orConditions;
  }

  if (params.genre) {
    where.genres = {
      some: {
        genre: {
          slug: params.genre,
        },
      },
    };
  }

  if (params.year) {
    const year = parseInt(params.year);
    where.releaseDate = {
      gte: new Date(`${year}-01-01`),
      lt: new Date(`${year + 1}-01-01`),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { popularity: "desc" };

  switch (params.sort) {
    case "rating":
      orderBy = { ratings: { _count: "desc" } };
      break;
    case "releaseDate":
      orderBy = { releaseDate: "desc" };
      break;
    case "title":
      orderBy = { title: "asc" };
      break;
  }

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      skip,
      take: MOVIES_PER_PAGE,
      orderBy,
      include: {
        genres: { include: { genre: true } },
        ratings: true,
      },
    }),
    prisma.movie.count({ where }),
  ]);

  return {
    movies,
    total,
    totalPages: Math.ceil(total / MOVIES_PER_PAGE),
    currentPage: page,
  };
}

async function getGenres() {
  return await prisma.genre.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const [{ movies, total, totalPages, currentPage }, genres] = await Promise.all([
    getMovies(searchParams),
    getGenres(),
  ]);

  const params = await searchParams;
  const baseUrl = `/movies?${new URLSearchParams(
    Object.entries(params).filter(([key]) => key !== "page") as [string, string][]
  ).toString()}`;

  const startItem = (currentPage - 1) * MOVIES_PER_PAGE + 1;
  const endItem = Math.min(currentPage * MOVIES_PER_PAGE, total);

  return (
    <div className="min-h-full bg-[#0b0f14]">
      <div className="flex flex-col gap-4 px-4 pb-4 pt-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-12">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl">Каталог фильмов</h1>
          <p className="mt-1 text-sm text-white/45">
            {total > 0 ? `Найдено: ${total} фильмов` : "Фильмы не найдены"}
          </p>
        </div>
        <ExportMoviesButton queryParams={params} />
      </div>

      {/* Filters */}
      <div className="px-4 py-5 sm:px-8 lg:px-12">
        <MovieFilters genres={genres} />
      </div>

      {/* Movie Grid */}
      <div className="px-4 sm:px-8 lg:px-12">
        <MovieGrid movies={movies} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 px-4 py-6 pb-10 sm:flex-row sm:px-8 lg:px-12">
          <span className="hidden text-sm text-white/35 sm:block">
            Страница {currentPage} из {totalPages}
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
          />
          <span className="text-sm text-white/35">
            Показано {startItem}–{endItem} из {total}
          </span>
        </div>
      )}
    </div>
  );
}
