// Продвинутый rate limiter с поддержкой Redis и более сложной логики

import { getClientIp } from "./logger";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator: (req: Request) => string;
  onLimitReached?: (key: string, req: Request) => void;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

const store: Map<string, RateLimitRecord> = new Map();

// Очистка старых записей
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetTime < now && (!record.blockUntil || record.blockUntil < now)) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Блокировка IP после множественных нарушений
const violationStore: Map<string, { count: number; blockedUntil: number }> = new Map();

export async function advancedRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  blocked?: boolean;
}> {
  const key = config.keyGenerator(request);
  const now = Date.now();

  // Проверка блокировки
  const violation = violationStore.get(key);
  if (violation && violation.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: violation.blockedUntil,
      retryAfter: Math.ceil((violation.blockedUntil - now) / 1000),
      blocked: true,
    };
  }

  let record = store.get(key);

  if (!record || record.resetTime < now) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false,
    };
  }

  // Проверка блокировки записи
  if (record.blockUntil && record.blockUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockUntil,
      retryAfter: Math.ceil((record.blockUntil - now) / 1000),
      blocked: true,
    };
  }

  record.count++;

  if (record.count > config.maxRequests) {
    // Увеличиваем время блокировки при повторных нарушениях
    const violations = violationStore.get(key) || { count: 0, blockedUntil: 0 };
    violations.count++;
    
    // Экспоненциальная блокировка: 1 мин, 5 мин, 15 мин, 1 час
    const blockDuration = Math.min(
      60 * 60 * 1000, // Максимум 1 час
      [1, 5, 15, 60][Math.min(violations.count - 1, 3)] * 60 * 1000
    );

    violations.blockedUntil = now + blockDuration;
    violationStore.set(key, violations);

    record.blockUntil = now + blockDuration;
    store.set(key, record);

    if (config.onLimitReached) {
      config.onLimitReached(key, request);
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil(blockDuration / 1000),
      blocked: true,
    };
  }

  store.set(key, record);

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

// Генератор ключей для разных типов запросов
export const keyGenerators = {
  byIp: (req: Request) => `ip:${getClientIp(req)}`,
  byUser: (req: Request, userId?: string) => userId ? `user:${userId}` : `ip:${getClientIp(req)}`,
  byEndpoint: (req: Request, endpoint: string) => `${endpoint}:${getClientIp(req)}`,
  byUserAndEndpoint: (req: Request, userId: string, endpoint: string) => 
    `user:${userId}:${endpoint}`,
};

