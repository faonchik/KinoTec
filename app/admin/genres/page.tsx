import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Управление жанрами",
};

async function getGenres() {
  const genres = await prisma.genre.findMany({
    include: {
      _count: { select: { movies: true } },
    },
    orderBy: { name: "asc" },
  });

  return genres;
}

export default async function AdminGenresPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const genres = await getGenres();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Управление жанрами</h1>
        <p className="text-slate-400 mt-1">Всего: {genres.length}</p>
      </div>

      {/* Genres Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`/movies?genre=${genre.slug}`}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-amber-500/50 transition-all group text-center"
          >
            <Badge variant="primary" className="text-lg px-4 py-2">
              {genre.name}
            </Badge>
            <p className="text-slate-400 mt-3 text-sm">
              {genre._count.movies} {genre._count.movies === 1 ? "фильм" : "фильмов"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

