import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: "Не указан предмет" }, { status: 400 });
    }

    // Получаем предмет
    const item = await prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.isActive) {
      return NextResponse.json({ error: "Предмет не найден" }, { status: 404 });
    }

    // Проверяем, не куплен ли уже
    const existing = await prisma.userShopItem.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Предмет уже куплен" }, { status: 400 });
    }

    // Проверяем баланс
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true },
    });

    if (!user || user.coins < item.price) {
      return NextResponse.json({ error: "Недостаточно монет" }, { status: 400 });
    }

    // Транзакция: списываем монеты и добавляем предмет
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { coins: { decrement: item.price } },
      }),
      prisma.userShopItem.create({
        data: {
          userId: session.user.id,
          itemId,
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId: session.user.id,
          amount: -item.price,
          type: "SPEND_SHOP",
          description: `Покупка: ${item.name}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.coins,
      item: { id: item.id, name: item.name },
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Ошибка покупки" }, { status: 500 });
  }
}

