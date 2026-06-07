import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { rateLimits } from "@/lib/security/rateLimit";
import { sanitizeText, validateContentLength } from "@/lib/security/sanitize";
import { validateId } from "@/lib/security/validation";
import { sanitizeRequestBody } from "@/lib/security/requestSanitizer";
import { securityMiddleware } from "@/lib/security/middleware";
import { revalidatePath } from "next/cache";


// Получить отзывы фильма
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: movieId } = await params;

  try {
    const reviews = await prisma.review.findMany({
      where: { movieId, isApproved: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

// Добавить отзыв
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const limitResult = await rateLimits.create(request);
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const { id: movieId } = await params;

  // Валидация ID
  if (!validateId(movieId)) {
    return NextResponse.json({ error: "Неверный формат movieId" }, { status: 400 });
  }

  // Комплексная проверка безопасности
  const securityCheck = await securityMiddleware(request, {
    requireAuth: true,
    rateLimitConfig: {
      windowMs: 60 * 1000,
      maxRequests: 10,
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

  let { content, rating } = body;

  // Валидация и санитизация
  if (!content || !content.trim()) {
    return NextResponse.json(
      { error: "Отзыв не может быть пустым" },
      { status: 400 }
    );
  }

  content = sanitizeText(content.trim());

  if (content.length < 10) {
    return NextResponse.json(
      { error: "Отзыв должен содержать минимум 10 символов" },
      { status: 400 }
    );
  }

  if (!validateContentLength(content, 10000)) {
    return NextResponse.json(
      { error: "Отзыв слишком длинный (максимум 10000 символов)" },
      { status: 400 }
    );
  }

  if (!rating || rating < 1 || rating > 10) {
    return NextResponse.json(
      { error: "Оценка должна быть от 1 до 10" },
      { status: 400 }
    );
  }

  // Проверка типа rating
  rating = parseInt(rating);
  if (isNaN(rating) || rating < 1 || rating > 10) {
    return NextResponse.json(
      { error: "Оценка должна быть числом от 1 до 10" },
      { status: 400 }
    );
  }

  try {
    // Проверяем, есть ли уже отзыв
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Вы уже оставили отзыв на этот фильм" },
        { status: 400 }
      );
    }

    // Создаём отзыв
    const review = await prisma.review.create({
      data: {
        content, // Уже санитизировано
        userId: session.user.id,
        movieId,
        isApproved: true, // Автоматически одобряем (можно изменить на false для модерации)
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Создаём/обновляем рейтинг
    await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
      update: { value: rating },
      create: {
        userId: session.user.id,
        movieId,
        value: rating,
      },
    });

    // Создаём активность
    await prisma.activity.create({
      data: {
        type: "REVIEWED_MOVIE",
        userId: session.user.id,
        movieId,
        reviewId: review.id,
      },
    });

    try {
      revalidatePath("/profile");
      revalidatePath(`/movies/${movieId}`);
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
