const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Кэш для API ключа
let cachedApiKey: string | null = null;

async function getApiKey(): Promise<string> {
  // Сначала проверяем env
  if (process.env.TMDB_API_KEY && process.env.TMDB_API_KEY !== "ваш_ключ_здесь") {
    return process.env.TMDB_API_KEY;
  }

  // Используем кэш
  if (cachedApiKey) {
    return cachedApiKey;
  }

  // Получаем ключ через freekeys
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const freekeys = require("freekeys");
    const keys = await freekeys();
    cachedApiKey = keys.tmdb_key;
    console.log("✅ TMDB API ключ получен через freekeys");
    return cachedApiKey!;
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
  }[];
  total_pages: number;
  total_results: number;
}

export class TMDBService {
  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
    try {
      const apiKey = await getApiKey();

      const searchParams = new URLSearchParams({
        api_key: apiKey,
        language: "ru-RU",
        ...params,
      });

      const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);
      
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
