// Система логирования безопасности

interface SecurityEvent {
  type: "RATE_LIMIT" | "AUTH_FAILURE" | "UNAUTHORIZED" | "SUSPICIOUS_ACTIVITY" | "VALIDATION_ERROR" | "IDOR_ATTEMPT";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  ip?: string;
  userId?: string;
  userAgent?: string;
}

const events: SecurityEvent[] = [];
const MAX_EVENTS = 10000; // Храним последние 10000 событий

export function logSecurityEvent(
  type: SecurityEvent["type"],
  severity: SecurityEvent["severity"],
  message: string,
  metadata?: Record<string, unknown>,
  request?: Request
) {
  const event: SecurityEvent = {
    type,
    severity,
    message,
    metadata,
    timestamp: new Date(),
    ip: request ? getClientIp(request) : undefined,
    userAgent: request?.headers.get("user-agent") || undefined,
  };

  events.push(event);

  // Ограничиваем размер массива
  if (events.length > MAX_EVENTS) {
    events.shift();
  }

  // Логируем критические события в консоль
  if (severity === "critical" || severity === "high") {
    console.error(`[SECURITY ${severity.toUpperCase()}] ${type}: ${message}`, metadata);
  } else {
    console.warn(`[SECURITY ${severity}] ${type}: ${message}`, metadata);
  }

  // В продакшене здесь можно отправлять в внешний сервис мониторинга
  // Например: Sentry, DataDog, CloudWatch и т.д.
}

export function getSecurityEvents(
  filters?: {
    type?: SecurityEvent["type"];
    severity?: SecurityEvent["severity"];
    since?: Date;
    limit?: number;
  }
): SecurityEvent[] {
  let filtered = [...events];

  if (filters?.type) {
    filtered = filtered.filter((e) => e.type === filters.type);
  }

  if (filters?.severity) {
    filtered = filtered.filter((e) => e.severity === filters.severity);
  }

  if (filters?.since) {
    filtered = filtered.filter((e) => e.timestamp >= filters.since!);
  }

  if (filters?.limit) {
    filtered = filtered.slice(-filters.limit);
  }

  return filtered.reverse(); // Новые события первыми
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

// Статистика безопасности
export function getSecurityStats() {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentEvents = events.filter((e) => e.timestamp >= last24h);

  return {
    total: events.length,
    last24h: recentEvents.length,
    byType: recentEvents.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySeverity: recentEvents.reduce((acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    critical: recentEvents.filter((e) => e.severity === "critical").length,
  };
}

