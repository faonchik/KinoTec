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

    const { itemId, equip } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: "Не указан предмет" }, { status: 400 });
    }

    // Проверяем, что предмет куплен
    const userItem = await prisma.userShopItem.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
      include: { item: true },
    });

    if (!userItem) {
      return NextResponse.json({ error: "Предмет не куплен" }, { status: 400 });
    }

    // Обновляем статус применения
    await prisma.userShopItem.update({
      where: { id: userItem.id },
      data: { isEquipped: equip !== false },
    });

    // Применяем кастомизацию к профилю
    const updateData: {
      profileFrame?: string | null;
      profileBadge?: string | null;
      nameColor?: string | null;
      avatarEffect?: string | null;
      chatBubble?: string | null;
      emojiPack?: string | null;
      profileBackground?: string | null;
      theme?: string | null;
    } = {};

    if (equip !== false) {
      switch (userItem.item.type) {
        case "PROFILE_FRAME":
          // Снимаем другие рамки
          await prisma.userShopItem.updateMany({
            where: {
              userId: session.user.id,
              item: { type: "PROFILE_FRAME" },
              id: { not: userItem.id },
            },
            data: { isEquipped: false },
          });
          updateData.profileFrame = userItem.item.value;
          break;
        case "PROFILE_BADGE":
          await prisma.userShopItem.updateMany({
            where: {
              userId: session.user.id,
              item: { type: "PROFILE_BADGE" },
              id: { not: userItem.id },
            },
            data: { isEquipped: false },
          });
          updateData.profileBadge = userItem.item.value;
          break;
        case "NAME_COLOR":
          await prisma.userShopItem.updateMany({
            where: {
              userId: session.user.id,
              item: { type: "NAME_COLOR" },
              id: { not: userItem.id },
            },
            data: { isEquipped: false },
          });
          updateData.nameColor = userItem.item.value;
          break;
        case "AVATAR_EFFECT":
          await prisma.userShopItem.updateMany({
            where: {
              userId: session.user.id,
              item: { type: "AVATAR_EFFECT" },
              id: { not: userItem.id },
            },
            data: { isEquipped: false },
          });
          updateData.avatarEffect = userItem.item.value;
          break;
        case "CHAT_BUBBLE":
          await prisma.userShopItem.updateMany({
            where: {
              userId: session.user.id,
              item: { type: "CHAT_BUBBLE" },
              id: { not: userItem.id },
            },
            data: { isEquipped: false },
          });
          updateData.chatBubble = userItem.item.value;
          break;
        case "EMOJI_PACK":
          await prisma.userShopItem.updateMany({
            where: {
              userId: session.user.id,
              item: { type: "EMOJI_PACK" },
              id: { not: userItem.id },
            },
            data: { isEquipped: false },
          });
          updateData.emojiPack = userItem.item.value;
          break;
        case "BACKGROUND":
          await prisma.userShopItem.updateMany({
            where: {
              userId: session.user.id,
              item: { type: "BACKGROUND" },
              id: { not: userItem.id },
            },
            data: { isEquipped: false },
          });
          updateData.profileBackground = userItem.item.value;
          break;
        case "THEME":
          await prisma.userShopItem.updateMany({
            where: {
              userId: session.user.id,
              item: { type: "THEME" },
              id: { not: userItem.id },
            },
            data: { isEquipped: false },
          });
          updateData.theme = userItem.item.value;
          break;
      }
    } else {
      // Снимаем предмет
      switch (userItem.item.type) {
        case "PROFILE_FRAME":
          updateData.profileFrame = null;
          break;
        case "PROFILE_BADGE":
          updateData.profileBadge = null;
          break;
        case "NAME_COLOR":
          updateData.nameColor = null;
          break;
        case "AVATAR_EFFECT":
          updateData.avatarEffect = null;
          break;
        case "CHAT_BUBBLE":
          updateData.chatBubble = null;
          break;
        case "EMOJI_PACK":
          updateData.emojiPack = null;
          break;
        case "BACKGROUND":
          updateData.profileBackground = null;
          break;
        case "THEME":
          updateData.theme = "dark"; // Возвращаем к дефолтной теме
          break;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Customization error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

