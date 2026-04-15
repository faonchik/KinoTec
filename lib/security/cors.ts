// Строгие CORS настройки

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

// Проверка origin
export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;

  // В development разрешаем localhost
  if (process.env.NODE_ENV === "development") {
    if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      return true;
    }
  }

  // Проверяем разрешённые origins
  if (ALLOWED_ORIGINS.length > 0) {
    return ALLOWED_ORIGINS.includes(origin);
  }

  // Если origins не настроены, разрешаем только свой домен
  const siteUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL;
  if (siteUrl) {
    try {
      const siteOrigin = new URL(siteUrl).origin;
      return origin === siteOrigin;
    } catch {
      return false;
    }
  }

  return false;
}

// Применение CORS заголовков
export function applyCorsHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get("origin");

  if (origin && validateOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-CSRF-Token"
    );
    response.headers.set("Access-Control-Max-Age", "86400"); // 24 часа
  } else if (origin) {
    // Логируем попытку доступа с неразрешённого origin
    console.warn(`[CORS] Blocked origin: ${origin}`);
  }

  return response;
}

// Обработка preflight запросов
export function handlePreflight(request: NextRequest): NextResponse | null {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");

    if (origin && validateOrigin(origin)) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    return new NextResponse(null, { status: 403 });
  }

  return null;
}

