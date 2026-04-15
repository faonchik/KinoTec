// Комплексный middleware для безопасности

import { NextRequest, NextResponse } from "next/server";
import { advancedRateLimit, keyGenerators } from "./advancedRateLimit";
import { logSecurityEvent, getClientIp } from "./logger";
import { validateRequestSize } from "./requestValidation";
import { validateUrl } from "./ssrf";

// Применение всех проверок безопасности к запросу
export async function securityMiddleware(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    rateLimitConfig?: {
      windowMs: number;
      maxRequests: number;
    };
    validateBody?: boolean;
    maxBodySize?: number;
  } = {}
): Promise<{ allowed: boolean; response?: NextResponse; error?: string }> {
  const ip = getClientIp(request);

  // 1. Проверка размера запроса
  const sizeCheck = validateRequestSize(request);
  if (!sizeCheck.valid) {
    logSecurityEvent(
      "SUSPICIOUS_ACTIVITY",
      "high",
      `Request size validation failed: ${sizeCheck.error}`,
      { ip, url: request.url },
      request
    );
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Request too large" },
        { status: 413 }
      ),
      error: sizeCheck.error,
    };
  }

  // 2. Rate limiting
  if (options.rateLimitConfig) {
    const limitResult = await advancedRateLimit(request, {
      windowMs: options.rateLimitConfig.windowMs,
      maxRequests: options.rateLimitConfig.maxRequests,
      keyGenerator: keyGenerators.byIp,
      onLimitReached: (key, req) => {
        logSecurityEvent(
          "RATE_LIMIT",
          "high",
          `Rate limit exceeded: ${key}`,
          { ip, url: req.url },
          req
        );
      },
    });

    if (!limitResult.allowed) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: "Too many requests",
            retryAfter: limitResult.retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": limitResult.retryAfter?.toString() || "60",
            },
          }
        ),
        error: "Rate limit exceeded",
      };
    }
  }

  // 3. Проверка на подозрительные заголовки
  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /masscan/i,
      /^$/,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        logSecurityEvent(
          "SUSPICIOUS_ACTIVITY",
          "critical",
          `Suspicious user agent detected: ${userAgent}`,
          { ip, userAgent },
          request
        );
        return {
          allowed: false,
          response: NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
          ),
          error: "Suspicious user agent",
        };
      }
    }
  }

  // 4. Проверка URL на SSRF
  const urlCheck = validateUrl(request.url, request);
  if (!urlCheck.valid) {
    logSecurityEvent(
      "SUSPICIOUS_ACTIVITY",
      "critical",
      `SSRF attempt detected: ${request.url}`,
      { ip, url: request.url },
      request
    );
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
      error: urlCheck.error,
    };
  }

  return { allowed: true };
}

