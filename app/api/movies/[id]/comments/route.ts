import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { rateLimits } from "@/lib/security/rateLimit";
import { sanitizeText, validateContentLength } from "@/lib/security/sanitize";
import { sanitizeRequestBody } from "@/lib/security/requestSanitizer";
import { validateId } from "@/lib/security/validation";
import { securityMiddleware } from "@/lib/security/middleware";

// Получить комментарии к фильму
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const comments = await prisma.movieComment.findMany({
      where: {
        movieId: id,
        parentId: null, // Только корневые комментарии
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Ошибка получения комментариев" }, { status: 500 });
  }
}

// Создать комментарий
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const limitResult = await rateLimits.comments(request);
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Remaining": limitResult.remaining.toString(),
        },
      }
    );
  }

  const { id } = await params;

  // Валидация ID
  if (!validateId(id)) {
    return NextResponse.json({ error: "Неверный формат ID" }, { status: 400 });
  }

  // Комплексная проверка безопасности
  const securityCheck = await securityMiddleware(request, {
    requireAuth: true,
    rateLimitConfig: {
      windowMs: 60 * 1000,
      maxRequests: 20,
    },
  });

  if (!securityCheck.allowed) {
    return securityCheck.response!;
  }

  const rawBody = await request.json();
  
  // Санитизация тела запроса
  const { sanitized: body, warnings } = sanitizeRequestBody(rawBody, request);
  if (warnings.length > 0) {
    console.warn("Request sanitization warnings:", warnings);
  }

  const { content: rawContent, parentId } = body;

  if (!rawContent || !rawContent.trim()) {
    return NextResponse.json({ error: "Комментарий не может быть пустым" }, { status: 400 });
  }

  // Валидация и санитизация
  const content = sanitizeText(rawContent.trim());
  
  if (!validateContentLength(content, 5000)) {
    return NextResponse.json(
      { error: "Комментарий слишком длинный (максимум 5000 символов)" },
      { status: 400 }
    );
  }

  if (content.length < 3) {
    return NextResponse.json(
      { error: "Комментарий слишком короткий (минимум 3 символа)" },
      { status: 400 }
    );
  }

  try {
    // Проверяем существование фильма
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    const comment = await prisma.movieComment.create({
      data: {
        content, // Уже санитизировано
        userId: session.user.id,
        movieId: id,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Ошибка создания комментария" }, { status: 500 });
  }
}

