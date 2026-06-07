import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { outboundFetchInit } from "@/lib/outbound-http";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const raw = process.env.TMDB_API_KEY?.trim();
    if (!raw || raw === "ваш_ключ_здесь" || raw === "your_key_here") {
      return NextResponse.json({ error: "TMDB_API_KEY not set" }, { status: 500 });
    }

    const isBearer = raw.startsWith("eyJ");
    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 20;

    // Находим фильмы без обложек (или все для обновления)
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        title: true,
        originalTitle: true,
        poster: true,
        backdrop: true,
        tmdbId: true,
        releaseDate: true,
      },
      orderBy: { popularity: "desc" },
      take: limit,
    });

    const results: Array<{ title: string; status: string }> = [];

    for (const movie of movies) {
      try {
        let tmdbMovie = null;

        // Поиск по tmdbId или по названию
        if (movie.tmdbId) {
          tmdbMovie = await fetchTMDB(`/movie/${movie.tmdbId}`, raw, isBearer);
        }

        if (!tmdbMovie) {
          const query = movie.originalTitle || movie.title;
          const params: Record<string, string> = { query };
          if (movie.releaseDate) {
            params.year = new Date(movie.releaseDate).getFullYear().toString();
          }
          const searchResult = await fetchTMDB("/search/movie", raw, isBearer, params);

          if (searchResult?.results?.length > 0) {
            tmdbMovie = searchResult.results[0];
          } else if (movie.originalTitle && movie.originalTitle !== movie.title) {
            const searchResult2 = await fetchTMDB("/search/movie", raw, isBearer, { query: movie.title });
            if (searchResult2?.results?.length > 0) {
              tmdbMovie = searchResult2.results[0];
            }
          }
        }

        if (!tmdbMovie) {
          results.push({ title: movie.title, status: "not_found" });
          continue;
        }

        const poster = tmdbMovie.poster_path ? `${TMDB_IMAGE}/w500${tmdbMovie.poster_path}` : null;
        const backdrop = tmdbMovie.backdrop_path ? `${TMDB_IMAGE}/original${tmdbMovie.backdrop_path}` : null;

        const updateData: Record<string, string | null> = {};
        if (poster) updateData.poster = poster;
        if (backdrop) updateData.backdrop = backdrop;
        if (!movie.tmdbId && tmdbMovie.id) updateData.tmdbId = tmdbMovie.id.toString();

        if (Object.keys(updateData).length > 0) {
          await prisma.movie.update({
            where: { id: movie.id },
            data: updateData,
          });
          results.push({ title: movie.title, status: "updated" });
        } else {
          results.push({ title: movie.title, status: "no_changes" });
        }

        // TMDB rate limit
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        results.push({ title: movie.title, status: `error: ${err instanceof Error ? err.message : "unknown"}` });
      }
    }

    const updated = results.filter((r) => r.status === "updated").length;
    return NextResponse.json({
      success: true,
      total: movies.length,
      updated,
      results,
    });
  } catch (error) {
    console.error("Fetch covers error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function fetchTMDB(
  endpoint: string,
  apiKey: string,
  isBearer: boolean,
  params: Record<string, string> = {}
) {
  const searchParams = new URLSearchParams({ language: "ru-RU", ...params });
  if (!isBearer) searchParams.set("api_key", apiKey);

  const url = `${TMDB_BASE}${endpoint}?${searchParams}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (isBearer) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(45_000),
    ...outboundFetchInit(),
  });
  if (!res.ok) return null;
  return res.json();
}
