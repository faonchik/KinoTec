import { NextRequest, NextResponse } from "next/server";
import { validateUrl } from "@/lib/security/ssrf";

// Кэш для изображений (в памяти, для production лучше использовать Redis)
const imageCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  // Декодируем URL
  const decodedUrl = decodeURIComponent(url);
  console.log("Proxying image:", decodedUrl);

  // Проверяем кэш
  const cached = imageCache.get(decodedUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("Cache HIT for:", decodedUrl);
    return new NextResponse(cached.data, {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Cache": "HIT",
        "Vary": "Accept",
      },
    });
  }

  // Валидация URL
  const validation = validateUrl(decodedUrl, request);
  if (!validation.valid) {
    console.error("Invalid URL:", validation.error, decodedUrl);
    return NextResponse.json({ error: validation.error || "Invalid URL" }, { status: 400 });
  }

  try {
    console.log("Fetching image from:", decodedUrl);
    // Загружаем изображение с TMDB
    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KinoTec/1.0)",
      },
      // Увеличиваем таймаут для медленных соединений
      signal: AbortSignal.timeout(30000), // 30 секунд
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    console.log("Image fetched successfully, size:", imageBuffer.length, "bytes");

    // Сохраняем в кэш
    imageCache.set(decodedUrl, {
      data: imageBuffer,
      contentType,
      timestamp: Date.now(),
    });

    // Очищаем старые записи из кэша (если их больше 1000)
    if (imageCache.size > 1000) {
      const entries = Array.from(imageCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      // Удаляем 100 самых старых
      for (let i = 0; i < 100 && i < entries.length; i++) {
        imageCache.delete(entries[i][0]);
      }
    }

          return new NextResponse(imageBuffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-Cache": "MISS",
              "Vary": "Accept",
            },
          });
  } catch (error) {
    console.error("Error proxying image:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}

