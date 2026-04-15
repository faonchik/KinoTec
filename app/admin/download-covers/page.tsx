"use client";

import { useState, useEffect } from "react";

interface Movie {
  id: string;
  title: string;
  poster: string | null;
  backdrop: string | null;
}

// Прокси для обхода DNS-блокировки TMDB в России
function proxyUrl(tmdbUrl: string): string {
  // images.weserv.nl — бесплатный CDN/прокси для изображений
  // Он скачает картинку с TMDB на своей стороне и отдаст нам
  const encoded = encodeURIComponent(tmdbUrl);
  return `https://images.weserv.nl/?url=${encoded}&n=-1`;
}

export default function DownloadCoversPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [status, setStatus] = useState("Загрузка списка фильмов...");
  const [progress, setProgress] = useState({ done: 0, total: 0, errors: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-200), msg]);

  useEffect(() => {
    fetch("/api/admin/movies-list")
      .then(r => r.json())
      .then(data => {
        if (data.movies) {
          const needDownload = data.movies.filter((m: Movie) =>
            (m.poster && m.poster.includes("image.tmdb.org")) ||
            (m.backdrop && m.backdrop.includes("image.tmdb.org"))
          );
          setMovies(needDownload);
          setStatus(`Найдено ${needDownload.length} фильмов с TMDB-обложками для скачивания`);
        }
      })
      .catch(() => setStatus("Ошибка загрузки списка"));
  }, []);

  const downloadAll = async () => {
    setIsRunning(true);
    setProgress({ done: 0, total: movies.length, errors: 0 });
    let done = 0, errors = 0;

    for (const movie of movies) {
      try {
        // Скачиваем poster через прокси
        if (movie.poster && movie.poster.includes("image.tmdb.org")) {
          const proxied = proxyUrl(movie.poster);
          addLog(`⏳ poster: ${movie.title}...`);
          const resp = await fetch(proxied);
          if (resp.ok) {
            const blob = await resp.blob();
            if (blob.size > 1000) { // Минимум 1KB — иначе не картинка
              const formData = new FormData();
              formData.append("file", blob, `${movie.id}.jpg`);
              formData.append("movieId", movie.id);
              formData.append("type", "poster");
              const saveResp = await fetch("/api/admin/save-cover", { method: "POST", body: formData });
              if (saveResp.ok) {
                addLog(`✅ poster: ${movie.title} (${(blob.size / 1024).toFixed(0)}KB)`);
              } else {
                addLog(`⚠️ poster save error: ${movie.title}`);
              }
            } else {
              addLog(`⚠️ poster too small: ${movie.title} (${blob.size}b)`);
            }
          } else {
            addLog(`⚠️ poster ${resp.status}: ${movie.title}`);
          }
        }

        // Скачиваем backdrop через прокси  
        if (movie.backdrop && movie.backdrop.includes("image.tmdb.org")) {
          const proxied = proxyUrl(movie.backdrop);
          const resp = await fetch(proxied);
          if (resp.ok) {
            const blob = await resp.blob();
            if (blob.size > 1000) {
              const formData = new FormData();
              formData.append("file", blob, `${movie.id}.jpg`);
              formData.append("movieId", movie.id);
              formData.append("type", "backdrop");
              const saveResp = await fetch("/api/admin/save-cover", { method: "POST", body: formData });
              if (saveResp.ok) {
                addLog(`✅ backdrop: ${movie.title} (${(blob.size / 1024).toFixed(0)}KB)`);
              } else {
                addLog(`⚠️ backdrop save error: ${movie.title}`);
              }
            }
          }
        }

        done++;
      } catch (err) {
        errors++;
        addLog(`❌ ${movie.title}: ${err instanceof Error ? err.message : "error"}`);
      }
      setProgress({ done, total: movies.length, errors });

      // Задержка для прокси rate limit
      await new Promise(r => setTimeout(r, 200));
    }

    setStatus(`Готово! Скачано: ${done}, ошибок: ${errors}. Обнови страницу сайта!`);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#151C2C] p-12">
      <h1 className="font-oswald text-3xl font-bold text-white mb-2">📥 Скачивание обложек</h1>
      <p className="font-mono text-[11px] text-[#5A6478] mb-4">Используется прокси images.weserv.nl для обхода блокировки TMDB</p>
      <p className="font-mono text-[13px] text-[#8B95A8] mb-6">{status}</p>

      {movies.length > 0 && !isRunning && (
        <button
          onClick={downloadAll}
          className="bg-[#FF8400] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-8 py-3 rounded-2xl transition-colors mb-6"
        >
          🚀 Скачать все обложки ({movies.length} фильмов)
        </button>
      )}

      {isRunning && (
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 h-3 bg-[#2A3550] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF8400] rounded-full transition-all duration-300"
                style={{ width: `${progress.total ? (progress.done / progress.total * 100) : 0}%` }}
              />
            </div>
            <span className="font-mono text-[13px] text-white min-w-[80px] text-right">
              {progress.done}/{progress.total}
            </span>
          </div>
          <p className="font-mono text-[11px] text-[#5A6478]">
            {Math.round(progress.done / progress.total * 100)}% • ~{Math.round((progress.total - progress.done) * 0.4)}с осталось
          </p>
          {progress.errors > 0 && (
            <p className="font-mono text-[11px] text-red-400 mt-1">Ошибок: {progress.errors}</p>
          )}
        </div>
      )}

      <div className="bg-[#1A2236] rounded-2xl p-4 max-h-[500px] overflow-y-auto font-mono text-[11px]">
        {log.length === 0 ? (
          <p className="text-[#5A6478]">Нажми кнопку — лог появится здесь...</p>
        ) : (
          log.map((line, i) => (
            <p key={i} className={
              line.startsWith("✅") ? "text-green-400" :
              line.startsWith("❌") ? "text-red-400" :
              line.startsWith("⚠️") ? "text-yellow-400" :
              "text-[#8B95A8]"
            }>{line}</p>
          ))
        )}
      </div>
    </div>
  );
}
