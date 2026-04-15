import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers для защиты от различных атак
export function securityHeaders(request: NextRequest, response: NextResponse = NextResponse.next()) {
  const headers = new Headers(response.headers);

  // Content Security Policy (строгая версия)
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://kinobox.tv", // Добавлены домены Google для reCAPTCHA и Kinobox
      "style-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com", // Добавлены домены Google для стилей reCAPTCHA
      "img-src 'self' data: https://image.tmdb.org https://images.unsplash.com https://www.google.com https://www.gstatic.com blob:", // Добавлены домены Google для изображений reCAPTCHA
      "font-src 'self' data: https://www.gstatic.com", // Добавлен домен Google для шрифтов reCAPTCHA
      "connect-src 'self' https://api.themoviedb.org https://api.unsplash.com https://api.groq.com https://www.google.com https://kinobox.tv", // Добавлены домены Google для API запросов reCAPTCHA и Kinobox
      "frame-src 'self' https://kinobox.in https://kinobox.tv https://www.google.com https://tv.kinohub.vip", // Добавлены домены для iframe (reCAPTCHA, Kinobox, Kinohub)
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content",
    ].join("; ")
  );

  // X-Frame-Options (защита от clickjacking)
  headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options (защита от MIME sniffing)
  headers.set("X-Content-Type-Options", "nosniff");

  // X-XSS-Protection (устаревший, но для совместимости)
  headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy (бывший Feature-Policy)
  headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
    ].join(", ")
  );

  // Strict-Transport-Security (HSTS) - только для HTTPS
  if (request.nextUrl.protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

