// Защита от массовых операций (mass assignment, bulk operations)

import { logSecurityEvent } from "./logger";
import { validateArraySize } from "./requestValidation";

// Максимальное количество элементов для массовых операций
export const MASS_OPERATION_LIMITS = {
  BATCH_CREATE: 10,
  BATCH_UPDATE: 20,
  BATCH_DELETE: 10,
  BATCH_IMPORT: 100,
};

// Проверка массовых операций
export function validateMassOperation<T>(
  items: T[],
  operation: keyof typeof MASS_OPERATION_LIMITS,
  request?: Request
): { valid: boolean; error?: string } {
  const limit = MASS_OPERATION_LIMITS[operation];
  const check = validateArraySize(items, limit, operation);

  if (!check.valid) {
    if (request) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "high",
        `Mass operation attempt: ${operation} with ${items.length} items`,
        { operation, count: items.length, limit },
        request
      );
    }
    return check;
  }

  return { valid: true };
}

// Защита от mass assignment
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  allowedFields: (keyof T)[]
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const field of allowedFields) {
    if (field in obj) {
      sanitized[field] = obj[field];
    }
  }

  return sanitized;
}

// Проверка на попытки изменения системных полей
const PROTECTED_FIELDS = [
  "id",
  "createdAt",
  "updatedAt",
  "role",
  "coins",
  "totalCoinsEarned",
  "password",
  "email", // Email можно менять только через специальный endpoint
];

export function detectProtectedFieldAccess(
  data: Record<string, any>,
  request?: Request
): string[] {
  const violations: string[] = [];

  for (const field of PROTECTED_FIELDS) {
    if (field in data) {
      violations.push(field);
      if (request) {
        logSecurityEvent(
          "SUSPICIOUS_ACTIVITY",
          "high",
          `Attempt to modify protected field: ${field}`,
          { field, data: Object.keys(data) },
          request
        );
      }
    }
  }

  return violations;
}

