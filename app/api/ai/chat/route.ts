import { NextRequest, NextResponse } from "next/server";
import { chat, type Message } from "@/lib/groq";
import { rateLimits } from "@/lib/security/rateLimit";

export async function POST(request: NextRequest) {
  // Rate limiting (для всех пользователей, включая незарегистрированных)
  const limitResult = await rateLimits.api(request);
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    // Проверяем наличие API ключа
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY не установлен");
      return NextResponse.json(
        { error: "AI сервис не настроен. Обратитесь к администратору." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Сообщения обязательны" },
        { status: 400 }
      );
    }

    // Валидация количества сообщений
    if (messages.length > 50) {
      return NextResponse.json(
        { error: "Слишком много сообщений (максимум 50)" },
        { status: 400 }
      );
    }

    // Валидация и санитизация сообщений
    const validatedMessages = messages.slice(-10).map((msg) => {
      if (!msg.role || !msg.content) {
        throw new Error("Неверный формат сообщения");
      }
      if (msg.content.length > 5000) {
        throw new Error("Сообщение слишком длинное");
      }
      return {
        role: msg.role,
        content: msg.content.substring(0, 5000), // Ограничиваем длину
      };
    });

    // Ограничиваем историю последними 10 сообщениями
    const recentMessages = validatedMessages;

    const response = await chat(recentMessages);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("AI Chat error:", error);
    
    // Более детальная информация об ошибке
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("Error details:", errorMessage);
    
    // Определяем статус код на основе ошибки
    let statusCode = 500;
    if (errorMessage.includes("403") || errorMessage.includes("Forbidden") || errorMessage.includes("запрещён")) {
      statusCode = 403;
    } else if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      statusCode = 429;
    }
    
    return NextResponse.json(
      { error: errorMessage || "Ошибка AI сервиса. Попробуйте позже." },
      { status: statusCode }
    );
  }
}

