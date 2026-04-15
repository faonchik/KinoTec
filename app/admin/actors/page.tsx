import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Управление актёрами",
};

interface AdminActorsPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

const ACTORS_PER_PAGE = 20;

async function getActors(page: number, query?: string) {
  const skip = (page - 1) * ACTORS_PER_PAGE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }

  const [actors, total] = await Promise.all([
    prisma.actor.findMany({
      where,
      skip,
      take: ACTORS_PER_PAGE,
      include: {
        _count: { select: { movies: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.actor.count({ where }),
  ]);

  return {
    actors,
    total,
    totalPages: Math.ceil(total / ACTORS_PER_PAGE),
  };
}

export default async function AdminActorsPage({ searchParams }: AdminActorsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const query = params.q;

  const { actors, total, totalPages } = await getActors(page, query);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Управление актёрами</h1>
        <p className="text-slate-400 mt-1">Всего: {total}</p>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Поиск по имени..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            Найти
          </button>
        </div>
      </form>

      {/* Actors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {actors.map((actor) => (
          <Link
            key={actor.id}
            href={`/actors/${actor.id}`}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 hover:border-amber-500/50 transition-all group"
          >
            <div className="relative mb-3">
              {actor.photo ? (
                <Image
                  src={actor.photo}
                  alt={actor.name}
                  width={200}
                  height={200}
                  className="w-full aspect-square object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full aspect-square rounded-lg bg-slate-700 flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
              {actor.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {actor._count.movies} {actor._count.movies === 1 ? "фильм" : "фильмов"}
            </p>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={query ? `/admin/actors?q=${query}` : "/admin/actors"}
          />
        </div>
      )}
    </div>
  );
}

