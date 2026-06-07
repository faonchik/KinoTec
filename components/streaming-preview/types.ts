export type StreamingPreviewMovie = {
  id: string;
  title: string;
  originalTitle: string | null;
  description: string | null;
  poster: string | null;
  backdrop: string | null;
  trailer: string | null;
  videoUrl: string | null;
  runtime: number | null;
  releaseDate: string | null;
  popularity: number;
  genreNames: string[];
  genreSlugs: string[];
  avgRating: number;
  /** 0–100 demo progress for preview UI */
  demoProgress: number;
};

export type StreamingPreviewPayload = {
  hero: StreamingPreviewMovie | null;
  rows: { key: string; title: string; subtitle?: string; movies: StreamingPreviewMovie[] }[];
  pool: StreamingPreviewMovie[];
};
