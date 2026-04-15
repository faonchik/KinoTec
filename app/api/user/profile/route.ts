import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/security/sanitize";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio } = body;

    const updateData: {
      name?: string | null;
      bio?: string | null;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string") {
        return NextResponse.json({ error: "Имя должно быть строкой" }, { status: 400 });
      }
      const sanitizedName = sanitizeText(name.trim());
      if (sanitizedName.length > 50) {
        return NextResponse.json(
          { error: "Имя слишком длинное (максимум 50 символов)" },
          { status: 400 }
        );
      }
      updateData.name = sanitizedName || null;
    }

    if (bio !== undefined) {
      if (typeof bio !== "string" && bio !== null) {
        return NextResponse.json({ error: "Биография должна быть строкой или null" }, { status: 400 });
      }
      if (bio !== null) {
        const sanitizedBio = sanitizeText(bio.trim());
        if (sanitizedBio.length > 500) {
          return NextResponse.json(
            { error: "Биография слишком длинная (максимум 500 символов)" },
            { status: 400 }
          );
        }
        updateData.bio = sanitizedBio || null;
      } else {
        updateData.bio = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        bio: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Ошибка при обновлении профиля" }, { status: 500 });
  }
}
