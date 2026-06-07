/* eslint-disable @typescript-eslint/no-explicit-any */
// Защита от Prototype Pollution

// Проверка на попытки загрязнения прототипа
export function sanitizeObjectForPrototypePollution<T extends Record<string, any>>(
  obj: T
): T {
  const dangerousKeys = ["__proto__", "constructor", "prototype"];

  const sanitized = { ...obj };

  for (const key of dangerousKeys) {
    if (key in sanitized) {
      delete sanitized[key];
    }
  }

  // Рекурсивная очистка вложенных объектов
  for (const [key, value] of Object.entries(sanitized)) {
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      sanitized[key as keyof T] = sanitizeObjectForPrototypePollution(
        value as Record<string, any>
      ) as T[keyof T];
    }
  }

  return sanitized;
}

// Проверка на опасные ключи
export function hasDangerousKeys(obj: any): boolean {
  const dangerousKeys = ["__proto__", "constructor", "prototype"];

  if (!obj || typeof obj !== "object") {
    return false;
  }

  for (const key of dangerousKeys) {
    if (key in obj) {
      return true;
    }
  }

  // Рекурсивная проверка
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      if (hasDangerousKeys(value)) {
        return true;
      }
    }
  }

  return false;
}

