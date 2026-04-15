import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { FeedClient } from "./FeedClient";

export const metadata: Metadata = {
  title: "Лента активности",
  description: "Активность ваших друзей",
};

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return <FeedClient />;
}

