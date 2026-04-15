import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const directors = await prisma.director.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(directors);
  } catch (error) {
    console.error("Directors fetch error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении режиссёров" },
      { status: 500 }
    );
  }
}

