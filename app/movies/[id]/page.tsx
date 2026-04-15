import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { RatingDisplay } from "@/components/ui/Rating";
import { MovieCard } from "@/components/movies/MovieCard";
import { ReviewSection } from "./ReviewSection";
import { MovieActions } from "./MovieActions";
import { MovieComments } from "@/components/comments/MovieComments";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

async function getMovie(id: string) {
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      director: true,
      genres: { include: { genre: true } },
      actors: {
        include: { actor: true },
        orderBy: { order: "asc" },
        take: undefined, // Показываем всех актёров
      },
      reviews: {
        where: { isApproved: true },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      ratings: true,
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!movie) notFound();

  return movie;
}

async function getSimilarMovies(movieId: string, genreIds: string[]) {
  return await prisma.movie.findMany({
    where: {
      id: { not: movieId },
      genres: {
        some: {
          genreId: { in: genreIds },
        },
      },
    },
    take: 6,
    include: {
      genres: { include: { genre: true } },
      ratings: true,
    },
  });
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovie(id);

  return {
    title: movie.title,
    description: movie.description || `Информация о фильме ${movie.title}`,
    openGraph: {
      title: movie.title,
      description: movie.description || "",
      images: movie.poster ? [movie.poster] : [],
    },
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovie(id);

  const avgRating = movie.ratings.length
    ? movie.ratings.reduce((acc, r) => acc + r.value, 0) / movie.ratings.length
    : null;

  const genreIds = movie.genres.map((mg) => mg.genreId);
  const similarMovies = await getSimilarMovies(movie.id, genreIds);

  const formatMoney = (amount: bigint) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative min-h-[60vh]">
        {movie.backdrop && (
          <>
            <Image
              src={movie.backdrop}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
          </>
        )}

        <div className="relative container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 w-64 mx-auto md:mx-0">
              {movie.poster ? (
                (() => {
                  const proxiedUrl = getProxiedImageUrl(movie.poster);
                  const isProxied = shouldUseUnoptimized(proxiedUrl);
                  if (isProxied && proxiedUrl) {
                    return (
                      <img
                        src={proxiedUrl}
                        alt={movie.title}
                        width={256}
                        height={384}
                        className="rounded-xl shadow-2xl w-64 h-96 object-cover"
                        loading="eager"
                      />
                    );
                  }
                  return (
                <Image
                      src={proxiedUrl || movie.poster}
                  alt={movie.title}
                  width={256}
                  height={384}
                  className="rounded-xl shadow-2xl"
                  priority
                  sizes="(max-width: 768px) 100vw, 256px"
                  quality={85}
                />
                  );
                })()
              ) : (
                <div className="w-64 h-96 bg-slate-800 rounded-xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {avgRating && <RatingDisplay value={avgRating} size="lg" />}
                {movie.genres.map((mg) => (
                  <Link key={mg.genreId} href={`/movies?genre=${mg.genre.slug}`}>
                    <Badge variant="primary">{mg.genre.name}</Badge>
                  </Link>
                ))}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {movie.title}
              </h1>

              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-xl text-slate-400 mb-4">{movie.originalTitle}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-slate-300 mb-6">
                {movie.releaseDate && (
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                )}
                {movie.runtime && <span>{movie.runtime} мин</span>}
                {movie.country && <span>{movie.country}</span>}
              </div>

              {movie.description && (
                <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-3xl">
                  {movie.description}
                </p>
              )}

              {/* Actions */}
              <div className="mb-8">
                <MovieActions movieId={movie.id} trailer={movie.trailer} />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {movie.director && (
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Режиссёр</p>
                    <Link
                      href={`/directors/${movie.director.id}`}
                      className="text-white hover:text-amber-400 transition-colors"
                    >
                      {movie.director.name}
                    </Link>
                  </div>
                )}
                {movie.budget && Number(movie.budget) > 0 && (
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Бюджет</p>
                    <p className="text-white">{formatMoney(movie.budget)}</p>
                  </div>
                )}
                {movie.revenue && Number(movie.revenue) > 0 && (
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Сборы</p>
                    <p className="text-white">{formatMoney(movie.revenue)}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 text-sm mb-1">Рейтингов</p>
                  <p className="text-white">{movie.ratings.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast */}
      {movie.actors.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">В ролях</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movie.actors.map((ma) => (
              <Link
                key={ma.actorId}
                href={`/actors/${ma.actor.id}`}
                className="group bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/50 transition-all text-center"
              >
                {ma.actor.photo ? (
                  (() => {
                    const proxiedUrl = getProxiedImageUrl(ma.actor.photo);
                    const isProxied = shouldUseUnoptimized(proxiedUrl);
                    if (isProxied && proxiedUrl) {
                      return (
                        <img
                          src={proxiedUrl}
                          alt={ma.actor.name}
                          width={100}
                          height={100}
                          className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
                          loading="lazy"
                        />
                      );
                    }
                    return (
                  <Image
                        src={proxiedUrl || ma.actor.photo}
                    alt={ma.actor.name}
                    width={100}
                    height={100}
                    className="w-20 h-20 rounded-full mx-auto object-cover"
                  />
                    );
                  })()
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto bg-slate-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <h3 className="mt-3 font-medium text-white group-hover:text-amber-400 transition-colors">
                  {ma.actor.name}
                </h3>
                {ma.character && (
                  <p className="text-sm text-slate-400 mt-1">{ma.character}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="bg-slate-800/30 py-12">
        <div className="container mx-auto px-4">
          <ReviewSection movieId={movie.id} reviews={movie.reviews} />
        </div>
      </section>

      {/* Comments */}
      <section className="container mx-auto px-4 py-12">
        <MovieComments movieId={movie.id} />
      </section>

      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Похожие фильмы</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {similarMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

