import { NextRequest, NextResponse } from "next/server";

// Разрешаем самоподписанные сертификаты для проксирования внешних зеркал в dev/тест средах
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

  const fetchMirror = async (baseUrl: string) => {
    const url = `${baseUrl}?${queryParams.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
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
        if (json && Array.isArray(json.data) && json.data.length > 0) {
          return json;
        }
      }
      throw new Error(`Mirror ${baseUrl} returned empty or invalid response`);
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    // Получаем первый успешный ответ от любого из зеркал
    const result = await Promise.any(apiMirrors.map((baseUrl) => fetchMirror(baseUrl)));
    return NextResponse.json(result);
  } catch (err) {
    console.error("All Kinobox mirrors failed:", err);
    return NextResponse.json({ error: "No player sources available" }, { status: 404 });
  }
}
