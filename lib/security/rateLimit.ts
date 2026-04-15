// Простой in-memory rate limiter
// В продакшене лучше использовать Redis

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // Время окна в миллисекундах
  maxRequests: number; // Максимальное количество запросов
  keyGenerator?: (req: Request) => string; // Функция для генерации ключа
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options;

  return async (req: Request): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
    const key = keyGenerator
      ? keyGenerator(req)
      : req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const now = Date.now();
    const record = store[key];

    if (!record || record.resetTime < now) {
      // Создаём новую запись
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  };
}

// Предустановленные лимиты
export const rateLimits = {
  // Строгий лимит для авторизации (5 попыток в 15 минут)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyGenerator: (req) => {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      return `auth:${ip}`;
    },
  }),

  // Лимит для API (100 запросов в минуту)
  api: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 100,
  }),

  // Лимит для создания контента (10 запросов в минуту)
  create: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 10,
  }),

  // Лимит для поиска (30 запросов в минуту)
  search: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 30,
  }),

  // Лимит для комментариев (20 запросов в минуту)
  comments: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 20,
  }),
};

