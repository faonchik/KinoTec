




"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { Badge } from "@/components/ui/Badge";

interface Movie {
  id: string;
  title: string;
  originalTitle?: string | null;
  description?: string | null;
  poster?: string | null;
  backdrop?: string | null;
  videoUrl?: string | null;
  runtime?: number | null;
  releaseDate?: Date | null;
  director?: { id: string; name: string } | null;
  genres: { genre: { id: string; name: string; slug: string } }[];
  actors: { actor: { id: string; name: string; photo?: string | null } }[];
}

interface Recommendation {
  id: string;
  title: string;
  poster?: string | null;
  genres: { genre: { name: string } }[];
  ratings: { value: number }[];
}

interface WatchPageClientProps {
  movie: Movie;
  initialProgress: number;
  recommendations: Recommendation[];
  isAuthenticated: boolean;
}

export function WatchPageClient({
  movie,
  initialProgress,
  recommendations,
  isAuthenticated,
}: WatchPageClientProps) {
  const t = useTranslations("watchPage");
  const [showInfo, setShowInfo] = useState(false);

  const handleProgress = async (progress: number) => {
    if (!isAuthenticated) return;
    
    try {
      await fetch(`/api/watch/${movie.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: Math.floor(progress) }),
      });
    } catch (error) {
      console.error("Ошибка сохранения прогресса:", error);
    }
  };

  const handleComplete = async () => {
    if (!isAuthenticated) return;
    
    try {
      await fetch(`/api/watch/${movie.id}/complete`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Ошибка отметки просмотра:", error);
    }
  };

  const avgRating = (ratings: { value: number }[]) => {
    if (!ratings?.length) return null;
    return (ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Плеер */}
      <div className="w-full bg-black">
        <div className="max-w-[1920px] mx-auto">
        <VideoPlayer
          src={movie.videoUrl!}
          poster={movie.backdrop || movie.poster || undefined}
          title={movie.title}
          initialProgress={initialProgress}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />
        </div>
      </div>

      {/* Информация о фильме */}
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок и кнопка */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-slate-400">
              {movie.releaseDate && (
                <span>{new Date(movie.releaseDate).getFullYear()}</span>
              )}
              {movie.runtime && <span>{movie.runtime} {t("minutes") || "мин"}</span>}
              {movie.director && (
                <Link
                  href={`/directors/${movie.director.id}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {movie.director.name}
                </Link>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showInfo ? t("hide") : t("about")}
          </button>
        </div>

        {/* Жанры */}
        <div className="flex flex-wrap gap-2 mb-6">
          {movie.genres.map((mg) => (
            <Badge key={mg.genre.id} variant="primary">
              {mg.genre.name}
            </Badge>
          ))}
        </div>

        {/* Развёрнутая информация */}
        {showInfo && (
          <div className="grid md:grid-cols-[200px_1fr] gap-6 mb-8 bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            {movie.poster && (
              <Image
                src={movie.poster}
                alt={movie.title}
                width={200}
                height={300}
                className="rounded-lg w-full"
              />
            )}
            <div>
              {movie.description && (
                <p className="text-slate-300 mb-4 leading-relaxed">
                  {movie.description}
                </p>
              )}
              
              {/* Актёры */}
              {movie.actors.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">{t("stars")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.actors.map((ma) => (
                      <Link
                        key={ma.actor.id}
                        href={`/actors/${ma.actor.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-sm text-slate-300 hover:text-white transition-colors"
                      >
                        {ma.actor.photo && (
                          <Image
                            src={ma.actor.photo}
                            alt={ma.actor.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        {ma.actor.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Рекомендации */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t("similar")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/watch/${rec.id}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 mb-2">
                    {rec.poster ? (
                      <Image
                        src={rec.poster}
                        alt={rec.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        🎬
                      </div>
                    )}
                    
                    {/* Оценка */}
                    {avgRating(rec.ratings) && (
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-md px-2 py-0.5 text-sm">
                        <span className="text-amber-400">★</span>
                        <span className="text-white ml-1">{avgRating(rec.ratings)}</span>
                      </div>
                    )}
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                    {rec.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Кнопка назад */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <Link
            href={`/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("backToDesc")}
          </Link>
        </div>
      </div>
    </div>
  );
}

