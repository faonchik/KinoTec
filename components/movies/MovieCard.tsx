"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "./FavoriteButton";
import { WatchlistButton } from "./WatchlistButton";
import { useTranslations } from "next-intl";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    originalTitle?: string | null;
    poster?: string | null;
    backdrop?: string | null;
    releaseDate?: Date | null;
    runtime?: number | null;
    genres?: { genre: { name: string; slug: string } }[];
    ratings?: { value: number }[];
    director?: { name: string } | null;
  };
  showRating?: boolean;
  variant?: "default" | "featured" | "compact";
}

export function MovieCard({ movie, showRating = true, variant = "default" }: MovieCardProps) {
  const t = useTranslations("common");
  const [isHovered, setIsHovered] = useState(false);
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
  const avgRating = movie.ratings?.length
    ? movie.ratings.reduce((acc, r) => acc + r.value, 0) / movie.ratings.length
    : null;

  if (variant === "featured") {
    return (
      <Link href={`/movies/${movie.id}`}>
        <article 
          className="group relative h-[400px] rounded-sm overflow-hidden bg-[#181818]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0">
            {movie.backdrop || movie.poster ? (
              (() => {
                const proxiedUrl = getProxiedImageUrl(movie.backdrop || movie.poster!);
                const isProxied = shouldUseUnoptimized(proxiedUrl);
                if (isProxied && proxiedUrl) {
                  return (
                    <img
                      src={proxiedUrl}
                      alt={movie.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
                      loading="lazy"
                    />
                  );
                }
                return (
                  <Image
                    src={proxiedUrl || movie.backdrop || movie.poster!}
                    alt={movie.title}
                    fill
                    className={`object-cover transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={80}
                    loading="lazy"
                  />
                );
              })()
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#181818] to-[#141414]" />
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {showRating && avgRating && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <span className="text-[#e50914] text-lg">★</span>
                <span className="text-white font-mono font-bold text-sm">{avgRating.toFixed(1)}</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genres?.slice(0, 3).map((mg) => (
                <span key={mg.genre.slug} className="rounded-sm px-2 py-0.5 bg-white/15 text-xs font-medium text-white backdrop-blur-sm">
                  {mg.genre.name}
                </span>
              ))}
            </div>
            
            <h3 className="mb-2 font-display text-2xl font-bold text-white transition-colors group-hover:text-[#e50914]">
              {movie.title}
            </h3>
            
            <div className="flex items-center gap-3 font-mono text-[13px] text-white/45">
              {year && <span>{year}</span>}
              {movie.runtime && <span>{movie.runtime} {t("minutes")}</span>}
              {movie.director && <span>{movie.director.name}</span>}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/movies/${movie.id}`}>
      <article 
        className="group relative bg-[#181818] rounded-sm overflow-hidden hover:ring-1 hover:ring-[#e50914]/30 transition-all duration-500 h-full flex flex-col hover:shadow-2xl hover:shadow-[#e50914]/5 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[2/3] overflow-hidden flex-shrink-0">
          {movie.poster ? (
            (() => {
              const proxiedUrl = getProxiedImageUrl(movie.poster);
              const isProxied = shouldUseUnoptimized(proxiedUrl);
              if (isProxied && proxiedUrl) {
                return (
                  <img
                    src={proxiedUrl}
                    alt={movie.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? "scale-110 blur-[1px]" : "scale-100"}`}
                    loading="lazy"
                  />
                );
              }
              return (
                <Image
                  src={proxiedUrl || movie.poster}
                  alt={movie.title}
                  fill
                  className={`object-cover transition-all duration-700 ${isHovered ? "scale-110 blur-[1px]" : "scale-100"}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              );
            })()
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#181818] to-[#141414]">
              <span className="font-mono text-xs text-white/30">КТ</span>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />
          
          {/* Play button on hover */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-white/90 shadow-xl transition-colors hover:bg-white">
              <svg className="ml-0.5 h-7 w-7 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Quick actions on hover */}
          <div className={`absolute top-3 left-3 flex flex-col gap-2 transition-all duration-300 z-20 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
            <FavoriteButton movieId={movie.id} size="sm" />
            <WatchlistButton movieId={movie.id} size="sm" />
          </div>
          
          {/* Rating badge */}
          {showRating && avgRating && (
            <div className={`absolute top-3 right-3 transition-all duration-300 z-10 ${isHovered ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                <span className="text-[#e50914] text-xs">★</span>
                <span className="font-mono text-[11px] text-white font-bold">{avgRating.toFixed(1)}</span>
              </div>
            </div>
          )}

          {/* Bottom info on hover */}
          <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center justify-between font-mono text-[11px] text-white/80">
              {movie.runtime && (
                <span>
                  {movie.runtime} {t("minutes")}
                </span>
              )}
              {year && <span>{year}</span>}
            </div>
          </div>
        </div>

        <div className="p-3 flex flex-col flex-grow">
          <h3 className="font-mono text-[13px] font-semibold text-white group-hover:text-[#e50914] transition-colors line-clamp-2 min-h-[2.5rem]">
            {movie.title}
          </h3>
          
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="font-mono text-[11px] text-white/35 mt-0.5 line-clamp-1">
              {movie.originalTitle}
            </p>
          )}
          
          <div className="mt-auto pt-2">
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.slice(0, 2).map((mg) => (
                  <span key={mg.genre.slug} className="font-mono text-[10px] text-white/45 bg-white/[0.08] px-2 py-0.5 rounded">
                    {mg.genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
