import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const kinopoisk = searchParams.get("kinopoisk");
  const tmdb = searchParams.get("tmdb");
  const imdb = searchParams.get("imdb");
  const title = searchParams.get("title");

  const queryParams = new URLSearchParams();
  if (kinopoisk) queryParams.set("kinopoisk", kinopoisk);
  if (tmdb) queryParams.set("tmdb", tmdb);
  if (imdb) queryParams.set("imdb", imdb);
  if (title) queryParams.set("title", title);

  const apiMirrors = [
    "https://api.kinobox.net/api/players",
    "https://api.kinobox.in/api/players",
    "https://api.kinobox.cc/api/players",
    "https://api.kinobox.tv/api/players"
  ];

  for (const baseUrl of apiMirrors) {
    try {
      const url = `${baseUrl}?${queryParams.toString()}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          // Return the successful response immediately
          return NextResponse.json(json);
        }
      }
    } catch (err) {
      console.warn(`Backend proxy failed for mirror ${baseUrl}:`, err);
    }
  }

  return NextResponse.json({ error: "No player sources available" }, { status: 404 });
}
