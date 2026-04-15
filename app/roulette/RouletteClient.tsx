"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface Movie {
  id: string;
  title: string;
  poster: string | null;
  releaseDate: string | null;
  genres: { genre: { name: string } }[];
  ratings: { value: number }[];
}

interface RouletteClientProps {
  genres: Genre[];
}

export function RouletteClient({ genres }: RouletteClientProps) {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Movie | null>(null);
  const [history, setHistory] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем фильмы
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedGenre) params.set("genre", selectedGenre);
        if (selectedYear) params.set("year", selectedYear);

        const res = await fetch(`/api/roulette?${params.toString()}`);
        const data = await res.json();
        setMovies(data.movies || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [selectedGenre, selectedYear]);

  const spin = () => {
    if (movies.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Анимация выбора
    let count = 0;
    const totalSpins = 20 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      setResult(randomMovie);
      count++;

      if (count >= totalSpins) {
        clearInterval(interval);
        setIsSpinning(false);
        
        // Добавляем в историю
        setHistory((prev) => {
          const newHistory = [randomMovie, ...prev.filter((m) => m.id !== randomMovie.id)];
          return newHistory.slice(0, 5);
        });
      }
    }, 100 + count * 10);
  };

  const years = Array.from({ length: 30 }, (_, i) => 2024 - i);

  const getAvgRating = (ratings: { value: number }[]) => {
    if (!ratings?.length) return null;
    return (ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">🎲 КиноРулетка</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Не можете выбрать фильм? Доверьтесь судьбе!
          </p>
        </div>

        {/* Фильтры */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Жанр</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Любой жанр</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.slug}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Год</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Любой год</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-slate-500 text-sm mt-3 text-center">
              {isLoading ? "Загрузка..." : `Доступно фильмов: ${movies.length}`}
            </p>
          </div>
        </div>

        {/* Результат */}
        <div className="max-w-md mx-auto mb-8">
          <div
            className={`relative bg-slate-800 rounded-2xl p-8 border-4 transition-all duration-300 ${
              isSpinning
                ? "border-amber-500 shadow-lg shadow-amber-500/30"
                : result
                ? "border-green-500 shadow-lg shadow-green-500/30"
                : "border-slate-700"
            }`}
          >
            {result ? (
              <Link href={`/movies/${result.id}`} className="block text-center group">
                <div className="relative w-40 h-60 mx-auto mb-4 rounded-xl overflow-hidden bg-slate-700">
                  {result.poster ? (
                    <Image
                      src={result.poster}
                      alt={result.title}
                      fill
                      className={`object-cover transition-transform ${isSpinning ? "animate-pulse" : "group-hover:scale-105"}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {result.title}
                </h2>

                {result.releaseDate && (
                  <p className="text-slate-400 mb-2">
                    {new Date(result.releaseDate).getFullYear()}
                  </p>
                )}

                {getAvgRating(result.ratings) && (
                  <p className="text-amber-400 text-lg">
                    ★ {getAvgRating(result.ratings)}
                  </p>
                )}

                {!isSpinning && (
                  <p className="text-slate-500 text-sm mt-4">Нажмите чтобы посмотреть</p>
                )}
              </Link>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎲</div>
                <p className="text-slate-400">Нажмите кнопку чтобы выбрать фильм</p>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка */}
        <div className="text-center mb-12">
          <Button
            onClick={spin}
            disabled={isSpinning || movies.length === 0}
            className="px-12 py-4 text-xl"
          >
            {isSpinning ? "🎲 Крутится..." : "🎲 Крутить!"}
          </Button>
        </div>

        {/* История */}
        {history.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 text-center">📜 История</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {history.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group"
                >
                  <div className="relative w-20 h-30 rounded-lg overflow-hidden bg-slate-700">
                    {movie.poster ? (
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs text-center mt-1 max-w-20 truncate group-hover:text-white transition-colors">
                    {movie.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
