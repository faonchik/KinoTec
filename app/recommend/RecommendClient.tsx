"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  poster?: string;
  releaseDate?: string;
  runtime?: number;
  description?: string;
  genres: { genre: { name: string } }[];
  director?: { name: string };
  ratings: { value: number }[];
}

interface RecommendClientProps {
  genres: Genre[];
}

const moods = [
  { id: "happy", emoji: "😊", name: "Весёлое", description: "Хочу посмеяться" },
  { id: "romantic", emoji: "💕", name: "Романтичное", description: "Для двоих" },
  { id: "thrilling", emoji: "😱", name: "Напряжённое", description: "Пощекотать нервы" },
  { id: "thoughtful", emoji: "🤔", name: "Задумчивое", description: "Пища для ума" },
  { id: "adventurous", emoji: "🗺️", name: "Приключенческое", description: "Хочу экшена" },
  { id: "sad", emoji: "😢", name: "Грустное", description: "Хочу поплакать" },
  { id: "relaxed", emoji: "😌", name: "Расслабленное", description: "Ничего сложного" },
  { id: "inspired", emoji: "✨", name: "Вдохновлённое", description: "Мотивация" },
];

const timeOptions = [
  { id: "short", label: "До 1.5 часов", max: 90 },
  { id: "medium", label: "1.5 - 2 часа", max: 120 },
  { id: "long", label: "2+ часа", max: 999 },
  { id: "any", label: "Не важно", max: 999 },
];

const companies = [
  { id: "alone", emoji: "👤", name: "Один" },
  { id: "couple", emoji: "💑", name: "С партнёром" },
  { id: "friends", emoji: "👥", name: "С друзьями" },
  { id: "family", emoji: "👨‍👩‍👧‍👦", name: "С семьёй" },
];

export function RecommendClient({ genres }: RecommendClientProps) {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("any");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");

  const toggleGenre = (slug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  };

  const getRecommendations = async () => {
    setIsLoading(true);

    try {
      // Получаем AI рекомендацию
      const mood = moods.find((m) => m.id === selectedMood);
      const company = companies.find((c) => c.id === selectedCompany);
      const time = timeOptions.find((t) => t.id === selectedTime);

      let prompt = "Порекомендуй 5 фильмов";
      if (mood) prompt += ` под ${mood.name.toLowerCase()} настроение`;
      if (selectedGenres.length) {
        const genreNames = genres
          .filter((g) => selectedGenres.includes(g.slug))
          .map((g) => g.name);
        prompt += ` в жанрах: ${genreNames.join(", ")}`;
      }
      if (company) prompt += ` для просмотра ${company.name.toLowerCase()}`;
      if (time && time.id !== "any") prompt += `. Желательно ${time.label.toLowerCase()}`;

      const aiRes = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiRecommendation(aiData.message);
      }

      // Получаем фильмы из базы
      const params = new URLSearchParams();
      if (selectedGenres.length) params.set("genres", selectedGenres.join(","));
      if (selectedTime !== "any") {
        params.set("maxRuntime", time?.max.toString() || "999");
      }

      const moviesRes = await fetch(`/api/roulette?${params.toString()}`);
      const moviesData = await moviesRes.json();

      if (moviesData.movies) {
        setResults(moviesData.movies.slice(0, 8));
      }

      setStep(5);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const avgRating = (ratings: { value: number }[]) => {
    if (!ratings?.length) return null;
    return (ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length).toFixed(1);
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedMood(null);
    setSelectedGenres([]);
    setSelectedTime("any");
    setSelectedCompany(null);
    setResults([]);
    setAiRecommendation("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">🎬 Что посмотреть?</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Ответьте на несколько вопросов и мы подберём идеальный фильм
          </p>
        </div>

        {/* Прогресс */}
        {step < 5 && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    s <= step
                      ? "bg-amber-500 text-black"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Шаг 1: Настроение */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-8">
              Какое у вас сейчас настроение?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => {
                    setSelectedMood(mood.id);
                    setStep(2);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedMood === mood.id
                      ? "bg-amber-500/20 border-amber-500"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <p className="text-white font-medium">{mood.name}</p>
                  <p className="text-slate-400 text-sm mt-1">{mood.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Шаг 2: Жанры */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Какие жанры предпочитаете?
            </h2>
            <p className="text-slate-400 mb-8">Можно выбрать несколько или пропустить</p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGenres.includes(genre.slug)
                      ? "bg-amber-500 text-black"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Назад
              </Button>
              <Button onClick={() => setStep(3)}>
                {selectedGenres.length > 0 ? "Далее" : "Пропустить"}
              </Button>
            </div>
          </div>
        )}

        {/* Шаг 3: Время */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-8">
              Сколько у вас времени?
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {timeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedTime(option.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTime === option.id
                      ? "bg-amber-500/20 border-amber-500"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <p className="text-white font-medium">{option.label}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Назад
              </Button>
              <Button onClick={() => setStep(4)}>
                Далее
              </Button>
            </div>
          </div>
        )}

        {/* Шаг 4: Компания */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-8">
              С кем будете смотреть?
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => setSelectedCompany(company.id)}
                  className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedCompany === company.id
                      ? "bg-amber-500/20 border-amber-500"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="text-3xl mb-2">{company.emoji}</div>
                  <p className="text-white font-medium">{company.name}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => setStep(3)}>
                Назад
              </Button>
              <Button onClick={getRecommendations} disabled={isLoading}>
                {isLoading ? "Подбираем..." : "🎬 Подобрать фильмы"}
              </Button>
            </div>
          </div>
        )}

        {/* Шаг 5: Результаты */}
        {step === 5 && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                🎉 Вот что мы нашли!
              </h2>
              <Button variant="secondary" onClick={resetWizard} className="mt-4">
                Начать заново
              </Button>
            </div>

            {/* AI рекомендация */}
            {aiRecommendation && (
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 rounded-xl p-6 border border-amber-500/30 mb-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🤖</div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Рекомендация КиноБота:</h3>
                    <p className="text-slate-300 whitespace-pre-wrap">{aiRecommendation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Фильмы из базы */}
            {results.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Фильмы из нашей коллекции:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {results.map((movie) => (
                    <Link key={movie.id} href={`/movies/${movie.id}`} className="group">
                      <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-amber-500/50 transition-all">
                        <div className="relative aspect-[2/3]">
                          {movie.poster ? (
                            <Image
                              src={movie.poster}
                              alt={movie.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-4xl">
                              🎬
                            </div>
                          )}
                          {avgRating(movie.ratings) && (
                            <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-0.5 text-sm">
                              <span className="text-amber-400">★</span>
                              <span className="text-white ml-1">{avgRating(movie.ratings)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="text-white font-medium line-clamp-1 group-hover:text-amber-400 transition-colors">
                            {movie.title}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {movie.genres?.slice(0, 2).map((mg) => (
                              <Badge key={mg.genre.name} variant="primary" className="text-xs">
                                {mg.genre.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

