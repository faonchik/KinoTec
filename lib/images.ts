/**
 * Утилиты для работы с изображениями
 */

/**
 * Возвращает рабочий URL изображения.
 * Локальные пути (/posters/...) — как есть.
 * TMDB URL — как есть (работает с VPN в браузере).
 */
export function getProxiedImageUrl(originalUrl: string | null | undefined): string | null {
  if (!originalUrl) return null;

  // Если это уже локальный путь — отдаём как есть
  if (originalUrl.startsWith("/posters/") || originalUrl.startsWith("/backdrops/")) {
    return originalUrl;
  }

  // Если это проксированный URL, извлекаем оригинальный
  if (originalUrl.includes("/api/images/proxy")) {
    try {
      const urlObj = new URL(originalUrl, "http://localhost");
      const tmdbUrl = urlObj.searchParams.get("url");
      if (tmdbUrl) return decodeURIComponent(tmdbUrl);
    } catch {
      // ignore
    }
    return originalUrl;
  }

  // Для TMDB и всех других — как есть
  return originalUrl;
}

/**
 * Проверяет, нужно ли использовать <img> вместо Next.js Image.
 * Локальные файлы — через Next.js Image (false).
 * Внешние TMDB — через <img> (true), т.к. серверная оптимизация не работает с DNS-блокировкой.
 */
export function shouldUseUnoptimized(url: string | null | undefined): boolean {
  if (!url) return false;
  // Локальные файлы — оптимизируем через Next.js
  if (url.startsWith("/posters/") || url.startsWith("/backdrops/")) return false;
  // Внешние — через <img>
  return url.includes("image.tmdb.org") || url.includes("/api/images/proxy");
}

/**
 * Проверяет, является ли URL изображением TMDB
 */
export function isTMDBImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("image.tmdb.org");
}
