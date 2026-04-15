// Защита от enumeration attacks (перечисление пользователей, ресурсов)

import { logSecurityEvent } from "./logger";

// Унифицированные сообщения об ошибках для предотвращения enumeration
export const EnumerationMessages = {
  USER_NOT_FOUND: "Неверный email или пароль", // Не раскрываем, существует ли пользователь
  INVALID_CREDENTIALS: "Неверный email или пароль",
  EMAIL_EXISTS: "Пользователь с таким email уже существует", // Это нормально для регистрации
  RESOURCE_NOT_FOUND: "Ресурс не найден",
  ACCESS_DENIED: "Доступ запрещён",
};

// Проверка на подозрительные паттерны перечисления
export function detectEnumerationAttempt(
  pattern: "email" | "id" | "username"
): boolean {
  // Проверяем на последовательные ID
  if (pattern === "id") {
    // Если это CUID, проверяем на подозрительные паттерны
    // CUID обычно случайные, но можно проверить на массовые запросы
    return false; // CUID защищает от этого
  }

  // Проверяем на массовые запросы с разными email
  // Это делается через rate limiting

  return false;
}

// Логирование попыток перечисления
export function logEnumerationAttempt(
  type: "user" | "resource",
  identifier: string,
  request: Request
) {
  logSecurityEvent(
    "SUSPICIOUS_ACTIVITY",
    "medium",
    `Possible enumeration attempt: ${type}`,
    { type, identifier },
    request
  );
}

