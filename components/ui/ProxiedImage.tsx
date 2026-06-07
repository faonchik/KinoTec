"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getProxiedImageUrl, optimizeTmdbImageUrl, shouldUseUnoptimized } from "@/lib/images";

interface ProxiedImageProps extends Omit<React.ComponentProps<typeof Image>, "src"> {
  src: string | null | undefined;
}

function mergeClass(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" ").trim();
}

/**
 * Постеры TMDB/Unsplash — через `/api/images/proxy` (обычный `img`), без оптимизатора Next.
 * Для `fill` задаётся `absolute inset-0`, иначе картинка часто не заполняет ячейку и выглядит «битой».
 * При ошибке загрузки — нейтральный плейсхолдер (прокси 404/JSON, сеть, устаревший URL).
 */
function directTmdbFallback(src: string): string | null {
  try {
    const parsed = new URL(src.startsWith("//") ? `https:${src}` : src);
    if (parsed.hostname !== "image.tmdb.org") return null;
    return optimizeTmdbImageUrl(parsed.toString());
  } catch {
    return null;
  }
}

export function ProxiedImage({ src, alt, ...props }: ProxiedImageProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [useDirectTmdb, setUseDirectTmdb] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    setUseDirectTmdb(false);
  }, [src]);

  if (!src) {
    return null;
  }

  const proxiedUrl = getProxiedImageUrl(src);
  const directUrl = directTmdbFallback(src);
  const displayUrl =
    useDirectTmdb && directUrl ? directUrl : proxiedUrl;
  const isProxied = shouldUseUnoptimized(displayUrl);

  if (isProxied && proxiedUrl) {
    const { fill, width, height, className, onError, onLoad, style } = props;

    const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
      if (!useDirectTmdb && directUrl) {
        setUseDirectTmdb(true);
        return;
      }
      setImgFailed(true);
      onError?.(e);
    };

    if (fill) {
      if (imgFailed) {
        return (
          <div
            className={mergeClass(
              "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950",
              className?.replace(/\bobject-\S+/g, "").trim()
            )}
            aria-hidden
          >
            <span className="select-none text-2xl opacity-45">🎬</span>
          </div>
        );
      }

      return (
        // eslint-disable-next-line @next/next/no-img-element -- TMDB/Unsplash через прокси, без оптимизатора Next
        <img
          src={displayUrl ?? proxiedUrl}
          alt={alt ?? ""}
          className={mergeClass("absolute inset-0 h-full w-full object-cover", className)}
          style={style}
          loading={props.priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleError}
          onLoad={onLoad}
        />
      );
    }

    if (imgFailed) {
      return (
        <div
          className="inline-flex items-center justify-center rounded-md bg-gradient-to-br from-zinc-800 to-zinc-950 text-xl opacity-50"
          style={{
            width: typeof width === "number" ? width : undefined,
            height: typeof height === "number" ? height : undefined,
            minWidth: typeof width === "number" ? undefined : 48,
            minHeight: typeof height === "number" ? undefined : 48,
          }}
          aria-hidden
        >
          🎬
        </div>
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element -- TMDB/Unsplash через прокси, без оптимизатора Next
      <img
        src={displayUrl ?? proxiedUrl}
        alt={alt ?? ""}
        width={width as number | undefined}
        height={height as number | undefined}
        className={className}
        style={style}
        loading={props.priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={handleError}
        onLoad={onLoad}
      />
    );
  }

  return <Image src={proxiedUrl || src} alt={alt ?? ""} {...props} unoptimized={isProxied} />;
}
