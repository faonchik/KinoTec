"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type TmdbHit = {
  id: number;
  title: string;
  release_date?: string;
  poster_url?: string | null;
};

interface AdminTmdbToolsProps {
  /** Если задан — синхронизирует текущий фильм; иначе создаёт новый через импорт. */
  movieId?: string;
}

export function AdminTmdbTools({ movieId }: AdminTmdbToolsProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbHit[]>([]);
  const [manualId, setManualId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const search = async () => {
    setMsg("");
    if (!query.trim()) {
      setMsg("Введите название для поиска");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/tmdb/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Ошибка поиска");
        setResults([]);
        return;
      }
      setResults(data.results || []);
      if (!data.results?.length) setMsg("Ничего не найдено");
    } catch {
      setMsg("Сеть или сервер недоступны");
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  const runImport = async (tmdbId: number) => {
    setBusy(true);
    setMsg("");
    try {
      if (movieId) {
        const res = await fetch(`/api/admin/movies/${movieId}/sync-from-tmdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg(data.error || "Ошибка синхронизации");
          return;
        }
        router.refresh();
        window.location.reload();
        return;
      }

      const res = await fetch("/api/admin/tmdb/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Ошибка импорта");
        return;
      }
      if (data.movie?.id) {
        router.push(`/admin/movies/${data.movie.id}`);
      }
    } catch {
      setMsg("Ошибка запроса");
    } finally {
      setBusy(false);
    }
  };

  const runManual = async () => {
    const id = parseInt(manualId.trim(), 10);
    if (!id || Number.isNaN(id)) {
      setMsg("Введите числовой TMDB ID");
      return;
    }
    await runImport(id);
  };

  return (
    <section className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="mb-3 text-lg font-semibold text-white">TMDB</h2>
      <p className="mb-4 text-sm text-white/55">
        {movieId
          ? "Поиск или ввод ID — данные подставятся в этот фильм (жанры пересоздаются)."
          : "Импорт создаёт новый фильм и открывает страницу редактирования."}
      </p>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/45">Поиск на TMDB</label>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Название фильма" />
        </div>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => void search()}>
          Найти
        </Button>
      </div>

      {results.length > 0 && (
        <ul className="mb-4 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-2">
          {results.slice(0, 15).map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-white/85 hover:bg-white/[0.06]"
            >
              <span className="min-w-0 truncate">
                {m.title}
                {m.release_date ? ` (${m.release_date.slice(0, 4)})` : ""}
              </span>
              <Button type="button" size="sm" disabled={busy} onClick={() => void runImport(m.id)}>
                {movieId ? "Подставить" : "Импорт"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/45">TMDB ID вручную</label>
          <Input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="например 550" inputMode="numeric" />
        </div>
        <Button type="button" disabled={busy} onClick={() => void runManual()}>
          {movieId ? "Синхронизировать" : "Импорт по ID"}
        </Button>
      </div>

      {msg && <p className="mt-3 text-sm text-amber-400/90">{msg}</p>}
    </section>
  );
}
