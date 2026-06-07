import { isDemoMovieId } from "@/lib/streaming-preview/fallbackMovies";

export function previewMoviePageHref(id: string) {
  return isDemoMovieId(id) ? "/movies" : `/movies/${id}`;
}

export function previewWatchPageHref(id: string) {
  return isDemoMovieId(id) ? "/movies" : `/watch/${id}`;
}
