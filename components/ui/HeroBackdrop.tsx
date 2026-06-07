"use client";

import { useEffect, useMemo, useState } from "react";
import { getProxiedImageUrl, optimizeTmdbImageUrl } from "@/lib/images";

type HeroBackdropProps = {
  backdrop?: string | null;
  poster?: string | null;
  /** Доп. кадры (например, stills из галереи) */
  extraSources?: (string | null | undefined)[];
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
};

function uniqueSources(
  backdrop?: string | null,
  poster?: string | null,
  extra?: (string | null | undefined)[]
): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const raw of [backdrop, poster, ...(extra ?? [])]) {
    const url = raw?.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    list.push(url);
  }
  return list;
}

/**
 * Фон hero: backdrop → poster → запасные URL → кинематографичный градиент.
 * TMDB всегда через прокси; при ошибке загрузки переключается на следующий источник.
 */
export function HeroBackdrop({
  backdrop,
  poster,
  extraSources,
  className = "absolute inset-0",
  overlayClassName,
  priority = true,
}: HeroBackdropProps) {
  const sources = useMemo(
    () => uniqueSources(backdrop, poster, extraSources),
    [backdrop, poster, extraSources]
  );

  const [index, setIndex] = useState(0);
  const [useDirectTmdb, setUseDirectTmdb] = useState(false);

  useEffect(() => {
    setIndex(0);
    setUseDirectTmdb(false);
  }, [sources]);

  const active = sources[index];
  const proxied = active ? getProxiedImageUrl(active) : null;
  const directTmdb = active ? optimizeTmdbImageUrl(active) : null;
  const imgSrc = useDirectTmdb && directTmdb ? directTmdb : proxied;
  const exhausted = index >= sources.length;

  const defaultOverlay =
    "absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/92 to-[#141414]/55";
  const topOverlay =
    "absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/25 to-[#141414]/65";

  return (
    <div className={className} aria-hidden>
      {!exhausted && imgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${imgSrc}-${index}-${useDirectTmdb ? "d" : "p"}`}
          src={imgSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => {
            if (!useDirectTmdb && directTmdb) {
              setUseDirectTmdb(true);
              return;
            }
            setIndex((i) => i + 1);
            setUseDirectTmdb(false);
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/45 via-[#121821] to-[#141414]" />
      )}

      <div className={overlayClassName ?? defaultOverlay} />
      <div className={topOverlay} />
    </div>
  );
}
