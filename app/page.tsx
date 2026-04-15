import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { MovieCarousel } from "@/components/movies/MovieCarousel";
import { MovieCard } from "@/components/movies/MovieCard";
import { TopRatedRow } from "@/components/movies/TopRatedRow";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";
import { unstable_cache } from "next/cache";

// Функция для преобразования BigInt в строки для сериализации
function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === "bigint") {
    return obj.toString() as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item)) as unknown as T;
  }
  
  if (typeof obj === "object") {
    const result = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeBigInt((obj as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }
  
  return obj;
}

const getPopularMovies = unstable_cache(
  async () => {
    try {
      const movies = await prisma.movie.findMany({
        take: 5,
        orderBy: { popularity: "desc" },
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
      });
      return serializeBigInt(movies);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      return [];
    }
  },
  ["popular-movies"],
  { revalidate: 3600 }
);

const getLatestMovies = unstable_cache(
  async () => {
    try {
      const movies = await prisma.movie.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
      });
      return serializeBigInt(movies);
    } catch (error) {
      console.error("Error fetching latest movies:", error);
      return [];
    }
  },
  ["latest-movies"],
  { revalidate: 1800 }
);

const getTopRatedMovies = unstable_cache(
  async () => {
    try {
      const movies = await prisma.movie.findMany({
        take: 50,
        include: {
          genres: { include: { genre: true } },
          ratings: {
            select: { value: true },
          },
        },
        orderBy: { popularity: "desc" },
      });

      const result = movies
        .map((movie) => ({
          ...movie,
          avgRating: movie.ratings.length
            ? movie.ratings.reduce((acc, r) => acc + r.value, 0) / movie.ratings.length
            : 0,
        }))
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 10);
      
      return serializeBigInt(result);
    } catch (error) {
      console.error("Error fetching top rated movies:", error);
      return [];
    }
  },
  ["top-rated-movies"],
  { revalidate: 3600 }
);

const getGenres = unstable_cache(
  async () => {
    try {
      const genres = await prisma.genre.findMany({
        take: 6,
        orderBy: { name: "asc" },
      });
      return genres;
    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  },
  ["home-genres"],
  { revalidate: 86400 }
);

async function getPersonalRecommendations(userId: string) {
  try {
    const watchHistory = await prisma.watchHistory.findMany({
      where: { userId, completed: true },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            director: true,
            actors: { include: { actor: true }, take: 5 },
            ratings: true,
          },
        },
      },
      take: 50,
      orderBy: { lastWatched: "desc" },
    });

    const userRatings = await prisma.rating.findMany({
      where: { userId },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            ratings: true,
          },
        },
      },
      take: 50,
    });

    if (watchHistory.length === 0 && userRatings.length === 0) {
      return [];
    }

    const genreWeights: Record<string, number> = {};
    const directorWeights: Record<string, number> = {};
    const watchedMovieIds = new Set<string>();

    watchHistory.forEach((wh) => {
      watchedMovieIds.add(wh.movie.id);
      wh.movie.genres.forEach((mg) => {
        genreWeights[mg.genre.id] = (genreWeights[mg.genre.id] || 0) + 1;
      });
      if (wh.movie.director) {
        directorWeights[wh.movie.director.id] = (directorWeights[wh.movie.director.id] || 0) + 1;
      }
    });

    userRatings.forEach((rating) => {
      watchedMovieIds.add(rating.movie.id);
      const weight = rating.value >= 8 ? 2 : rating.value >= 6 ? 1 : 0.5;
      rating.movie.genres.forEach((mg) => {
        genreWeights[mg.genre.id] = (genreWeights[mg.genre.id] || 0) + weight;
      });
    });

    const topGenres = Object.entries(genreWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topDirectors = Object.entries(directorWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const recommendations = await prisma.movie.findMany({
      where: {
        id: { notIn: Array.from(watchedMovieIds) },
        OR: [
          ...(topGenres.length > 0 ? [{
            genres: { some: { genreId: { in: topGenres } } },
          }] : []),
          ...(topDirectors.length > 0 ? [{
            directorId: { in: topDirectors },
          }] : []),
        ],
      },
      include: {
        genres: { include: { genre: true } },
        ratings: true,
      },
      take: 6,
      orderBy: { popularity: "desc" },
    });

    return serializeBigInt(recommendations);
  } catch (error) {
    console.error("Personal recommendations error:", error);
    return [];
  }
}

// Градиенты для карточек жанров (по макету Pencil)
const genreGradients = [
  "linear-gradient(135deg, #8B0000 0%, #2A1020 100%)",
  "linear-gradient(135deg, #1A237E 0%, #0D1B2A 100%)",
  "linear-gradient(135deg, #E65100 0%, #2A1A0D 100%)",
  "linear-gradient(135deg, #4A148C 0%, #1A0D2A 100%)",
  "linear-gradient(135deg, #B71C1C 0%, #1A0D0D 100%)",
  "linear-gradient(135deg, #E91E63 0%, #2A0D1A 100%)",
];

const genreIcons = ["🎃", "🚀", "😂", "🎭", "💥", "🌸"];

