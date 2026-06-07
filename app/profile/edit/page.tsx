import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { EditProfileClient } from "./EditProfileClient";

export const metadata: Metadata = {
  title: "Редактирование профиля",
  description: "Измените информацию о себе",
};

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatar: true,
    },
  });

  return user;
}

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await getUserData(session.user.id);

  if (!user) {
    redirect("/auth/signin");
  }

  return <EditProfileClient user={user} />;
}
