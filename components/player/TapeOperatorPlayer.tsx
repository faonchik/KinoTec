"use client";

import { useEffect, useRef } from "react";

interface Props {
  kinopoiskId?: string | number;
  imdbId?: string;
  tmdbId?: string | number;
  title?: string;
  year?: number | null; // optional, currently unused by the player
  className?: string;
  onFallback?: () => void;
}

/**
 * Embeds the Tape Operator player via an iframe.
 * Stores movie metadata in localStorage under a temporary key,
 * which the player reads from `window.location.search`.
 */
export function TapeOperatorPlayer({
  kinopoiskId,
  imdbId,
  tmdbId,
  title,
  className = "",
  onFallback,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!title) {
      onFallback?.();
      return;
    }
    const movieData: Record<string, string> = { title };
    if (kinopoiskId) movieData.kinopoisk = String(kinopoiskId).trim();
    if (imdbId) movieData.imdb = imdbId.trim();
    if (tmdbId) movieData.tmdb = String(tmdbId).trim();

    const key = `tape-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, JSON.stringify(movieData));
    const src = `/tape-operator/player/index.html?movie=${key}`;
    if (iframeRef.current) {
      iframeRef.current.src = src;
    }
    return () => {
      localStorage.removeItem(key);
    };
  }, [kinopoiskId, imdbId, tmdbId, title, onFallback]);

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-[#0D1420] ${className}`}>
      <iframe
        ref={iframeRef}
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        title={title ?? "Tape Operator Player"}
      />
    </div>
  );
}
