/* eslint-disable @typescript-eslint/no-explicit-any */
// Комплексная санитизация запросов

import { sanitizeObjectForPrototypePollution, hasDangerousKeys } from "./prototypePollution";
import { detectProtectedFieldAccess } from "./massOperation";
import { logSecurityEvent } from "./logger";

// Санитизация тела запроса
export function sanitizeRequestBody<T extends Record<string, any>>(
  body: T,
  request?: Request
): { sanitized: T; warnings: string[] } {
  const warnings: string[] = [];

  // Проверка на prototype pollution
  if (hasDangerousKeys(body)) {
    warnings.push("Prototype pollution attempt detected");
    if (request) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "critical",
        "Prototype pollution attempt detected",
        { body: Object.keys(body) },
        request
      );
    }
  }

  const sanitized = sanitizeObjectForPrototypePollution(body);

  // Проверка на попытки изменения защищённых полей
  const protectedFields = detectProtectedFieldAccess(body, request);
  if (protectedFields.length > 0) {
    warnings.push(`Attempted to modify protected fields: ${protectedFields.join(", ")}`);
    // Удаляем защищённые поля
    for (const field of protectedFields) {
      delete sanitized[field];
    }
  }

  return { sanitized, warnings };
}

// Валидация параметров запроса
export function validateQueryParams(
  params: URLSearchParams,
  schema: Record<string, { type: "string" | "number" | "boolean"; maxLength?: number; required?: boolean }>
): { valid: boolean; errors: string[]; sanitized: Record<string, any> } {
  const errors: string[] = [];
  const sanitized: Record<string, any> = {};

  for (const [key, config] of Object.entries(schema)) {
    const value = params.get(key);

    if (config.required && !value) {
      errors.push(`Missing required parameter: ${key}`);
      continue;
    }

    if (!value) {
      continue;
    }

    // Проверка длины
    if (config.maxLength && value.length > config.maxLength) {
      errors.push(`Parameter ${key} too long (max ${config.maxLength})`);
      continue;
    }

    // Преобразование типа
    try {
      switch (config.type) {
        case "number":
          const num = parseInt(value, 10);
          if (isNaN(num)) {
            errors.push(`Invalid number for parameter: ${key}`);
            continue;
          }
          sanitized[key] = num;
          break;
        case "boolean":
          sanitized[key] = value === "true" || value === "1";
          break;
        case "string":
          sanitized[key] = value.trim();
          break;
      }
    } catch {
      errors.push(`Invalid format for parameter: ${key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

