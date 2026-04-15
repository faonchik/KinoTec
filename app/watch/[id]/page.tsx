import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { KinoboxPlayer } from "@/components/player/KinoboxPlayer";

interface WatchPageProps {
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
      },
      ratings: true,
    },
  });

  if (!movie) notFound();
  return movie;
}

async function getRecommendations(movieId: string, genreIds: string[]) {
  return await prisma.movie.findMany({
    where: {
      id: { not: movieId },
      genres: {
        some: {
          genreId: { in: genreIds },
        },
      },
    },
    include: {
      genres: { include: { genre: true } },
      ratings: true,
    },
    take: 6,
    orderBy: { popularity: "desc" },
  });
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovie(id);

  return {
    title: `Смотреть ${movie.title} онлайн`,
    description: `Смотреть фильм ${movie.title} (${movie.originalTitle || ""}) онлайн бесплатно в хорошем качестве`,
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const movie = await getMovie(id);
  
  const genreIds = movie.genres.map((g) => g.genreId);
  const recommendations = await getRecommendations(id, genreIds);

  const avgRating = movie.ratings.length
    ? (movie.ratings.reduce((acc, r) => acc + r.value, 0) / movie.ratings.length).toFixed(1)
    : null;

  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Плеер */}
      <div className="w-full bg-black">
        <div className="max-w-[1400px] mx-auto">
          <KinoboxPlayer
            title={movie.originalTitle || movie.title}
            year={year || undefined}
            className="w-full"
          />
        </div>
      </div>

      {/* Информация о фильме */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Основная информация */}
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-slate-400 text-lg">{movie.originalTitle}</p>
                )}
              </div>
              
              {avgRating && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 rounded-lg">
                  <span className="text-amber-400 text-xl">★</span>
                  <span className="text-white font-bold text-xl">{avgRating}</span>
                </div>
              )}
            </div>

            {/* Мета */}
            <div className="flex flex-wrap items-center gap-4 text-slate-400 mb-6">
              {year && <span>{year}</span>}
              {movie.country && <span>{movie.country}</span>}
              {movie.runtime && <span>{movie.runtime} мин</span>}
              {movie.director && (
                <Link
                  href={`/directors/${movie.director.id}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  Режиссёр: {movie.director.name}
                </Link>
              )}
            </div>

            {/* Жанры */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((mg) => (
                <Link key={mg.genre.id} href={`/movies?genre=${mg.genre.slug}`}>
                  <Badge variant="primary" className="hover:bg-amber-600 transition-colors">
                    {mg.genre.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Описание */}
            {movie.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">Описание</h2>
                <p className="text-slate-300 leading-relaxed">{movie.description}</p>
              </div>
            )}

            {/* Актёры */}
            {movie.actors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">В ролях</h2>
                <div className="flex flex-wrap gap-3">
                  {movie.actors.map((ma) => (
                    <Link
                      key={ma.actor.id}
                      href={`/actors/${ma.actor.id}`}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {ma.actor.photo ? (
                        <Image
                          src={ma.actor.photo}
                          alt={ma.actor.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                          {ma.actor.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm">{ma.actor.name}</p>
                        {ma.character && (
                          <p className="text-slate-500 text-xs">{ma.character}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Кнопка на страницу фильма */}
            <Link
              href={`/movies/${movie.id}`}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Подробнее о фильме
            </Link>
          </div>

          {/* Сайдбар с рекомендациями */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Похожие фильмы</h2>
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const recRating = rec.ratings.length
                  ? (rec.ratings.reduce((acc, r) => acc + r.value, 0) / rec.ratings.length).toFixed(1)
                  : null;

                return (
                  <Link
                    key={rec.id}
                    href={`/watch/${rec.id}`}
                    className="flex gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="relative w-16 aspect-[2/3] flex-shrink-0 rounded overflow-hidden bg-slate-800">
                      {rec.poster ? (
                        <Image
                          src={rec.poster}
                          alt={rec.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
                      )}
                      
                      {/* Play icon on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-amber-400 transition-colors">
                        {rec.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        {recRating && (
                          <span className="text-amber-400">★ {recRating}</span>
                        )}
                        {rec.genres[0] && (
                          <span>{rec.genres[0].genre.name}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
