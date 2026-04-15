// Защита от SSRF (Server-Side Request Forgery) и path traversal

import { logSecurityEvent } from "./logger";

// Разрешённые домены для внешних запросов
const ALLOWED_DOMAINS = [
  "api.themoviedb.org",
  "api.unsplash.com",
  "api.groq.com",
  "image.tmdb.org",
  "images.unsplash.com",
];

// Разрешённые протоколы
const ALLOWED_PROTOCOLS = ["http:", "https:"];

// Запрещённые IP диапазоны (внутренние сети)
const FORBIDDEN_IP_RANGES = [
  /^127\./,           // localhost
  /^10\./,            // private network
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // private network
  /^192\.168\./,      // private network
  /^169\.254\./,      // link-local
  /^::1$/,            // IPv6 localhost
  /^fc00:/,           // IPv6 private
  /^fe80:/,           // IPv6 link-local
];

export function validateUrl(url: string, request?: Request): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    // Проверка протокола
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      if (request) {
        logSecurityEvent(
          "SUSPICIOUS_ACTIVITY",
          "high",
          `Attempt to use forbidden protocol: ${parsed.protocol}`,
          { url, protocol: parsed.protocol },
          request
        );
      }
      return { valid: false, error: "Forbidden protocol" };
    }

    // Проверка домена
    if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
      if (request) {
        logSecurityEvent(
          "SUSPICIOUS_ACTIVITY",
          "high",
          `Attempt to access forbidden domain: ${parsed.hostname}`,
          { url, hostname: parsed.hostname },
          request
        );
      }
      return { valid: false, error: "Forbidden domain" };
    }

    // Проверка IP адреса
    const hostname = parsed.hostname;
    for (const range of FORBIDDEN_IP_RANGES) {
      if (range.test(hostname)) {
        if (request) {
          logSecurityEvent(
            "SUSPICIOUS_ACTIVITY",
            "critical",
            `SSRF attempt to internal network: ${hostname}`,
            { url, hostname },
            request
          );
        }
        return { valid: false, error: "Forbidden IP range" };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Invalid URL format" };
  }
}

// Защита от path traversal
export function sanitizePath(path: string): string {
  // Удаляем все попытки path traversal
  return path
    .replace(/\.\./g, "") // Удаляем ..
    .replace(/\/\//g, "/") // Удаляем двойные слеши
    .replace(/^\/+/, "/") // Нормализуем начало пути
    .replace(/\/+$/, ""); // Удаляем trailing слеши
}

// Валидация пути файла
export function validateFilePath(path: string, allowedExtensions?: string[]): boolean {
  const sanitized = sanitizePath(path);

  // Проверка на path traversal
  if (sanitized.includes("..") || sanitized.includes("~")) {
    return false;
  }

  // Проверка расширения файла
  if (allowedExtensions) {
    const ext = sanitized.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return false;
    }
  }

  return true;
}

