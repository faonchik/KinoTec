/**
 * URL для встраиваемого плеера (iframe).
 *
 * По умолчанию — шаблон VidSrc.in по numeric TMDB id.
 * Фоллбэк-цепочка: vidsrc.in → multiembed.mov → vsembed.ru
 * Свой источник: задайте `NEXT_PUBLIC_PLAYER_MOVIE_EMBED_URL` с плейсхолдерами `{tmdbId}` и/или `{kinopoiskId}`.
 * Сериалы: `NEXT_PUBLIC_PLAYER_TV_EMBED_URL` с `{tmdbId}`, `{season}`, `{episode}`.
 *
 * Просмотр фильма: при наличии готового embed сначала показывается iframe;
 * Kinobox — по кнопке на `/watch` или если задано `NEXT_PUBLIC_WATCH_USE_KINOBOX_FIRST=true`.
 * Всегда iframe: `NEXT_PUBLIC_WATCH_USE_IFRAME_EMBED=true`.
 */

function digitsOnly(id: string): string {
  const d = id.replace(/\D/g, "");
  return d || id;
}

export function normalizeTmdbId(tmdbId: string | number | null | undefined): string | null {
  if (tmdbId == null) return null;
  const s = String(tmdbId).trim();
  if (!s) return null;
  return digitsOnly(s) || s;
}

export interface EmbedSource {
  id: string;
  label: string;
  movieUrl: (tmdbId: string, options?: { color?: string; lang?: string }) => string;
  tvUrl: (tmdbId: string, season: number, episode: number, options?: { color?: string; lang?: string }) => string;
}

export const EMBED_SOURCES: EmbedSource[] = [
  {
    id: "vsembed-su",
    label: "VidSrc (su)",
    movieUrl: (id, opts) => `https://vsembed.su/embed/movie/${id}${opts?.lang ? `?ds_lang=${opts.lang}` : ""}`,
    tvUrl: (id, s, e, opts) => `https://vsembed.su/embed/tv/${id}/${s}/${e}${opts?.lang ? `?ds_lang=${opts.lang}` : ""}`,
  },
  {
    id: "videasy",
    label: "Videasy",
    movieUrl: (id, opts) => `https://player.videasy.to/movie/${id}?overlay=true${opts?.color ? `&color=${opts.color}` : ""}`,
    tvUrl: (id, s, e, opts) => `https://player.videasy.to/tv/${id}/${s}/${e}?overlay=true${opts?.color ? `&color=${opts.color}` : ""}`,
  },
  {
    id: "vidsrc-in",
    label: "VidSrc.in",
    movieUrl: (id) => `https://vidsrc.in/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidsrc.in/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidking",
    label: "Vidking",
    movieUrl: (id, opts) => `https://www.vidking.net/embed/movie/${id}?autoPlay=true${opts?.color ? `&color=${opts.color}` : ""}`,
    tvUrl: (id, s, e, opts) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}?autoPlay=true${opts?.color ? `&color=${opts.color}` : ""}`,
  },
  {
    id: "multiembed",
    label: "Multiembed",
    movieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tvUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: "vsembed-ru",
    label: "vsembed.ru",
    movieUrl: (id) => `https://vsembed.ru/embed/movie?tmdb=${id}`,
    tvUrl: (id, s, e) => `https://vsembed.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
];

/**
 * Все доступные источники embed для фильмов (в порядке приоритета).
 * Используется для fallback-механизма в MovieEmbedPlayer.
 */
export function getMovieEmbedSources(tmdbId: string, options?: { color?: string; lang?: string }): string[] {
  return EMBED_SOURCES.map((src) => src.movieUrl(tmdbId, options));
}

/**
 * Все доступные источники embed для сериалов (в порядке приоритета).
 */
export function getTvEmbedSources(tmdbId: string, season: number, episode: number, options?: { color?: string; lang?: string }): string[] {
  return EMBED_SOURCES.map((src) => src.tvUrl(tmdbId, season, episode, options));
}


/**
 * Пользователь задал свой шаблон embed и для текущего фильма он реально подставился
 * (не дефолтный источник). Тогда оставляем iframe, а не Kinobox.
 */
export function usesExplicitMovieEmbedTemplate(input: {
  tmdbId?: string | number | null;
  kinopoiskId?: string | null;
}): boolean {
  const custom = process.env.NEXT_PUBLIC_PLAYER_MOVIE_EMBED_URL?.trim();
  if (!custom) return false;
  const tmdb = normalizeTmdbId(input.tmdbId);
  const kp = input.kinopoiskId?.trim() || null;
  if (custom.includes("{tmdbId}") && tmdb) return true;
  if (custom.includes("{kinopoiskId}") && kp) return true;
  return false;
}

export function getMovieEmbedSrc(input: {
  tmdbId?: string | number | null;
  kinopoiskId?: string | null;
}): string | null {
  const tmdb = normalizeTmdbId(input.tmdbId);
  const kp = input.kinopoiskId?.trim() || null;

  const custom = process.env.NEXT_PUBLIC_PLAYER_MOVIE_EMBED_URL?.trim();
  if (custom) {
    if (custom.includes("{tmdbId}") && tmdb) {
      return custom.replaceAll("{tmdbId}", tmdb);
    }
    if (custom.includes("{kinopoiskId}") && kp) {
      return custom.replaceAll("{kinopoiskId}", kp);
    }
    /* Кастомный URL без плейсхолдеров — не блокируем дефолтный источник / KP */
  }

  if (tmdb) {
    return `https://vsembed.su/embed/movie/${tmdb}`;
  }

  const kpDefault = process.env.NEXT_PUBLIC_PLAYER_MOVIE_KP_EMBED_URL?.trim();
  if (kpDefault && kp) {
    return kpDefault.replaceAll("{kinopoiskId}", kp);
  }

  return null;
}

export function getTvEmbedSrc(input: {
  tmdbId: string | number | null | undefined;
  season: number;
  episode: number;
}): string | null {
  const tmdb = normalizeTmdbId(input.tmdbId);
  if (!tmdb) return null;

  const custom = process.env.NEXT_PUBLIC_PLAYER_TV_EMBED_URL?.trim();
  if (
    custom &&
    custom.includes("{tmdbId}") &&
    custom.includes("{season}") &&
    custom.includes("{episode}")
  ) {
    return custom
      .replaceAll("{tmdbId}", tmdb)
      .replaceAll("{season}", String(input.season))
      .replaceAll("{episode}", String(input.episode));
  }

  return `https://vsembed.su/embed/tv/${tmdb}/${input.season}/${input.episode}`;
}
