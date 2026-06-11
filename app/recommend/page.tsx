import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { RecommendClient } from "./RecommendClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Что посмотреть?",
  description: "Умный помощник подберёт фильм под ваше настроение",
};

async function getGenres() {
  return await prisma.genre.findMany({ orderBy: { name: "asc" } });
}

export default async function RecommendPage() {
  const genres = await getGenres();

  return <RecommendClient genres={genres} />;
}

