import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { UsersClient } from "./UsersClient";

import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("community");
  return {
    title: t("title") || "Пользователи",
    description: t("subtitle") || "Найдите друзей и кинолюбителей",
  };
}

async function getUsers() {
  const users = await prisma.user.findMany({
    where: { isPublic: true },
    select: {
      id: true,
      name: true,
      avatar: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          reviews: true,
          ratings: true,
          favorites: true,
          watchHistory: { where: { completed: true } },
          followers: true,
          following: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return users;
}

export default async function UsersPage() {
  const users = await getUsers();

  return <UsersClient users={users} />;
}

