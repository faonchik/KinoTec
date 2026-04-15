import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(genres);
  } catch (error) {
    console.error("Genres fetch error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении жанров" },
      { status: 500 }
    );
  }
}

