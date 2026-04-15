import { randomBytes } from "crypto";

// Генерация CSRF токена
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

// Проверка CSRF токена
export function verifyCsrfToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false;
  
  // Простая проверка - в продакшене можно использовать более сложную логику
  // с временными метками и хешированием
  return token === sessionToken;
}

// Получение CSRF токена из заголовков
export function getCsrfTokenFromRequest(request: Request): string | null {
  return request.headers.get("x-csrf-token") || 
         request.headers.get("csrf-token") || 
         null;
}

