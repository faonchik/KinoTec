import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

/**
 * Тестовый endpoint для проверки настроек Gmail
 * Доступен только для администраторов
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    // Проверяем настройки
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPassword = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

    if (!smtpUser || !smtpPassword) {
      return NextResponse.json(
        {
          error: "Gmail SMTP настройки не найдены",
          details: {
            hasUser: !!smtpUser,
            hasPassword: !!smtpPassword,
            envVars: {
              SMTP_USER: !!process.env.SMTP_USER,
              GMAIL_USER: !!process.env.GMAIL_USER,
              SMTP_PASS: !!process.env.SMTP_PASS,
              SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
              GMAIL_APP_PASSWORD: !!process.env.GMAIL_APP_PASSWORD,
            },
          },
        },
        { status: 400 }
      );
    }

    // Отправляем тестовое письмо
    await sendEmail({
      to: testEmail,
      subject: "Тестовое письмо от КиноТеки",
      html: `
        <h2>Тестовое письмо</h2>
        <p>Если вы получили это письмо, значит настройки Gmail SMTP работают правильно!</p>
        <p>Время отправки: ${new Date().toLocaleString("ru-RU")}</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Тестовое письмо отправлено на ${testEmail}`,
      settings: {
        smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
        smtpPort: process.env.SMTP_PORT || "587",
        smtpUser: smtpUser.substring(0, 3) + "***", // Скрываем email
      },
    });
  } catch (error) {
    console.error("Test email error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
    
    return NextResponse.json(
      {
        error: "Не удалось отправить тестовое письмо",
        details: errorMessage,
        troubleshooting: [
          "Проверьте, что используете пароль приложения Gmail (App Password), а не обычный пароль",
          "Убедитесь, что двухфакторная аутентификация включена в Google аккаунте",
          "Проверьте, что переменные окружения загружены (перезапустите сервер после изменения .env)",
          "Проверьте консоль сервера для детальной информации об ошибке",
        ],
      },
      { status: 500 }
    );
  }
}

