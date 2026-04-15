import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { MovieCard } from "@/components/movies/MovieCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("favoritesPage");
  return {
    title: t("title"),
    description: t("description"),
  };
}

async function getFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
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

  return favorites.map((f) => f.movie);
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("favoritesPage");

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const movies = await getFavorites(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">❤️ {t("title")}</h1>
          <p className="text-slate-400">
            {movies.length > 0
              ? t("moviesCount", { count: movies.length })
              : t("emptyList")}
          </p>
        </div>
        <Link
          href="/profile"
          className="text-amber-400 hover:text-amber-300 transition-colors"
        >
          {t("backToProfile")}
        </Link>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-slate-400 text-lg mb-4">{t("empty")}</p>
          <Link
            href="/movies"
            className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
          >
            {t("findMovies")}
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
  );
}
