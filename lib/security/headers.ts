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
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://kinobox.tv https://*.kinobox.tv",
      "style-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://kinobox.tv https://*.kinobox.tv",
      "img-src 'self' data: https://image.tmdb.org https://images.unsplash.com https://www.google.com https://www.gstatic.com blob: https://*.kinobox.tv https://*.kinohub.vip https:",
      "font-src 'self' data: https://www.gstatic.com https://kinobox.tv https://*.kinobox.tv",
      "connect-src 'self' https://api.themoviedb.org https://api.unsplash.com https://api.groq.com https://www.google.com https://kinobox.tv https://*.kinobox.tv https://*.kinohub.vip https:",
      "frame-src 'self' blob: https: https://kinobox.tv https://*.kinobox.tv https://www.google.com https://tv.kinohub.vip https://*.kinohub.vip https://vidsrc.in https://*.vidsrc.in https://multiembed.mov https://*.multiembed.mov https://vsembed.ru https://*.vsembed.ru https://vsembed.su https://*.vsembed.su https://vidsrc.me https://*.vidsrc.me https://vidsrcme.ru https://*.vidsrcme.ru https://player.vidsrc.me https://*.player.vidsrc.me https://player.videasy.to https://*.videasy.to https://www.vidking.net https://*.vidking.net",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "media-src 'self' blob: https:",
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

