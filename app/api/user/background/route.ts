import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_FILE_SIZES, ALLOWED_MIME_TYPES } from "@/lib/security/fileUpload";
import { securityMiddleware } from "@/lib/security/middleware";
import { logSecurityEvent } from "@/lib/security/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileBackground: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json({ background: user.profileBackground });
  } catch (error) {
    console.error("Background fetch error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
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
    maxBodySize: MAX_FILE_SIZES.avatar * 3, // Фон может быть больше аватара
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
    const { background } = body;

    if (!background || typeof background !== "string") {
      return NextResponse.json(
        { error: "Фон обязателен" },
        { status: 400 }
      );
    }

    // Проверяем, что это data URL или URL
    if (!background.startsWith("data:image/") && !background.startsWith("http") && !background.startsWith("/")) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "medium",
        "Invalid background format attempt",
        { userId: session.user.id },
        request
      );
      return NextResponse.json(
        { error: "Неверный формат изображения" },
        { status: 400 }
      );
    }

    // Если это data URL, проверяем формат и размер
    if (background.startsWith("data:image/")) {
      const mimeMatch = background.match(/^data:image\/([^;]+);base64,/);
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
          `Invalid MIME type for background: ${mimeType}`,
          { userId: session.user.id, mimeType },
          request
        );
        return NextResponse.json(
          { error: "Неподдерживаемый формат изображения. Разрешены: JPEG, PNG, WebP, GIF" },
          { status: 400 }
        );
      }

      // Проверка размера (base64 примерно на 33% больше оригинала)
      const base64Data = background.split(",")[1];
      if (!base64Data) {
        return NextResponse.json(
          { error: "Неверный формат данных" },
          { status: 400 }
        );
      }

      const estimatedSize = (base64Data.length * 3) / 4;
      const maxSize = MAX_FILE_SIZES.avatar * 3; // Фон может быть больше
      if (estimatedSize > maxSize) {
        logSecurityEvent(
          "SUSPICIOUS_ACTIVITY",
          "medium",
          `Background file too large: ${estimatedSize} bytes`,
          { userId: session.user.id, size: estimatedSize },
          request
        );
        return NextResponse.json(
          { error: `Размер файла превышает ${Math.round(maxSize / 1024 / 1024)}MB` },
          { status: 400 }
        );
      }
    }

    // Обновляем фон профиля пользователя
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { profileBackground: background },
      select: {
        id: true,
        profileBackground: true,
      },
    });

    return NextResponse.json({
      message: "Фон профиля обновлён",
      background: updatedUser.profileBackground,
    });
  } catch (error) {
    console.error("Background update error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении фона" },
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

    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileBackground: null },
    });

    return NextResponse.json({ message: "Фон удалён" });
  } catch (error) {
    console.error("Background delete error:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении фона" },
      { status: 500 }
    );
  }
}
