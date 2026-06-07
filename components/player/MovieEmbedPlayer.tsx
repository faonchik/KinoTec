"use client";

import { useCallback, useState } from "react";

type Props = {
  src: string | null;
  title: string;
  className?: string;
};

/**
 * Обёртка над внешним embed (iframe): свой UI вокруг, без сторонних скриптов на странице.
 * `src` формируйте на сервере через `getMovieEmbedSrc` / `getTvEmbedSrc`.
 */
export function MovieEmbedPlayer({ src, title, className = "" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const onLoad = useCallback(() => setLoaded(true), []);

  if (!src) {
    return (
      <div
        className={`flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-[#0D1420] px-6 text-center ${className}`}
      >
        <p className="mb-2 text-3xl opacity-80" aria-hidden>
          🎬
        </p>
        <p className="max-w-md font-mono text-[13px] text-white/55">
          Нет TMDB id или ссылки на плеер. Добавьте `tmdbId` у фильма в базе или задайте
          `NEXT_PUBLIC_PLAYER_MOVIE_EMBED_URL` в `.env` (плейсхолдеры <code className="text-white/70">{"{tmdbId}"}</code>,{" "}
          <code className="text-white/70">{"{kinopoiskId}"}</code>).
        </p>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black ${className}`}>
      {!loaded && !failed && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#0D1420]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#ffb84d] border-t-transparent" />
            <p className="font-mono text-[13px] text-white/45">Загрузка плеера…</p>
          </div>
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0D1420] px-4 text-center">
          <p className="mb-2 text-white/80">Не удалось загрузить плеер</p>
          <p className="font-mono text-xs text-white/45">Проверьте CSP и доступность источника iframe</p>
        </div>
      )}
      <iframe
        title={title}
        src={src}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="origin"
        onLoad={onLoad}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
