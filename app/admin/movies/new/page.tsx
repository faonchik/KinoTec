"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { AdminTmdbTools } from "@/components/admin/AdminTmdbTools";

interface Genre {
  id: string;
  name: string;
}

interface Director {
  id: string;
  name: string;
}

export default function NewMoviePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);

  const uniqueGenres = useMemo(() => {
    const byKey = new Map<string, Genre>();
    for (const g of genres) {
      const k = g.name.trim().toLowerCase();
      if (!byKey.has(k)) byKey.set(k, g);
    }
    return [...byKey.values()];
  }, [genres]);

  const [formData, setFormData] = useState({
    title: "",
    originalTitle: "",
    description: "",
    poster: "",
    backdrop: "",
    trailer: "",
    releaseDate: "",
    runtime: "",
    country: "",
    directorId: "",
    genreIds: [] as string[],
  });

  useEffect(() => {
    async function loadData() {
      const [genresRes, directorsRes] = await Promise.all([
        fetch("/api/genres"),
        fetch("/api/directors"),
      ]);
      
      if (genresRes.ok) setGenres(await genresRes.json());
      if (directorsRes.ok) setDirectors(await directorsRes.json());
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          runtime: formData.runtime ? parseInt(formData.runtime) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка при создании фильма");
      }

      const movie = await response.json();
      router.push(`/admin/movies/${movie.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании фильма");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreChange = (genreId: string) => {
    setFormData((prev) => ({
      ...prev,
      genreIds: prev.genreIds.includes(genreId)
        ? prev.genreIds.filter((id) => id !== genreId)
        : [...prev.genreIds, genreId],
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Добавить фильм</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="mb-8 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <AdminTmdbTools />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Название *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Оригинальное название"
            value={formData.originalTitle}
            onChange={(e) => setFormData({ ...formData, originalTitle: e.target.value })}
          />

          <Textarea
            label="Описание"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Дата выхода"
              type="date"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            />

            <Input
              label="Длительность (мин)"
              type="number"
              value={formData.runtime}
              onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
            />
          </div>

          <Input
            label="Страна"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />

          <Select
            label="Режиссёр"
            value={formData.directorId}
            onChange={(e) => setFormData({ ...formData, directorId: e.target.value })}
            options={[
              { value: "", label: "Выберите режиссёра" },
              ...directors.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Жанры
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueGenres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreChange(genre.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    formData.genreIds.includes(genre.id)
                      ? "bg-amber-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="URL постера"
            type="url"
            value={formData.poster}
            onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
            placeholder="https://..."
          />

          <Input
            label="URL обложки (backdrop)"
            type="url"
            value={formData.backdrop}
            onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
            placeholder="https://..."
          />

          <Input
            label="URL трейлера"
            type="url"
            value={formData.trailer}
            onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
          />

          <div className="flex gap-4 pt-4">
            <Button type="submit" isLoading={isLoading}>
              Создать фильм
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

