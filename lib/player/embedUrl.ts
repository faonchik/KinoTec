/**
 * URL для встраиваемого плеера (iframe).
 *
 * По умолчанию — шаблон VidSrc по numeric TMDB id (как в типичных демо «карточки + iframe»).
 * Свой источник: задайте `NEXT_PUBLIC_PLAYER_MOVIE_EMBED_URL` с плейсхолдерами `{tmdbId}` и/или `{kinopoiskId}`.
 * Сериалы: `NEXT_PUBLIC_PLAYER_TV_EMBED_URL` с `{tmdbId}`, `{season}`, `{episode}`.
 *
 * Просмотр фильма: при наличии готового embed (по умолчанию VidSrc) сначала показывается iframe;
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

/**
 * Пользователь задал свой шаблон embed и для текущего фильма он реально подставился
 * (не дефолтный VidSrc). Тогда оставляем iframe, а не Kinobox.
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
    /* Кастомный URL без плейсхолдеров — не блокируем дефолтный VidSrc / KP */
  }

  if (tmdb) {
    return `https://vidsrc.to/embed/movie/${tmdb}`;
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

  return `https://vidsrc.to/embed/tv/${tmdb}/${input.season}/${input.episode}`;
}
