import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { rateLimits } from "@/lib/security/rateLimit";
import { ratingSchema } from "@/lib/security/validation";
import { validateId } from "@/lib/security/validation";
import { sanitizeRequestBody } from "@/lib/security/requestSanitizer";
import { securityMiddleware } from "@/lib/security/middleware";

// Получить оценку пользователя
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ rating: null });
  }

  const { movieId } = await params;

  const rating = await prisma.rating.findUnique({
    where: {
      userId_movieId: {
        userId: session.user.id,
        movieId,
      },
    },
  });

  return NextResponse.json({ rating: rating?.value || null });
}

// Поставить/обновить оценку
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
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

  const { movieId } = await params;

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

  // Валидация
  const validated = ratingSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: validated.error.errors[0].message },
      { status: 400 }
    );
  }

  const { value } = validated.data;

  try {
    // Получаем существующий рейтинг
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
    });

    const rating = await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
      update: { value },
      create: {
        userId: session.user.id,
        movieId,
        value,
      },
    });

    // Сохраняем историю изменений, если рейтинг изменился
    if (existingRating && existingRating.value !== value) {
      await prisma.ratingHistory.create({
        data: {
          ratingId: rating.id,
          oldValue: existingRating.value,
          newValue: value,
        },
      });
    } else if (!existingRating) {
      // Первая оценка
      await prisma.ratingHistory.create({
        data: {
          ratingId: rating.id,
          oldValue: null,
          newValue: value,
        },
      });
    }

    // Создаём активность
    await prisma.activity.create({
      data: {
        type: "RATED_MOVIE",
        userId: session.user.id,
        movieId,
        metadata: { rating: value },
      },
    });

    return NextResponse.json({ success: true, rating: rating.value });
  } catch (error) {
    console.error("Rating error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

// Удалить оценку
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId } = await params;

  try {
    await prisma.rating.delete({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
    });

    return NextResponse.json({ success: true, rating: null });
  } catch {
    return NextResponse.json({ success: true, rating: null });
  }
}

