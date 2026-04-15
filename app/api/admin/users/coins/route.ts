import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimits } from "@/lib/security/rateLimit";
import { validateId } from "@/lib/security/validation";
import { sanitizeText } from "@/lib/security/sanitize";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
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

    const body = await request.json();
    const { userId, amount } = body;
    let { description } = body;

    // Валидация
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId обязателен" }, { status: 400 });
    }

    if (!validateId(userId)) {
      return NextResponse.json({ error: "Неверный формат userId" }, { status: 400 });
    }

    if (typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json({ error: "amount должен быть числом" }, { status: 400 });
    }

    // Ограничение суммы
    if (Math.abs(amount) > 100000) {
      return NextResponse.json(
        { error: "Сумма не может превышать 100000" },
        { status: 400 }
      );
    }

    if (amount === 0) {
      return NextResponse.json({ error: "Сумма не может быть нулевой" }, { status: 400 });
    }

    // Санитизация description
    if (description && typeof description === "string") {
      description = sanitizeText(description.trim()).substring(0, 500);
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, coins: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // Обновляем баланс и создаём транзакцию
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: amount },
          ...(amount > 0 && { totalCoinsEarned: { increment: amount } }),
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          amount,
          type: amount > 0 ? "ADMIN_GRANT" : "ADMIN_REMOVE",
          description: description || (amount > 0 ? `Начислено админом: ${session.user.name || session.user.email}` : `Списано админом: ${session.user.name || session.user.email}`),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.coins,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Admin coins error:", error);
    return NextResponse.json({ error: "Ошибка при изменении баланса" }, { status: 500 });
  }
}

