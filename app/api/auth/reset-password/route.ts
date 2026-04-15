import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Токен обязателен"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validated = resetPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validated.data;

    // Ищем токен
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Недействительный или истекший токен сброса пароля" },
        { status: 400 }
      );
    }

    // Проверяем, не истек ли токен
    if (resetToken.expiresAt < new Date()) {
      // Удаляем истекший токен
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "Токен сброса пароля истек. Запросите новый." },
        { status: 400 }
      );
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Обновляем пароль пользователя
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Удаляем использованный токен
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json(
      { message: "Пароль успешно изменен" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при сбросе пароля" },
      { status: 500 }
    );
  }
}

