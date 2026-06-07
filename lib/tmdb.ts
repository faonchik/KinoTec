import { outboundFetch } from "@/lib/outbound-http";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

/** v3 API Key → query `api_key=`. Read Access Token (JWT) → заголовок `Authorization: Bearer`. */
type TmdbCredentials = { token: string; useBearer: boolean };

let cachedCredentials: TmdbCredentials | null = null;

function isPlaceholderKey(raw: string): boolean {
  const t = raw.trim();
  return !t || t === "ваш_ключ_здесь" || t === "your_key_here";
}

async function getTmdbCredentials(): Promise<TmdbCredentials> {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  const raw = process.env.TMDB_API_KEY?.trim();
  if (raw && !isPlaceholderKey(raw)) {
    const useBearer = raw.startsWith("eyJ");
    cachedCredentials = { token: raw, useBearer };
    return cachedCredentials;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const freekeys = require("freekeys");
    const keys = await freekeys();
    cachedCredentials = { token: keys.tmdb_key, useBearer: false };
    console.info("TMDB API key loaded via freekeys");
    return cachedCredentials;
  } catch (error) {
    console.error("Ошибка получения API ключа:", error);
    throw new Error("Не удалось получить TMDB API ключ");
  }
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  budget: number;
  revenue: number;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
}

export interface TMDBPerson {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
}

export interface TMDBCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

export interface TMDBSearchResult {
  page: number;
  results: {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
  }[];
  total_pages: number;
  total_results: number;
}

export interface TMDBTvSearchResult {
  page: number;
  results: {
    id: number;
    name: string;
    original_name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
  }[];
  total_pages: number;
  total_results: number;
}

export class TMDBService {
  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
    try {
      const { token, useBearer } = await getTmdbCredentials();

      const searchParams = new URLSearchParams({
        language: "ru-RU",
        ...params,
      });
      if (!useBearer) {
        searchParams.set("api_key", token);
      }

      const url = `${TMDB_BASE_URL}${endpoint}?${searchParams}`;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (useBearer) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await outboundFetch(url, {
        headers,
        signal: AbortSignal.timeout(45_000),
      });

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("TMDB fetch error:", error);
      return null;
    }
  }

  // Поиск фильмов
  async searchMovies(query: string, page = 1): Promise<TMDBSearchResult | null> {
    return this.fetch<TMDBSearchResult>("/search/movie", {
      query,
      page: page.toString(),
    });
  }

  async searchTv(query: string, page = 1): Promise<TMDBTvSearchResult | null> {
    return this.fetch<TMDBTvSearchResult>("/search/tv", {
      query,
      page: page.toString(),
    });
  }

  // Получить детали фильма
  async getMovie(id: number): Promise<TMDBMovie | null> {
    return this.fetch<TMDBMovie>(`/movie/${id}`);
  }

  // Получить актёров и съёмочную группу фильма
  async getMovieCredits(movieId: number): Promise<TMDBCredits | null> {
    return this.fetch<TMDBCredits>(`/movie/${movieId}/credits`);
  }

  // Получить информацию о персоне (актёр/режиссёр)
  async getPerson(id: number): Promise<TMDBPerson | null> {
    return this.fetch<TMDBPerson>(`/person/${id}`);
  }

  // Получить популярные фильмы
  async getPopularMovies(page = 1): Promise<TMDBSearchResult | null> {
    return this.fetch<TMDBSearchResult>("/movie/popular", {
      page: page.toString(),
    });
  }

  // Получить фильмы в кинотеатрах
  async getNowPlayingMovies(page = 1): Promise<TMDBSearchResult | null> {
    return this.fetch<TMDBSearchResult>("/movie/now_playing", {
      page: page.toString(),
    });
  }

  // Получить предстоящие фильмы
  async getUpcomingMovies(page = 1): Promise<TMDBSearchResult | null> {
    return this.fetch<TMDBSearchResult>("/movie/upcoming", {
      page: page.toString(),
    });
  }

  // Получить топ рейтинговые фильмы
  async getTopRatedMovies(page = 1): Promise<TMDBSearchResult | null> {
    return this.fetch<TMDBSearchResult>("/movie/top_rated", {
      page: page.toString(),
    });
  }

  // URL для изображений
  static getImageUrl(path: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }

  static getBackdropUrl(path: string | null, size: "w300" | "w780" | "w1280" | "original" = "original"): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }
}

export const tmdb = new TMDBService();
export default tmdb;
