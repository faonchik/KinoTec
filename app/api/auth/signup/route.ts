import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { userSchema } from "@/lib/validations/movie";
// rateLimits handled by securityMiddleware
import { sanitizeText, validateEmail } from "@/lib/security/sanitize";
import { securityMiddleware } from "@/lib/security/middleware";
import { validateRequestSize } from "@/lib/security/requestValidation";
import { logSecurityEvent } from "@/lib/security/logger";

export async function POST(request: NextRequest) {
  // Комплексная проверка безопасности
  const securityCheck = await securityMiddleware(request, {
    rateLimitConfig: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
    },
    validateBody: true,
    maxBodySize: 1024, // 1 KB для регистрации достаточно
  });

  if (!securityCheck.allowed) {
    return securityCheck.response!;
  }

  try {
    // Проверка размера тела запроса
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const sizeCheck = validateRequestSize(request, parseInt(contentLength));
      if (!sizeCheck.valid) {
        return NextResponse.json(
          { error: "Request too large" },
          { status: 413 }
        );
      }
    }

    const body = await request.json();
    
    const validated = userSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { password } = validated.data;
    let { name, email } = validated.data;

    // Дополнительная валидация и санитизация
    email = email.toLowerCase().trim();
    name = sanitizeText(name.trim());

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Неверный формат email" },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: "Имя должно быть от 2 до 50 символов" },
        { status: 400 }
      );
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "Пароль должен быть от 6 до 128 символов" },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Логируем попытку регистрации с существующим email
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "low",
        `Registration attempt with existing email: ${email}`,
        { email },
        request
      );
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        name, // Уже санитизировано
        email, // Уже валидировано и нормализовано
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Ошибка при создании пользователя" },
      { status: 500 }
    );
  }
}

