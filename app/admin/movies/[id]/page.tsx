"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { MovieFormData } from "@/lib/validations/movie";
import { AdminTmdbTools } from "@/components/admin/AdminTmdbTools";

interface Genre {
  id: string;
  name: string;
}

interface Director {
  id: string;
  name: string;
}

export default function EditMoviePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const movieId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingActors, setIsUpdatingActors] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
      try {
        setIsLoading(true);

        const [genresRes, directorsRes, movieRes] = await Promise.all([
          fetch("/api/genres"),
          fetch("/api/directors"),
          fetch(`/api/admin/movies/${movieId}`),
        ]);

        if (genresRes.ok) setGenres(await genresRes.json());
        if (directorsRes.ok) setDirectors(await directorsRes.json());

        if (!movieRes.ok) {
          const errorText = await movieRes.text();
          let errorMessage = "Не удалось загрузить фильм";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `${errorMessage} (${movieRes.status})`;
          }
          throw new Error(errorMessage);
        }

        const movie = await movieRes.json();

        setFormData({
          title: movie.title || "",
          originalTitle: movie.originalTitle || "",
          description: movie.description || "",
          poster: movie.poster || "",
          backdrop: movie.backdrop || "",
          trailer: movie.trailer || "",
          releaseDate: movie.releaseDate ? movie.releaseDate.substring(0, 10) : "",
          runtime: movie.runtime ? String(movie.runtime) : "",
          country: movie.country || "",
          directorId: movie.directorId || "",
          genreIds: movie.genres?.map((g: { genreId: string }) => g.genreId) || [],
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Ошибка загрузки данных");
      } finally {
        setIsLoading(false);
      }
    }

    if (movieId) {
      loadData();
    }
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const body: Partial<MovieFormData> = {
        title: formData.title,
        originalTitle: formData.originalTitle || undefined,
        description: formData.description || undefined,
        poster: formData.poster || undefined,
        backdrop: formData.backdrop || undefined,
        trailer: formData.trailer || undefined,
        releaseDate: formData.releaseDate || undefined,
        runtime: formData.runtime ? Number(formData.runtime) : undefined,
        country: formData.country || undefined,
        directorId: formData.directorId || undefined,
        genreIds: formData.genreIds,
      };

      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Ошибка при сохранении фильма" }));
        throw new Error(data.error || "Ошибка при сохранении фильма");
      }

      router.push("/admin/movies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при сохранении фильма");
    } finally {
      setIsSaving(false);
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

  const handleUpdateActors = async () => {
    if (!movieId) return;

    setIsUpdatingActors(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/movies/${movieId}/update-actors`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при обновлении актёров");
      }

      setSuccess(data.message || "Актёры успешно обновлены");
      // Перезагружаем страницу через небольшую задержку
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при обновлении актёров");
    } finally {
      setIsUpdatingActors(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-slate-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Редактировать фильм</h1>

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

        <div className="mb-8 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <AdminTmdbTools movieId={movieId} />
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

          <div className="pt-4 space-y-4">
            <div className="flex gap-4">
              <Button type="submit" isLoading={isSaving}>
                Сохранить изменения
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Отмена
              </Button>
            </div>
            
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-2">Обновление актёров</h3>
              <p className="text-sm text-slate-400 mb-4">
                Обновить список актёров из TMDB для этого фильма. Будут добавлены все актёры из базы TMDB.
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={handleUpdateActors}
                isLoading={isUpdatingActors}
              >
                {isUpdatingActors ? "Обновление..." : "Обновить актёров из TMDB"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