export default async function HomePage() {
  const t = await getTranslations("home");
  const session = await getServerSession(authOptions);
  
  const [popularMovies, latestMovies, topRatedMovies, genres, personalRecommendations] = await Promise.all([
    getPopularMovies(),
    getLatestMovies(),
    getTopRatedMovies(),
    getGenres(),
    session?.user?.id ? getPersonalRecommendations(session.user.id) : Promise.resolve([]),
  ]);

  // Убеждаемся, что topRatedMovies это массив
  const safeTopRatedMovies = Array.isArray(topRatedMovies) ? topRatedMovies : [];
  // Убеждаемся, что personalRecommendations это массив
  const safePersonalRecommendations = Array.isArray(personalRecommendations) ? personalRecommendations : [];

  return (
    <div className="bg-[#151C2C] min-h-screen">
      {/* Hero Carousel */}
      <MovieCarousel movies={popularMovies} />

      {/* Top 10 по рейтингу — перекрывающиеся карточки с hover-выдвижением */}
      {safeTopRatedMovies.length > 0 && (
        <section className="px-12 py-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-oswald text-[28px] font-bold text-white">
                {t("topRatedTitle")}
              </h2>
              <p className="font-mono text-[13px] text-[#8B95A8] mt-1">
                {t("topRatedDescription")}
              </p>
            </div>
            <Link href="/movies?sort=rating" className="font-mono text-[13px] font-semibold text-[#FF8400] hover:text-[#FF9F2E] transition-colors">
              {t("viewAll")} &gt;
            </Link>
          </div>

          <TopRatedRow movies={safeTopRatedMovies} />
        </section>
      )}

      {/* Персональные рекомендации */}
      {session?.user && safePersonalRecommendations.length > 0 && (
        <section className="px-12 py-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-oswald text-[28px] font-bold text-white">✨ Для вас</h2>
              <p className="font-mono text-[13px] text-[#8B95A8] mt-1">Рекомендации на основе ваших просмотров</p>
            </div>
            <Link href="/recommend" className="font-mono text-[13px] font-semibold text-[#FF8400] hover:text-[#FF9F2E] transition-colors">
              Больше рекомендаций &gt;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {safePersonalRecommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Новинки */}
      <section className="px-12 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-oswald text-[28px] font-bold text-white">Новинки</h2>
            <p className="font-mono text-[11px] text-[#5A6478] mt-1">// свежие поступления этой недели</p>
          </div>
          <Link href="/movies" className="font-mono text-[13px] font-semibold text-[#FF8400] hover:text-[#FF9F2E] transition-colors">
            {t("viewAll")} &gt;
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {latestMovies.map((movie) => {
            const proxiedUrl = movie.poster ? getProxiedImageUrl(movie.poster) : null;
            const isProxied = proxiedUrl ? shouldUseUnoptimized(proxiedUrl) : false;
            const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
            const avgRating = movie.ratings?.length
              ? (movie.ratings.reduce((acc: number, r: { value: number }) => acc + r.value, 0) / movie.ratings.length).toFixed(1)
              : null;
            return (
              <Link key={movie.id} href={`/movies/${movie.id}`} className="flex-shrink-0">
                <div className="w-[240px] rounded-2xl overflow-hidden bg-[#1A2236] group hover:ring-1 hover:ring-[#FF8400]/30 transition-all">
                  <div className="relative h-[300px] overflow-hidden">
                    {proxiedUrl ? (
                      isProxied ? (
                        <img
                          src={proxiedUrl}
                          alt={movie.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <Image
                          src={proxiedUrl}
                          alt={movie.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="240px"
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-[#1E2740] flex items-center justify-center text-4xl">🎬</div>
                    )}
                    {/* Rating badge */}
                    {avgRating && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                        <span className="text-[#FF8400] text-xs">★</span>
                        <span className="font-mono text-[11px] text-white font-bold">{avgRating}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-mono text-[13px] font-semibold text-white group-hover:text-[#FF8400] transition-colors line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {movie.genres?.slice(0, 1).map((mg: { genre: { name: string; slug: string } }) => (
                        <span key={mg.genre.slug} className="font-mono text-[11px] text-[#5A6478]">{mg.genre.name}</span>
                      ))}
                      {year && <span className="font-mono text-[11px] text-[#5A6478]">• {year}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Жанры */}
      <section className="px-12 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-oswald text-[28px] font-bold text-white">Жанры</h2>
            <p className="font-mono text-[11px] text-[#5A6478] mt-1">// выберите по настроению</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {genres.slice(0, 6).map((genre, index) => (
            <Link key={genre.id} href={`/movies?genre=${genre.slug}`}>
              <div
                className="h-[120px] rounded-2xl p-5 flex flex-col justify-end hover:scale-[1.02] transition-transform duration-300"
                style={{ background: genreGradients[index % genreGradients.length] }}
              >
                <span className="text-2xl mb-1">{genreIcons[index % genreIcons.length]}</span>
                <h3 className="font-oswald text-lg font-semibold text-white">{genre.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
