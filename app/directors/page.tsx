import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Режиссёры",
  description: "Список режиссёров в базе КиноТеки",
};

export const dynamic = "force-dynamic";

interface DirectorsPageProps {
  searchParams: Promise<{ page?: string }>;
}

const DIRECTORS_PER_PAGE = 24;

async function getDirectors(page: number) {
  const skip = (page - 1) * DIRECTORS_PER_PAGE;

  const [directors, total] = await Promise.all([
    prisma.director.findMany({
      skip,
      take: DIRECTORS_PER_PAGE,
      include: {
        _count: { select: { movies: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.director.count(),
  ]);

  return {
    directors,
    total,
    totalPages: Math.ceil(total / DIRECTORS_PER_PAGE),
  };
}

export default async function DirectorsPage({ searchParams }: DirectorsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const { directors, total, totalPages } = await getDirectors(page);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Режиссёры</h1>
        <p className="text-slate-400">Всего режиссёров: {total}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {directors.map((director) => (
          <Link
            key={director.id}
            href={`/directors/${director.id}`}
            className="group text-center"
          >
            <div className="relative mb-4">
              {director.photo ? (
                <Image
                  src={director.photo}
                  alt={director.name}
                  width={200}
                  height={200}
                  className="w-full aspect-square object-cover rounded-full border-4 border-slate-700 group-hover:border-amber-500 transition-colors"
                />
              ) : (
                <div className="w-full aspect-square rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 group-hover:border-amber-500 transition-colors">
                  <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
              {director.name}
            </h3>
            <p className="text-sm text-slate-400">
              {director._count.movies} {director._count.movies === 1 ? "фильм" : "фильмов"}
            </p>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/directors"
          />
        </div>
      )}
    </div>
  );
}

