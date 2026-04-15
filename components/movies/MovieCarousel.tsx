"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";

interface Movie {
  id: string;
  title: string;
  description?: string | null;
  poster?: string | null;
  backdrop?: string | null;
  releaseDate?: Date | null;
  genres?: { genre: { name: string; slug: string } }[];
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

  return (
    <div
      className="relative h-[400px] sm:h-[480px] md:h-[550px] overflow-hidden bg-[#0D1420]"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {movie.backdrop && (() => {
            const proxiedUrl = getProxiedImageUrl(movie.backdrop);
            const isProxied = shouldUseUnoptimized(proxiedUrl);
            if (isProxied && proxiedUrl) {
              return (
                <img
                  src={proxiedUrl}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              );
            }
            return (
              <Image
                src={proxiedUrl || movie.backdrop}
                alt={movie.title}
                fill
                className="object-cover opacity-40"
                priority={index === 0}
                sizes="100vw"
                quality={85}
              />
            );
          })()}
          {/* Left gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, #151C2CFF 0%, #151C2C00 100%)',
            }}
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full flex items-center pl-8 sm:pl-12 pb-[60px]">
        <div className="max-w-[600px]">
          {/* Tags */}
          <div className="flex flex-wrap gap-2.5 mb-4">
            {currentMovie.genres?.slice(0, 2).map((mg) => (
              <span
                key={mg.genre.slug}
                className="font-mono text-[13px] text-[#8B95A8] border border-[#8B95A8] rounded-2xl px-3.5 py-1"
              >
                {mg.genre.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 className="font-oswald text-3xl sm:text-4xl md:text-[42px] font-bold text-white mb-4 leading-tight">
            {currentMovie.title}
          </h2>

          {/* Description */}
          {currentMovie.description && (
            <p className="font-mono text-[13px] text-[#8B95A8] leading-[1.5] line-clamp-3 mb-4 max-w-[520px]">
              {currentMovie.description}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <Link href={`/movies/${currentMovie.id}`}>
              <button className="flex items-center gap-2 bg-[#FF8400] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-7 py-3 rounded-2xl transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                {t("readMore")}
              </button>
            </Link>
            <button className="flex items-center gap-2 text-[#FF8400] font-mono text-[13px] font-semibold px-7 py-3 rounded-2xl border-[1.5px] border-[#FF8400] hover:bg-[#FF8400]/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {t("addToFavorites")}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#151C2C99] hover:bg-[#151C2Ccc] rounded-[20px] flex items-center justify-center text-white transition-colors"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#151C2C99] hover:bg-[#151C2Ccc] rounded-[20px] flex items-center justify-center text-white transition-colors"
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
            className={`transition-all h-2 ${
              index === currentIndex
                ? "bg-[#FF8400] w-6 rounded"
                : "bg-[#3A4560] w-2 rounded-full hover:bg-[#5A6478]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
