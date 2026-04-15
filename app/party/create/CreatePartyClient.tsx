"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface Movie {
  id: string;
  title: string;
  poster: string | null;
}

interface CreatePartyClientProps {
  movies: Movie[];
}

export function CreatePartyClient({ movies }: CreatePartyClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [partyName, setPartyName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState("");
  const [maxUsers, setMaxUsers] = useState(10);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!selectedMovie) return;

    setIsCreating(true);

    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selectedMovie.id,
          name: partyName || null,
          isPublic,
          password: isPublic ? null : password,
          maxUsers,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/party/${data.party.code}`);
      }
    } catch (error) {
      console.error("Create party error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎉 Watch Party</h1>
          <p className="text-slate-400">Смотрите фильмы вместе с друзьями</p>
        </div>

        {/* Выбор фильма */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Выберите фильм</h2>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск фильма..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 mb-4"
          />

          {selectedMovie ? (
            <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              {selectedMovie.poster ? (
                <Image
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  width={60}
                  height={90}
                  className="rounded"
                />
              ) : (
                <div className="w-15 h-22 bg-slate-700 rounded flex items-center justify-center text-2xl">
                  🎬
                </div>
              )}
              <div className="flex-1">
                <p className="text-white font-semibold">{selectedMovie.title}</p>
                <p className="text-amber-400 text-sm">Выбран для просмотра</p>
              </div>
              <button
                onClick={() => setSelectedMovie(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredMovies.slice(0, 20).map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => setSelectedMovie(movie)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  {movie.poster ? (
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      width={40}
                      height={60}
                      className="rounded"
                    />
                  ) : (
                    <div className="w-10 h-15 bg-slate-600 rounded flex items-center justify-center">
                      🎬
                    </div>
                  )}
                  <span className="text-white">{movie.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Настройки комнаты */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Настройки комнаты</h2>

          {/* Название */}
          <div className="mb-4">
            <label className="block text-slate-300 mb-2">Название (опционально)</label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Например: Вечерний киносеанс"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Тип комнаты */}
          <div className="mb-4">
            <label className="block text-slate-300 mb-2">Тип комнаты</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  isPublic
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                }`}
              >
                <div className="text-2xl mb-1">🔓</div>
                <div className="text-white font-medium">Открытая</div>
                <p className="text-slate-400 text-xs">Любой может войти</p>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  !isPublic
                    ? "border-red-500 bg-red-500/10"
                    : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                }`}
              >
                <div className="text-2xl mb-1">🔒</div>
                <div className="text-white font-medium">Закрытая</div>
                <p className="text-slate-400 text-xs">Нужен пароль</p>
              </button>
            </div>
          </div>

          {/* Пароль */}
          {!isPublic && (
            <div className="mb-4">
              <label className="block text-slate-300 mb-2">Пароль комнаты</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Максимум участников */}
          <div>
            <label className="block text-slate-300 mb-2">
              Максимум участников: {maxUsers}
            </label>
            <input
              type="range"
              min="2"
              max="50"
              value={maxUsers}
              onChange={(e) => setMaxUsers(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-slate-500 text-sm">
              <span>2</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* Кнопка создания */}
        <Button
          onClick={handleCreate}
          disabled={!selectedMovie || isCreating || (!isPublic && !password)}
          className="w-full py-4 text-lg"
        >
          {isCreating ? "Создание..." : "🎉 Создать Watch Party"}
        </Button>

        {/* Инструкция */}
        <div className="mt-8 p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <h3 className="text-lg font-semibold text-white mb-3">Как это работает?</h3>
          <ol className="space-y-2 text-slate-400">
            <li>1. Выберите фильм для просмотра</li>
            <li>2. Создайте Watch Party и получите уникальный код</li>
            <li>3. Поделитесь кодом с друзьями</li>
            <li>4. Смотрите синхронно и общайтесь в чате!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

