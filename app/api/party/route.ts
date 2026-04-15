import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Генерация уникального кода
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId, name, isPublic = true, password, maxUsers = 10 } = await request.json();

  if (!movieId) {
    return NextResponse.json({ error: "Фильм обязателен" }, { status: 400 });
  }

  // Проверяем пароль для закрытых комнат
  if (!isPublic && !password) {
    return NextResponse.json({ error: "Пароль обязателен для закрытой комнаты" }, { status: 400 });
  }

  try {
    // Генерируем уникальный код
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.watchParty.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    // Создаём пати
    const party = await prisma.watchParty.create({
      data: {
        code,
        name: name || null,
        isPublic,
        password: isPublic ? null : password,
        maxUsers: Math.min(Math.max(maxUsers, 2), 50),
        hostId: session.user.id,
        movieId,
        participants: {
          create: {
            userId: session.user.id,
          },
        },
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            poster: true,
          },
        },
      },
    });

    return NextResponse.json({ party });
  } catch (error) {
    console.error("Create party error:", error);
    return NextResponse.json({ error: "Ошибка создания" }, { status: 500 });
  }
}

