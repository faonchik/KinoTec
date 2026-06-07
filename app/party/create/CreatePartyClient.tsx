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

function PosterPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded bg-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500 ${className ?? ""}`}
    >
      Нет постера
    </div>
  );
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
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f14] pb-16 pt-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(229,9,20,0.12), transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400/80">
            Новая комната
          </p>
          <h1 className="font-oswald text-3xl font-bold tracking-tight text-white sm:text-4xl">Совместный просмотр</h1>
          <p className="mt-3 text-sm text-white/45">Выберите фильм и настройте доступ. Код комнаты появится после создания.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-[#121821]/80 p-6 shadow-xl shadow-black/30">
          <h2 className="mb-4 font-oswald text-xl font-semibold text-white">Фильм</h2>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию…"
            className="mb-4 w-full rounded-xl border border-white/[0.1] bg-[#0b0f14] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20"
          />

          {selectedMovie ? (
            <div className="flex items-center gap-4 rounded-xl border border-white/[0.1] bg-[#0b0f14]/80 p-4">
              {selectedMovie.poster ? (
                <Image
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  width={60}
                  height={90}
                  className="rounded-lg object-cover"
                />
              ) : (
                <PosterPlaceholder className="h-[90px] w-[60px] shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{selectedMovie.title}</p>
                <p className="mt-1 font-mono text-xs text-red-300/80">Выбран</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMovie(null)}
                className="shrink-0 rounded-lg px-2 py-1 text-sm text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label="Снять выбор"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {filteredMovies.slice(0, 20).map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => setSelectedMovie(movie)}
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/[0.03] p-3 text-left transition hover:border-white/[0.08] hover:bg-white/[0.06]"
                >
                  {movie.poster ? (
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      width={40}
                      height={60}
                      className="rounded object-cover"
                    />
                  ) : (
                    <PosterPlaceholder className="h-[60px] w-10 shrink-0" />
                  )}
                  <span className="truncate text-sm text-white/90">{movie.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-[#121821]/80 p-6 shadow-xl shadow-black/30">
          <h2 className="mb-4 font-oswald text-xl font-semibold text-white">Параметры</h2>

          <div className="mb-4">
            <label className="mb-2 block text-sm text-white/55">Название (необязательно)</label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Например: вечерний сеанс"
              className="w-full rounded-xl border border-white/[0.1] bg-[#0b0f14] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm text-white/55">Доступ</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  isPublic
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/[0.08] bg-[#0b0f14]/60 hover:border-white/15"
                }`}
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-400/90">Открытая</p>
                <p className="mt-1 text-sm font-medium text-white">Без пароля</p>
                <p className="mt-1 text-xs text-white/40">Вход по коду из списка</p>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  !isPublic
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-white/[0.08] bg-[#0b0f14]/60 hover:border-white/15"
                }`}
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-red-300/90">Закрытая</p>
                <p className="mt-1 text-sm font-medium text-white">С паролем</p>
                <p className="mt-1 text-xs text-white/40">Только с паролем</p>
              </button>
            </div>
          </div>

          {!isPublic && (
            <div className="mb-4">
              <label className="mb-2 block text-sm text-white/55">Пароль</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Задайте пароль"
                className="w-full rounded-xl border border-white/[0.1] bg-[#0b0f14] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-white/55">Максимум зрителей: {maxUsers}</label>
            <input
              type="range"
              min={2}
              max={50}
              value={maxUsers}
              onChange={(e) => setMaxUsers(parseInt(e.target.value, 10))}
              className="w-full accent-[#e50914]"
            />
            <div className="flex justify-between text-xs text-white/35">
              <span>2</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCreate}
          disabled={!selectedMovie || isCreating || (!isPublic && !password)}
          className="w-full py-4 text-base font-semibold"
        >
          {isCreating ? "Создание…" : "Создать комнату"}
        </Button>

        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#121821]/40 p-6">
          <h3 className="font-oswald text-lg font-semibold text-white">Как это работает</h3>
          <ol className="mt-3 space-y-2 text-sm text-white/45">
            <li>1. Выберите фильм.</li>
            <li>2. Создайте комнату и получите код.</li>
            <li>3. Отправьте код друзьям.</li>
            <li>4. Смотрите синхронно и пишите в чате комнаты.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
