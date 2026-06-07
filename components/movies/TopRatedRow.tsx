"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";

interface Movie {
  id: string;
  title: string;
  poster?: string | null;
}

interface TopRatedRowProps {
  movies: Movie[];
}

export function TopRatedRow({ movies }: TopRatedRowProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Храним последний hovered индекс, чтобы z-index оставался повышенным пока идёт анимация
  const [elevatedIndex, setElevatedIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredIndex(index);
    setElevatedIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    // z-index остаётся повышенным ещё 400мс — пока анимация ширины не закончится
    timeoutRef.current = setTimeout(() => {
      setElevatedIndex(null);
    }, 400);
  }, []);

  // Проверка на существование и массив
  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center" style={{ height: 340 }}>
        {movies.map((movie, index) => {
          const posterUrl = movie.poster || null;
          const proxiedUrl = posterUrl ? getProxiedImageUrl(posterUrl) : null;
          const isProxied = shouldUseUnoptimized(proxiedUrl);
          const isHovered = hoveredIndex === index;
          const isElevated = elevatedIndex === index;

          // При ховере — раздвигаем соседей
          const shift = hoveredIndex !== null
            ? index < hoveredIndex ? -20 : index > hoveredIndex ? 20 : 0
            : 0;

          return (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="relative flex-shrink-0 cursor-pointer overflow-hidden rounded-sm bg-[#181818] ring-1 ring-white/[0.08]"
              style={{
                width: isHovered ? 260 : 240,
                height: 340,
                marginLeft: index === 0 ? 0 : -60,
                // z-index остаётся высоким и при ховере, и во время обратной анимации
                zIndex: isElevated || isHovered ? 20 : 10 - index,
                transform: `translateX(${shift}px)`,
                transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease, outline 0.35s ease",
                boxShadow: isHovered
                  ? "0 8px 30px rgba(229, 9, 20, 0.35), 0 4px 15px rgba(0,0,0,0.55)"
                  : "none",
                outline: isHovered ? "2px solid rgba(229, 9, 20, 0.65)" : "2px solid transparent",
                outlineOffset: -2,
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {proxiedUrl ? (
                isProxied ? (
                  <img
                    src={proxiedUrl}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Image
                    src={proxiedUrl}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="260px"
                  />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#232323] to-[#141414] text-5xl">
                  🎬
                </div>
              )}

              {/* Number badge */}
              <div className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-sm bg-[#e50914] shadow-md">
                <span className="font-display text-sm font-bold text-white">{index + 1}</span>
              </div>

              {/* Bottom gradient + title */}
              <div
                className="absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
                  opacity: isHovered ? 1 : 0.7,
                }}
              >
                <h3 className="font-mono text-[13px] font-semibold text-white line-clamp-2">
                  {movie.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
