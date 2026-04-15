import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Управление фильмами",
};

interface AdminMoviesPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

const MOVIES_PER_PAGE = 20;

async function getMovies(page: number, query?: string) {
  const skip = (page - 1) * MOVIES_PER_PAGE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { originalTitle: { contains: query, mode: "insensitive" } },
    ];
  }

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      skip,
      take: MOVIES_PER_PAGE,
      include: {
        director: { select: { name: true } },
        genres: { include: { genre: true } },
        _count: { select: { reviews: true, ratings: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.movie.count({ where }),
  ]);

  return {
    movies,
    total,
    totalPages: Math.ceil(total / MOVIES_PER_PAGE),
  };
}

export default async function AdminMoviesPage({ searchParams }: AdminMoviesPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const query = params.q;

  const { movies, total, totalPages } = await getMovies(page, query);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Управление фильмами</h1>
          <p className="text-slate-400 mt-1">Всего: {total}</p>
        </div>
        <Link href="/admin/movies/new">
          <Button>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить фильм
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Поиск по названию..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Button type="submit">Найти</Button>
        </div>
      </form>

      {/* Movies Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="text-left p-4 text-slate-400 font-medium">Фильм</th>
              <th className="text-left p-4 text-slate-400 font-medium">Режиссёр</th>
              <th className="text-left p-4 text-slate-400 font-medium">Жанры</th>
              <th className="text-left p-4 text-slate-400 font-medium">Дата</th>
              <th className="text-left p-4 text-slate-400 font-medium">Отзывы</th>
              <th className="text-right p-4 text-slate-400 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {movies.map((movie) => (
              <tr key={movie.id} className="hover:bg-slate-700/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {movie.poster ? (
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        width={40}
                        height={60}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-10 h-15 bg-slate-700 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <Link href={`/admin/movies/${movie.id}`} className="text-white hover:text-amber-400 font-medium">
                        {movie.title}
                      </Link>
                      {movie.originalTitle && movie.originalTitle !== movie.title && (
                        <p className="text-slate-500 text-sm">{movie.originalTitle}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">
                  {movie.director?.name || "—"}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {movie.genres.slice(0, 2).map((mg) => (
                      <Badge key={mg.genreId} variant="primary">
                        {mg.genre.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-slate-400">
                  {movie.releaseDate
                    ? new Date(movie.releaseDate).getFullYear()
                    : "—"}
                </td>
                <td className="p-4 text-slate-400">
                  {movie._count.reviews}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/movies/${movie.id}`}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Просмотр"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/movies/${movie.id}`}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={query ? `/admin/movies?q=${query}` : "/admin/movies"}
          />
        </div>
      )}
    </div>
  );
}

