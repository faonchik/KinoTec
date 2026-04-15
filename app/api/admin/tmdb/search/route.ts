import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import tmdb, { TMDBService } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");

    if (!query) {
      return NextResponse.json({ error: "Введите поисковый запрос" }, { status: 400 });
    }

    const results = await tmdb.searchMovies(query, page);

    if (!results) {
      return NextResponse.json({ error: "Ошибка при поиске. Проверьте TMDB API ключ." }, { status: 500 });
    }

    // Добавляем полные URL изображений
    const moviesWithImages = results.results.map((movie) => ({
      ...movie,
      poster_url: TMDBService.getImageUrl(movie.poster_path),
      backdrop_url: TMDBService.getBackdropUrl(movie.backdrop_path),
    }));

    return NextResponse.json({
      ...results,
      results: moviesWithImages,
    });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json({ error: "Ошибка при поиске" }, { status: 500 });
  }
}

