import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { MAX_FILE_SIZES, ALLOWED_MIME_TYPES } from "@/lib/security/fileUpload";
import { securityMiddleware } from "@/lib/security/middleware";
import { logSecurityEvent } from "@/lib/security/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ avatar: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    return NextResponse.json({ avatar: user?.avatar || null });
  } catch (error) {
    console.error("Avatar fetch error:", error);
    return NextResponse.json({ avatar: null });
  }
}

export async function POST(request: NextRequest) {
  // Комплексная проверка безопасности
  const securityCheck = await securityMiddleware(request, {
    requireAuth: true,
    rateLimitConfig: {
      windowMs: 60 * 1000,
      maxRequests: 5,
    },
    maxBodySize: MAX_FILE_SIZES.avatar * 2, // base64 увеличивает размер примерно в 1.33 раза
  });

  if (!securityCheck.allowed) {
    return securityCheck.response!;
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const { avatar } = body;

    if (!avatar || typeof avatar !== "string") {
      return NextResponse.json(
        { error: "Аватар обязателен" },
        { status: 400 }
      );
    }

    // Проверяем, что это data URL
    if (!avatar.startsWith("data:image/")) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "medium",
        "Invalid avatar format attempt",
        { userId: session.user.id },
        request
      );
      return NextResponse.json(
        { error: "Неверный формат изображения" },
        { status: 400 }
      );
    }

    // Извлекаем MIME тип
    const mimeMatch = avatar.match(/^data:image\/([^;]+);base64,/);
    if (!mimeMatch) {
      return NextResponse.json(
        { error: "Неверный формат изображения" },
        { status: 400 }
      );
    }

    const mimeType = `image/${mimeMatch[1]}`;
    
    // Валидация MIME типа
    if (!ALLOWED_MIME_TYPES.image.includes(mimeType)) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "high",
        `Invalid MIME type for avatar: ${mimeType}`,
        { userId: session.user.id, mimeType },
        request
      );
      return NextResponse.json(
        { error: "Неподдерживаемый формат изображения. Разрешены: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Проверка размера (base64 примерно на 33% больше оригинала)
    const base64Data = avatar.split(",")[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: "Неверный формат данных" },
        { status: 400 }
      );
    }

    const estimatedSize = (base64Data.length * 3) / 4;
    if (estimatedSize > MAX_FILE_SIZES.avatar) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "medium",
        `Avatar file too large: ${estimatedSize} bytes`,
        { userId: session.user.id, size: estimatedSize },
        request
      );
      return NextResponse.json(
        { error: `Размер файла превышает ${Math.round(MAX_FILE_SIZES.avatar / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    // Обновляем аватар пользователя
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar },
      select: {
        id: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      message: "Аватар обновлён",
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error("Avatar update error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении аватара" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Удаляем аватар
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
    });

    return NextResponse.json({ message: "Аватар удалён" });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении аватара" },
      { status: 500 }
    );
  }
}

