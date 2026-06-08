import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { securityHeaders } from "@/lib/security/headers";
import { handlePreflight, applyCorsHeaders } from "@/lib/security/cors";
import { logSecurityEvent, getClientIp } from "@/lib/security/logger";

// Middleware для авторизации, локализации и безопасности
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  // ЯВНАЯ ПРОВЕРКА ДЛЯ ПРАВОВЫХ СТРАНИЦ И ПУБЛИЧНЫХ СТРАНИЦ - САМОЕ ПЕРВОЕ, ДО ВСЕХ ОСТАЛЬНЫХ ПРОВЕРОК
  if (pathname === "/about" || pathname === "/privacy" || pathname === "/terms" || pathname === "/directors") {
    const response = NextResponse.next();
    return securityHeaders(req, applyCorsHeaders(req, response));
  }

  // Пропускаем статические файлы и API маршруты
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    (pathname.includes(".") && !pathname.startsWith("/about") && !pathname.startsWith("/privacy") && !pathname.startsWith("/terms") && !pathname.startsWith("/directors"))
  ) {
    const response = NextResponse.next();
    return securityHeaders(req, applyCorsHeaders(req, response));
  }

  // 1. Проверка на устаревший браузер (Internet Explorer) -> 505
  const userAgent = req.headers.get("user-agent") || "";
  const isObsoleteBrowser = userAgent.includes("MSIE") || userAgent.includes("Trident/");
  if (isObsoleteBrowser && pathname !== "/505") {
    const redirectUrl = new URL("/505", req.url);
    return securityHeaders(req, NextResponse.redirect(redirectUrl));
  }

  // 2. Проверка на режим обслуживания (Maintenance Mode) -> 503
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  if (isMaintenanceMode && pathname !== "/503" && pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    const redirectUrl = new URL("/503", req.url);
    return securityHeaders(req, NextResponse.redirect(redirectUrl));
  }

  const publicPaths = [
    "/",
    "/movies",
    "/actors",
    "/directors",
    "/blog",
    "/auth",
    "/challenges",
    "/calendar",
    "/search",
    "/streaming-preview",
    "/roulette",
    "/recommend",
    "/series",
    "/watch",
    "/users",
    "/about",
    "/privacy",
    "/terms",
    "/401",
    "/403",
    "/404-preview",
    "/405",
    "/500-preview",
    "/503",
    "/505",
  ];

  // Проверяем, является ли путь публичным
  const isPublicPath = publicPaths.some((path) => {
    if (pathname === path) return true;
    if (pathname.startsWith(`${path}/`)) return true;
    return false;
  });

  // Если это публичный путь, пропускаем без проверки авторизации
  if (isPublicPath) {
    const response = NextResponse.next();
    return securityHeaders(req, applyCorsHeaders(req, response));
  }

  // Обработка preflight запросов
  const preflightResponse = handlePreflight(req);
  if (preflightResponse) {
    return securityHeaders(req, preflightResponse);
  }

  // Логирование подозрительных запросов
  if (pathname.includes("..") || pathname.includes("~") || pathname.includes("//")) {
    logSecurityEvent(
      "SUSPICIOUS_ACTIVITY",
      "high",
      `Path traversal attempt detected: ${pathname}`,
      { ip, pathname },
      req
    );
    const forbiddenResponse = NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return securityHeaders(req, forbiddenResponse);
  }

  // Применяем security headers ко всем ответам
  let response = NextResponse.next();
  response = securityHeaders(req, response);
  response = applyCorsHeaders(req, response);

  // Проверяем авторизацию для защищенных маршрутов
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Проверка доступа к административной панели
  if (pathname.startsWith("/admin")) {
    if (!token) {
      // Если не вошел - отправляем на вход
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return securityHeaders(req, NextResponse.redirect(signInUrl));
    }
    if (token.role !== "ADMIN" && token.role !== "MODERATOR") {
      // Если вошел, но нет прав - на 403 Forbidden
      const redirectUrl = new URL("/403", req.url);
      return securityHeaders(req, NextResponse.redirect(redirectUrl));
    }
  }

  // Для других защищенных маршрутов проверяем наличие токена
  if (!token) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return securityHeaders(req, NextResponse.redirect(signInUrl));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
