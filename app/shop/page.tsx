import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShopClient } from "./ShopClient";

export const metadata = {
  title: "Магазин | КиноТека",
  description: "Магазин кастомизации профиля",
};

export default async function ShopPage() {
  const session = await getServerSession(authOptions);

  const items = await prisma.shopItem.findMany({
    where: { isActive: true },
    orderBy: [{ rarity: "asc" }, { price: "asc" }],
  });

  const userCoins = session?.user?.id
    ? (await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { coins: true },
      }))?.coins || 0
    : 0;

  const purchasedItemIds = session?.user?.id
    ? (await prisma.userShopItem.findMany({
        where: { userId: session.user.id },
        select: { itemId: true },
      })).map((p) => p.itemId)
    : [];

  return (
    <ShopClient
      items={items}
      userCoins={userCoins}
      purchasedItemIds={purchasedItemIds}
      isAuthenticated={!!session}
    />
  );
}

