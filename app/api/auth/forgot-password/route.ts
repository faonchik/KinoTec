import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail, generateResetToken } from "@/lib/email";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Некорректный email адрес"),
});

export async function POST(request: NextRequest) {
  try {
    // Проверяем наличие Gmail SMTP настроек
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPassword = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
    
    if (!smtpUser || !smtpPassword) {
      console.error("Gmail SMTP credentials not configured:", {
        hasUser: !!smtpUser,
        hasPassword: !!smtpPassword,
      });
      return NextResponse.json(
        { error: "Gmail SMTP настройки не настроены. Обратитесь к администратору." },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    const validated = forgotPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validated.data;

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Для безопасности всегда возвращаем успех, даже если пользователь не найден
    // Это предотвращает перебор email адресов
    if (!user) {
      return NextResponse.json(
        { message: "Если аккаунт с таким email существует, мы отправили инструкции на почту" },
        { status: 200 }
      );
    }

    // Генерируем токен
    const token = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Токен действителен 1 час

    // Удаляем старые токены для этого пользователя
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Создаем новый токен
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Отправляем email
    try {
      await sendPasswordResetEmail(email, token, user.name || undefined);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      
      // Удаляем токен, если не удалось отправить email
      await prisma.passwordResetToken.deleteMany({
        where: { token },
      });
      
      // Возвращаем более детальное сообщение об ошибке
      const errorMessage = emailError instanceof Error 
        ? emailError.message 
        : "Не удалось отправить email. Проверьте настройки Gmail SMTP.";
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Если аккаунт с таким email существует, мы отправили инструкции на почту" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage.includes("SMTP") || errorMessage.includes("email") 
          ? "Не удалось отправить email. Проверьте настройки SMTP." 
          : "Произошла ошибка при обработке запроса" },
      { status: 500 }
    );
  }
}

