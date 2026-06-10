"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("roulette");
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

  const spin = useCallback(() => {
    if (movies.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Анимация с замедлением
    let count = 0;
    const totalSpins = 20 + Math.floor(Math.random() * 10);
    let lastMovie: Movie | null = null;

    const doSpin = () => {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      lastMovie = randomMovie;
      setResult(randomMovie);
      count++;

      if (count >= totalSpins) {
        setIsSpinning(false);
        // Добавляем в историю
        if (lastMovie) {
          const m = lastMovie;
          setHistory((prev) => {
            const newHistory = [m, ...prev.filter((h) => h.id !== m.id)];
            return newHistory.slice(0, 5);
          });
        }
      } else {
        // Exponential slowdown
        const delay = 60 + Math.pow(count, 1.8) * 3;
        setTimeout(doSpin, delay);
      }
    };

    doSpin();
  }, [movies, isSpinning]);

  const years = Array.from({ length: 30 }, (_, i) => 2025 - i);

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
            <span className="text-gradient">
              <svg className={`inline-block w-12 h-12 mr-3 -mt-2 transition-transform duration-1000 ${isSpinning ? "animate-spin" : ""}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" stroke="url(#roulette-grad)" strokeWidth="3" fill="none" />
                <circle cx="24" cy="24" r="17" stroke="#1e293b" strokeWidth="2" fill="#0f172a" />
                
                {/* Slices */}
                <path d="M24 7 L24 24" stroke="url(#roulette-grad)" strokeWidth="1.5" />
                <path d="M24 41 L24 24" stroke="url(#roulette-grad)" strokeWidth="1.5" />
                <path d="M7 24 L24 24" stroke="url(#roulette-grad)" strokeWidth="1.5" />
                <path d="M41 24 L24 24" stroke="url(#roulette-grad)" strokeWidth="1.5" />
                <path d="M12 12 L24 24" stroke="url(#roulette-grad)" strokeWidth="1.5" />
                <path d="M36 36 L24 24" stroke="url(#roulette-grad)" strokeWidth="1.5" />
                <path d="M12 36 L24 24" stroke="url(#roulette-grad)" strokeWidth="1.5" />
                <path d="M36 12 L24 24" stroke="url(#roulette-grad)" strokeWidth="1.5" />
                
                {/* Inner ring */}
                <circle cx="24" cy="24" r="12" stroke="url(#roulette-grad)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
                <circle cx="24" cy="24" r="5" fill="#ffb84d" />
                
                {/* Ball */}
                <circle cx="33" cy="15" r="2.5" fill="#ffffff" />
                
                <defs>
                  <linearGradient id="roulette-grad" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#ffb84d" />
                    <stop offset="100%" stopColor="#e50914" />
                  </linearGradient>
                </defs>
              </svg>
              {t("title")}
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Фильтры */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">{t("genre")}</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">{t("anyGenre")}</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.slug}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">{t("year")}</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">{t("anyYear")}</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-slate-500 text-sm mt-3 text-center">
              {isLoading ? t("loading") : t("available", { count: movies.length })}
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
                  <p className="text-slate-500 text-sm mt-4">{t("clickToView")}</p>
                )}
              </Link>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" stroke="#ffb84d" strokeWidth="2" fill="none" opacity="0.4" />
                  <circle cx="24" cy="24" r="16" stroke="#ffb84d" strokeWidth="1.5" fill="none" strokeDasharray="6 4" opacity="0.3" />
                  <circle cx="24" cy="24" r="4" fill="#ffb84d" opacity="0.5" />
                </svg>
                <p className="text-slate-400">{t("pressToChoose")}</p>
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
            {isSpinning ? t("spinning") : t("spin")}
          </Button>
        </div>

        {/* История */}
        {history.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 text-center">{t("history")}</h3>
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
