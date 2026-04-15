import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { rateLimits } from "@/lib/security/rateLimit";
import { sanitizeText, validateContentLength } from "@/lib/security/sanitize";
import { validateId } from "@/lib/security/validation";

// Получить комментарии к сериалу
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const comments = await prisma.seriesComment.findMany({
      where: {
        seriesId: id,
        parentId: null,
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
        },
      }
    );
  }

  const { id } = await params;
  const body = await request.json();
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

  // Валидация parentId если указан
  if (parentId && !validateId(parentId)) {
    return NextResponse.json({ error: "Неверный формат parentId" }, { status: 400 });
  }

  try {
    const series = await prisma.series.findUnique({ where: { id } });
    if (!series) {
      return NextResponse.json({ error: "Сериал не найден" }, { status: 404 });
    }

    // Если указан parentId, проверяем существование родительского комментария
    if (parentId) {
      const parentComment = await prisma.seriesComment.findUnique({
        where: { id: parentId },
        select: { seriesId: true },
      });

      if (!parentComment || parentComment.seriesId !== id) {
        return NextResponse.json(
          { error: "Родительский комментарий не найден" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.seriesComment.create({
      data: {
        content, // Уже санитизировано
        userId: session.user.id,
        seriesId: id,
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

