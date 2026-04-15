import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { MovieCard } from "@/components/movies/MovieCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("watchlistPage");
  return {
    title: t("title"),
    description: t("description"),
  };
}

async function getWatchlist(userId: string) {
  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    include: {
      movie: {
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return watchlist.map((w) => w.movie);
}

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("watchlistPage");

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const movies = await getWatchlist(session.user.id);

  const totalRuntime = movies.reduce((acc, m) => acc + (m.runtime || 0), 0);
  const hours = Math.floor(totalRuntime / 60);
  const mins = totalRuntime % 60;

  return (
    <div className="min-h-screen bg-[#151C2C]">
      {/* Header */}
      <div className="flex items-center justify-between px-12 pt-8 pb-2">
        <div className="flex items-center gap-3">
          <h1 className="font-oswald text-3xl font-bold text-white">{t("title")}</h1>
          <span className="font-mono text-[13px] text-white bg-[#FF8400] px-3 py-1 rounded-2xl">
            {movies.length} фильмов
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="font-mono text-[13px] text-[#FF8400] hover:text-[#FF9F2E] transition-colors">
            ← Профиль
          </Link>
          <span className="text-[#2A3550]">|</span>
          <Link href="/movies" className="font-mono text-[13px] text-[#8B95A8] hover:text-white transition-colors">
            Каталог
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      {movies.length > 0 && (
        <div className="flex items-center gap-8 px-12 py-4 mt-2 bg-[#1A2236] rounded-xl mx-12">
          <div className="text-center">
            <p className="font-oswald text-2xl font-bold text-white">{movies.length}</p>
            <p className="font-mono text-[10px] text-[#5A6478]">Фильмов</p>
          </div>
          <div className="text-center">
            <p className="font-oswald text-2xl font-bold text-white">{hours}h {mins}m</p>
            <p className="font-mono text-[10px] text-[#5A6478]">Всего времени</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-12 py-8">
        {movies.length === 0 ? (
          <div className="text-center py-16 bg-[#1A2236] rounded-2xl">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-mono text-[13px] text-[#5A6478] mb-4">{t("empty")}</p>
            <Link href="/movies">
              <button className="bg-[#FF8400] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-6 py-3 rounded-2xl transition-colors">
                {t("findMovies")}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
