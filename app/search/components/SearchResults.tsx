"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";

interface SearchResult {
  id: string;
  type: "movie" | "actor" | "director";
  title: string;
  subtitle?: string;
  image?: string;
  year?: number;
  genres?: string[];
  rating?: number;
}

interface SearchResultsProps {
  results: SearchResult[];
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-slate-400 mb-4">Найдено: {results.length}</p>
      <div className="space-y-4">
        {results.map((result) => (
          <Link
            key={`${result.type}-${result.id}`}
            href={`/${result.type === "movie" ? "movies" : result.type === "actor" ? "actors" : "directors"}/${result.id}`}
            className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-amber-500/50 transition-all group"
          >
            <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-700">
              {result.image ? (
                <Image
                  src={result.image}
                  alt={result.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {result.type === "movie" ? "🎬" : "👤"}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={result.type === "movie" ? "primary" : "default"}>
                  {result.type === "movie" ? "Фильм" : result.type === "actor" ? "Актёр" : "Режиссёр"}
                </Badge>
                {result.rating && (
                  <span className="text-amber-400 text-sm">★ {result.rating.toFixed(1)}</span>
                )}
              </div>
              
              <h3 className="text-white font-semibold group-hover:text-amber-400 transition-colors">
                {result.title}
              </h3>
              
              {result.subtitle && (
                <p className="text-slate-400 text-sm">{result.subtitle}</p>
              )}
              
              {result.genres && result.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.genres.slice(0, 3).map((genre) => (
                    <span key={genre} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <svg className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

