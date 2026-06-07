/**
 * Утилиты для работы с изображениями
 */

const PROXY_PATH = "/api/images/proxy";

function shouldProxyTmdbImages(): boolean {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_TMDB_IMAGES_USE_PROXY === "true";
  }
  return process.env.TMDB_IMAGES_USE_PROXY === "true";
}

/** TMDB original/w1920 — десятки МБ; для UI достаточно w1280/w780. */
export function optimizeTmdbImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "image.tmdb.org") return url;
    const path = parsed.pathname;
    if (path.includes("/original/")) {
      parsed.pathname = path.replace("/original/", "/w1280/");
    } else if (path.includes("/w1920/")) {
      parsed.pathname = path.replace("/w1920/", "/w1280/");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function normalizeExternalImageUrl(url: string): string {
  const t = url.trim();
  if (t.startsWith("//")) {
    return `https:${t}`;
  }
  return t;
}

/** Если в БД лежит только путь вида /t/p/w500/... — дополняем хост TMDB */
function toAbsoluteTmdbOrUnsplash(trimmed: string): string | null {
  try {
    return new URL(trimmed).toString();
  } catch {
    if (trimmed.startsWith("/t/")) {
      return `https://image.tmdb.org${trimmed}`;
    }
    return null;
  }
}

/**
 * Возвращает URL для отображения в UI.
 * TMDB и Unsplash — через /api/images/proxy (единый источник, обход блокировок и сбоев прямой загрузки).
 * Локальные /posters/, /backdrops/ — без изменений.
 */
export function getProxiedImageUrl(originalUrl: string | null | undefined): string | null {
  if (!originalUrl) return null;

  let trimmed = originalUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/posters/") || trimmed.startsWith("/backdrops/")) {
    return trimmed;
  }

  // Уже наш прокси — не оборачиваем повторно; приводим к относительному пути
  if (trimmed.includes(PROXY_PATH)) {
    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const u = new URL(trimmed);
        return `${u.pathname}${u.search}`;
      }
    } catch {
      /* ignore */
    }
    return trimmed.startsWith("/") ? trimmed : `/${trimmed.replace(/^\/+/, "")}`;
  }

  trimmed = normalizeExternalImageUrl(trimmed);

  const absolute = toAbsoluteTmdbOrUnsplash(trimmed);
  if (!absolute) {
    return trimmed;
  }

  try {
    const parsed = new URL(absolute);
    if (parsed.hostname === "image.tmdb.org") {
      const optimized = optimizeTmdbImageUrl(parsed.toString());
      // По умолчанию — прямой URL в <img> (работает с DNS вроде Quad9 на клиенте).
      // Серверный прокси: TMDB_IMAGES_USE_PROXY=true (Docker/VPN без доступа в браузере).
      if (shouldProxyTmdbImages()) {
        return `${PROXY_PATH}?url=${encodeURIComponent(optimized)}`;
      }
      return optimized;
    }
    if (parsed.hostname === "images.unsplash.com") {
      return `${PROXY_PATH}?url=${encodeURIComponent(parsed.toString())}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

/**
 * Проверяет, нужно ли использовать <img> вместо Next.js Image (внешняя загрузка / прокси).
 */
export function shouldUseUnoptimized(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("/posters/") || url.startsWith("/backdrops/")) return false;
  return url.includes("image.tmdb.org") || url.includes(PROXY_PATH);
}

/**
 * Проверяет, является ли URL изображением TMDB
 */
export function isTMDBImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("image.tmdb.org");
}
