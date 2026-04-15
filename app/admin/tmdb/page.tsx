"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_url: string | null;
  backdrop_url: string | null;
  release_date: string;
  vote_average: number;
}

interface SearchResult {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
  page: number;
}

export default function TMDBImportPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch(`/api/admin/tmdb/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка поиска");
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при поиске");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (tmdbId: number) => {
    setImportingId(tmdbId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/tmdb/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка импорта");
      }

      setSuccess(`Фильм "${data.movie.title}" успешно импортирован!`);
      
      // Убираем импортированный фильм из списка
      if (results) {
        setResults({
          ...results,
          results: results.results.filter((m) => m.id !== tmdbId),
        });
      }

      // Через 2 секунды можно перейти к фильму
      setTimeout(() => {
        router.push(`/admin/movies/${data.movie.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при импорте");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Импорт из TMDB</h1>
        <p className="text-slate-400">
          Поиск и импорт фильмов из The Movie Database
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Введите название фильма на русском или английском..."
              className="text-lg"
            />
          </div>
          <Button type="submit" isLoading={isSearching}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Найти
          </Button>
        </div>
      </form>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          <p className="text-slate-400 mb-4">
            Найдено: {results.total_results} фильмов
          </p>

          <div className="grid gap-4">
            {results.results.map((movie) => (
              <div
                key={movie.id}
                className="flex gap-4 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4"
              >
                {/* Poster */}
                <div className="flex-shrink-0 w-24">
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      width={96}
                      height={144}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-36 bg-slate-700 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">
                    {movie.title}
                  </h3>
                  {movie.original_title !== movie.title && (
                    <p className="text-slate-400 text-sm">{movie.original_title}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    {movie.release_date && (
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                    {movie.overview || "Описание отсутствует"}
                  </p>
                </div>

                {/* Action */}
                <div className="flex-shrink-0 flex items-center">
                  <Button
                    onClick={() => handleImport(movie.id)}
                    isLoading={importingId === movie.id}
                    disabled={importingId !== null}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Импортировать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!results && !isSearching && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <p className="text-slate-400 text-lg mb-2">
            Введите название фильма для поиска
          </p>
          <p className="text-slate-500 text-sm">
            Например: &quot;Начало&quot;, &quot;Inception&quot;, &quot;Интерстеллар&quot;
          </p>
        </div>
      )}
    </div>
  );
}

