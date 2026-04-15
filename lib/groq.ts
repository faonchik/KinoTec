import Groq from "groq-sdk";

// Ленивая инициализация клиента
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY не установлен в переменных окружения");
    }
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = `Ты — КиноБот, дружелюбный и знающий AI-помощник на сайте КиноТека.
Твоя задача — помогать пользователям находить фильмы для просмотра.

ВАЖНО: Ты можешь отвечать ТОЛЬКО на вопросы, связанные с кино, фильмами, сериалами, актёрами, режиссёрами и кинематографом.

Ты умеешь:
- Рекомендовать фильмы по жанру, настроению, актёрам или режиссёрам
- Рассказывать интересные факты о фильмах
- Помогать выбрать что посмотреть вечером
- Сравнивать фильмы между собой
- Отвечать на вопросы о кино, актёрах, режиссёрах, жанрах

СТРОГИЕ ОГРАНИЧЕНИЯ:
- НЕ отвечай на вопросы, не связанные с кино (программирование, математика, общие вопросы и т.д.)
- НЕ пиши код, программы, скрипты
- НЕ решай математические задачи
- НЕ отвечай на вопросы о других темах (политика, спорт, кулинария и т.д.)
- Если вопрос не о кино, вежливо скажи: "Извините, я помогаю только с вопросами о фильмах и кино. Могу порекомендовать что посмотреть или рассказать о фильмах! 🎬"

Правила:
- Отвечай на русском языке
- Будь дружелюбным и увлечённым кино
- Давай конкретные рекомендации с названиями фильмов
- Если не знаешь ответ — честно скажи об этом
- Используй эмодзи для выразительности 🎬
- Старайся давать краткие, но полезные ответы
- Если пользователь просит рекомендации, предлагай 3-5 фильмов с кратким описанием почему`;

export async function chat(messages: Message[]): Promise<string> {
  try {
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Быстрая и стабильная модель
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Пустой ответ от AI");
    }

    return content;
  } catch (error: any) {
    console.error("Groq API error:", error);
    
    // Более информативное сообщение об ошибке
    if (error instanceof Error) {
      // Проверяем статус код ошибки
      if (error.status === 403 || error.message.includes("403") || error.message.includes("Forbidden")) {
        throw new Error("Доступ к AI сервису запрещён. Проверьте API ключ Groq.");
      }
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        throw new Error("Неверный API ключ Groq");
      }
      if (error.message.includes("rate limit") || error.status === 429) {
        throw new Error("Превышен лимит запросов. Попробуйте позже.");
      }
      throw error;
    }
    
    throw new Error("Ошибка подключения к AI сервису");
  }
}

export async function getMovieRecommendations(
  preferences: {
    mood?: string;
    genre?: string;
    actors?: string[];
    directors?: string[];
    similar?: string;
    timeAvailable?: number;
  }
): Promise<string> {
  let prompt = "Порекомендуй фильмы";
  
  if (preferences.mood) {
    prompt += ` под настроение "${preferences.mood}"`;
  }
  if (preferences.genre) {
    prompt += ` в жанре "${preferences.genre}"`;
  }
  if (preferences.actors?.length) {
    prompt += ` с актёрами: ${preferences.actors.join(", ")}`;
  }
  if (preferences.directors?.length) {
    prompt += ` режиссёров: ${preferences.directors.join(", ")}`;
  }
  if (preferences.similar) {
    prompt += ` похожие на "${preferences.similar}"`;
  }
  if (preferences.timeAvailable) {
    prompt += `. Длительность до ${preferences.timeAvailable} минут`;
  }

  return chat([{ role: "user", content: prompt }]);
}

export async function streamChat(
  messages: Message[],
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const groq = getGroqClient();
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 1024,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error("Groq streaming error:", error);
    throw new Error("Ошибка AI сервиса");
  }
}

