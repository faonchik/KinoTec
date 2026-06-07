"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";
import { FavoriteButton } from "@/components/movies/FavoriteButton";
import { WatchlistButton } from "@/components/movies/WatchlistButton";

interface Movie {
  id: string;
  title: string;
  description?: string | null;
  poster?: string | null;
  backdrop?: string | null;
  releaseDate?: Date | null;
  genres?: { genre: { name: string; slug: string } }[];
  ratings?: { value: number }[];
}

interface MovieCarouselProps {
  movies: Movie[];
}

export function MovieCarousel({ movies }: MovieCarouselProps) {
  const t = useTranslations("home");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const avgRating = currentMovie.ratings?.length
    ? (currentMovie.ratings.reduce((s, r) => s + r.value, 0) / currentMovie.ratings.length).toFixed(1)
    : null;
  const year = currentMovie.releaseDate ? new Date(currentMovie.releaseDate).getFullYear() : null;

  return (
    <div
      className="relative h-[240px] overflow-hidden bg-[#141414] sm:h-[360px] lg:h-[min(72vh,620px)]"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image */}
      {movies.map((movie, index) => {
        const rawImage = movie.backdrop || movie.poster || null;
        return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {rawImage ? (
              (() => {
                const proxiedUrl = getProxiedImageUrl(rawImage);
                const isProxied = shouldUseUnoptimized(proxiedUrl);
                if (isProxied && proxiedUrl) {
                  return (
                    <img
                      src={proxiedUrl}
                      alt={movie.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-55"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  );
                }
                return (
                  <Image
                    src={proxiedUrl || rawImage}
                    alt={movie.title}
                    fill
                    className="object-cover opacity-55"
                    priority={index === 0}
                    sizes="100vw"
                    quality={85}
                  />
                );
              })()
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-[#141414]"
                aria-hidden
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgb(20 20 20 / 0.94) 0%, rgb(20 20 20 / 0.25) 55%, transparent 100%), linear-gradient(to top, rgb(20 20 20) 0%, transparent 50%)",
              }}
            />
          </div>
        );
      })}

      {/* Content */}
      <div className="relative h-full flex items-end sm:items-center pl-4 sm:pl-8 lg:pl-12 pb-10 sm:pb-[60px]">
        <div className="max-w-[600px] w-full">
          {/* Tags */}
          <div className="hidden sm:flex flex-wrap gap-2.5 mb-3">
            {currentMovie.genres?.slice(0, 3).map((mg, gi) => (
              <span
                key={mg.genre.slug}
                className="rounded-sm border border-white/25 bg-black/30 px-2 py-0.5 text-xs text-white/90"
              >
                {mg.genre.name}
                {gi === 0 && year ? ` · ${year}` : ""}
              </span>
            ))}
            {avgRating && (
              <span className="rounded border border-white/20 bg-black/40 px-2.5 py-0.5 text-xs font-medium text-[#46d369]">
                ★ {avgRating}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="mb-2 line-clamp-2 font-display text-xl font-semibold leading-tight tracking-tight text-white sm:mb-4 sm:text-3xl lg:text-5xl">
            {currentMovie.title}
          </h2>

          {/* Description */}
          {currentMovie.description && (
            <p className="mb-4 hidden max-w-[520px] text-sm leading-relaxed text-white/55 sm:block line-clamp-2">
              {currentMovie.description}
            </p>
          )}

          {/* Buttons */}
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
            <Link href={`/watch/${currentMovie.id}`}>
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-white px-4 py-2 text-xs font-bold text-black shadow-md transition hover:bg-white/90 sm:gap-2 sm:px-8 sm:py-2.5 sm:text-base">
                <svg className="h-4 w-4 fill-current sm:h-5 sm:w-5" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                {t("play")}
              </span>
            </Link>
            <FavoriteButton movieId={currentMovie.id} size="md" variant="glass" />
            <WatchlistButton movieId={currentMovie.id} size="md" variant="glass" />
            <Link
              href={`/movies/${currentMovie.id}`}
              className="hidden items-center gap-2 rounded-sm bg-white/20 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 sm:inline-flex"
            >
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("readMore")}
            </Link>
            <Link
              href={`/movies/${currentMovie.id}`}
              className="inline-flex items-center justify-center rounded-sm border border-white/40 bg-black/40 px-3 py-2 text-xs font-semibold text-white sm:hidden"
            >
              {t("readMore")}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/55 sm:left-4 sm:h-10 sm:w-10"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/55 sm:right-4 sm:h-10 sm:w-10"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all h-1 ${
              index === currentIndex
                ? "w-8 rounded-sm bg-[#e50914]"
                : "w-2 rounded-sm bg-white/25 hover:bg-white/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
