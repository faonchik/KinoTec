// Валидация размеров запросов и защита от DoS

import { logSecurityEvent } from "./logger";

// Максимальные размеры
export const MAX_SIZES = {
  JSON_BODY: 1 * 1024 * 1024, // 1 MB
  URL_LENGTH: 2048,
  HEADER_SIZE: 8192, // 8 KB
  FILE_UPLOAD: 10 * 1024 * 1024, // 10 MB
  COMMENT_LENGTH: 5000,
  REVIEW_LENGTH: 10000,
  TITLE_LENGTH: 200,
  DESCRIPTION_LENGTH: 5000,
};

// Проверка размера запроса
export function validateRequestSize(
  request: Request,
  bodySize?: number
): { valid: boolean; error?: string } {
  // Проверка длины URL
  const urlLength = new URL(request.url).toString().length;
  if (urlLength > MAX_SIZES.URL_LENGTH) {
    logSecurityEvent(
      "SUSPICIOUS_ACTIVITY",
      "medium",
      `Request URL too long: ${urlLength} bytes`,
      { urlLength },
      request
    );
    return { valid: false, error: "URL too long" };
  }

  // Проверка размера тела запроса
  if (bodySize && bodySize > MAX_SIZES.JSON_BODY) {
    logSecurityEvent(
      "SUSPICIOUS_ACTIVITY",
      "high",
      `Request body too large: ${bodySize} bytes`,
      { bodySize },
      request
    );
    return { valid: false, error: "Request body too large" };
  }

  // Проверка заголовков
  let headerSize = 0;
  request.headers.forEach((value, key) => {
    headerSize += key.length + value.length;
  });

  if (headerSize > MAX_SIZES.HEADER_SIZE) {
    logSecurityEvent(
      "SUSPICIOUS_ACTIVITY",
      "medium",
      `Request headers too large: ${headerSize} bytes`,
      { headerSize },
      request
    );
    return { valid: false, error: "Headers too large" };
  }

  return { valid: true };
}

// Валидация массива (защита от массовых операций)
export function validateArraySize<T>(
  array: T[],
  maxSize: number,
  fieldName: string
): { valid: boolean; error?: string } {
  if (array.length > maxSize) {
    return {
      valid: false,
      error: `${fieldName} array too large (max ${maxSize} items)`,
    };
  }
  return { valid: true };
}

// Проверка на подозрительные паттерны в данных
export function detectSuspiciousPatterns(data: Record<string, unknown>): string[] {
  const warnings: string[] = [];

  // Проверка на слишком много специальных символов
  if (typeof data === "string") {
    const specialCharRatio = (data.match(/[^a-zA-Z0-9\s]/g) || []).length / data.length;
    if (specialCharRatio > 0.5 && data.length > 100) {
      warnings.push("High ratio of special characters");
    }

    // Проверка на повторяющиеся паттерны (возможная DoS попытка)
    if (data.length > 1000) {
      const patterns = data.match(/(.{10,})\1{5,}/g);
      if (patterns) {
        warnings.push("Repeating patterns detected");
      }
    }
  }

  return warnings;
}

