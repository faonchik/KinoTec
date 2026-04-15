// Загружаем переменные окружения из .env файла
import dotenv from "dotenv";
import path from "path";

// Загружаем .env из корня проекта (на уровень выше папки bot)
// Пробуем несколько путей для совместимости
const rootEnvPath = path.resolve(process.cwd(), ".env");
const parentEnvPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: parentEnvPath });

// Логируем для отладки
if (process.env.GROQ_API_KEY) {
  console.log("✅ GROQ_API_KEY загружен из .env");
} else {
  console.warn("⚠️  GROQ_API_KEY не найден в переменных окружения");
  console.warn(`   Проверенные пути: ${rootEnvPath}, ${parentEnvPath}`);
}

import TelegramBot from "node-telegram-bot-api";
import Groq from "groq-sdk";
import { PrismaClient } from "@prisma/client";

// ============================================
// 🎬 КиноТека Бот - Полноценный помощник
// ============================================

// Конфигурация
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";
const ADMIN_ID = parseInt(process.env.TELEGRAM_ADMIN_ID || "809818162");
const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

// Инициализация
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const prisma = new PrismaClient();

// Ленивая инициализация Groq
let groqClient: Groq | null = null;
function getGroq(): Groq {
  if (!groqClient) {
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY не установлен");
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
  }
  return groqClient;
}

// Проверка админа
function isAdmin(chatId: number): boolean {
  return chatId === ADMIN_ID;
}

// Состояния диалога
const userStates: Map<number, { action: string; data: Record<string, unknown> }> = new Map();

// ============================================
// 📋 МЕНЮ
// ============================================

function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝 Контент", callback_data: "menu_content" }, { text: "🎬 Фильмы", callback_data: "menu_movies" }],
        [{ text: "📺 Сериалы", callback_data: "menu_series" }, { text: "👥 Пользователи", callback_data: "menu_users" }],
        [{ text: "⭐ Отзывы", callback_data: "menu_reviews" }, { text: "📊 Аналитика", callback_data: "menu_analytics" }],
        [{ text: "💬 AI Помощник", callback_data: "free_chat" }],
      ],
    },
  };
}

function getContentMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📰 Новость", callback_data: "create_news" }, { text: "🎤 Интервью", callback_data: "create_interview" }],
        [{ text: "📝 Обзор фильма", callback_data: "create_review_article" }, { text: "📄 Статья", callback_data: "create_article" }],
        [{ text: "📚 Подборка", callback_data: "create_collection" }, { text: "📋 Мои черновики", callback_data: "show_drafts" }],
        [{ text: "🔙 Назад", callback_data: "back_to_menu" }],
      ],
    },
  };
}

function getMoviesMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔍 Найти в TMDB", callback_data: "tmdb_search" }, { text: "🔥 Популярные", callback_data: "tmdb_popular" }],
        [{ text: "🆕 Новинки", callback_data: "tmdb_upcoming" }, { text: "🎯 Топ рейтинга", callback_data: "tmdb_top" }],
        [{ text: "📦 Массовый импорт", callback_data: "tmdb_mass_import" }],
        [{ text: "🔙 Назад", callback_data: "back_to_menu" }],
      ],
    },
  };
}

function getSeriesMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔍 Найти сериал", callback_data: "tmdb_series_search" }, { text: "🔥 Популярные", callback_data: "tmdb_series_popular" }],
        [{ text: "🆕 Новинки", callback_data: "tmdb_series_airing" }, { text: "🎯 Топ рейтинга", callback_data: "tmdb_series_top" }],
        [{ text: "📦 Массовый импорт", callback_data: "tmdb_series_mass" }],
        [{ text: "🔙 Назад", callback_data: "back_to_menu" }],
      ],
    },
  };
}

function getUsersMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👥 Все пользователи", callback_data: "users_list" }, { text: "🆕 Новые", callback_data: "users_new" }],
        [{ text: "🏆 Топ активных", callback_data: "users_top" }, { text: "🔍 Найти", callback_data: "users_search" }],
        [{ text: "🔙 Назад", callback_data: "back_to_menu" }],
      ],
    },
  };
}

function getReviewsMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⏳ На модерации", callback_data: "reviews_pending" }, { text: "✅ Одобренные", callback_data: "reviews_approved" }],
        [{ text: "📊 Статистика отзывов", callback_data: "reviews_stats" }],
        [{ text: "🔙 Назад", callback_data: "back_to_menu" }],
      ],
    },
  };
}

// ============================================
// 🚀 КОМАНДЫ
// ============================================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, "❌ У вас нет доступа к этому боту.\n\nЭто административный бот для управления сайтом КиноТека.");
    return;
  }

  const welcomeText = `
🎬 *Добро пожаловать в КиноТека Бот!*

Я твой помощник для управления сайтом. Вот что я умею:

📝 *Контент* — создавать новости, интервью, обзоры, статьи
🎬 *Фильмы* — импортировать из TMDB, управлять каталогом
👥 *Пользователи* — просматривать, модерировать
⭐ *Отзывы* — модерация и статистика
📊 *Аналитика* — статистика сайта
💬 *AI Помощник* — свободный диалог

Выбери раздел:
`.trim();

  bot.sendMessage(chatId, welcomeText, { parse_mode: "Markdown", ...getMainMenu() });
});

bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return;
  bot.sendMessage(chatId, "📋 *Главное меню:*", { parse_mode: "Markdown", ...getMainMenu() });
});

bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return;
  await sendDetailedStats(chatId);
});

// ============================================
// 📝 СОЗДАНИЕ КОНТЕНТА
// ============================================

// Маппинг категорий
const CATEGORY_MAP: Record<string, "NEWS" | "INTERVIEW" | "REVIEW" | "FEATURE"> = {
  news: "NEWS",
  interviews: "INTERVIEW",
  reviews: "REVIEW",
  articles: "FEATURE",
};

// ============================================
// 🖼 UNSPLASH - Поиск изображений
// ============================================

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashResponse {
  results: UnsplashPhoto[];
  total: number;
}

async function searchUnsplashImage(query: string): Promise<UnsplashPhoto | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log("⚠️ Unsplash API key not configured");
    return null;
  }

  try {
    // Переводим запрос на английский для лучших результатов
    const searchTerms: Record<string, string> = {
      "кино": "cinema movie theater",
      "фильм": "movie film",
      "актёр": "actor hollywood",
      "режиссёр": "film director",
      "премьера": "movie premiere red carpet",
      "награда": "award trophy oscar",
      "интервью": "interview celebrity",
      "звезда": "celebrity star hollywood",
      "сериал": "tv series streaming",
      "новинки": "new movies cinema",
    };

    // Ищем ключевые слова в запросе
    let englishQuery = query;
    for (const [ru, en] of Object.entries(searchTerms)) {
      if (query.toLowerCase().includes(ru)) {
        englishQuery = en;
        break;
      }
    }

    // Добавляем "cinema" для релевантности
    if (!englishQuery.includes("movie") && !englishQuery.includes("cinema")) {
      englishQuery += " cinema movie";
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(englishQuery)}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Unsplash API error:", response.status);
      return null;
    }

    const data = await response.json() as UnsplashResponse;
    
    if (data.results && data.results.length > 0) {
      // Возвращаем случайное изображение из первых 5
      const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5));
      return data.results[randomIndex];
    }

    return null;
  } catch (error) {
    console.error("Error searching Unsplash:", error);
    return null;
  }
}

async function generateArticle(chatId: number, category: string, topic: string) {
  const categoryNames: Record<string, string> = {
    news: "Новость",
    interviews: "Интервью",
    reviews: "Обзор фильма",
    articles: "Статья",
  };

  const categoryPrompts: Record<string, string> = {
    news: "Напиши актуальную новость о кино. Включи интересные факты и детали.",
    interviews: "Напиши интервью с известным актёром или режиссёром. Сделай вопросы интересными и глубокими.",
    reviews: "Напиши профессиональный обзор фильма с оценкой, плюсами и минусами.",
    articles: "Напиши аналитическую статью о кино. Добавь исторический контекст и экспертное мнение.",
  };

  const progressMsg = await bot.sendMessage(chatId, 
    `📝 *Создание: ${categoryNames[category]}*\n\n⏳ Подключаюсь к AI...`, 
    { parse_mode: "Markdown" }
  );

  try {
    await bot.editMessageText(
      `📝 *Создание: ${categoryNames[category]}*\n\n✅ AI подключен\n⏳ Генерирую текст...\n\n_Тема: ${topic}_`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Ты профессиональный редактор киносайта КиноТека. ${categoryPrompts[category]}
          
Формат ответа СТРОГО JSON:
{
  "title": "Заголовок",
  "slug": "url-slug-english",
  "excerpt": "Краткое описание (2-3 предложения)",
  "content": "Полный текст (5-7 абзацев, используй подзаголовки)",
  "tags": ["тег1", "тег2", "тег3"]
}`,
        },
        { role: "user", content: `Тема: ${topic}. Ответ только JSON.` },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    // Ищем изображение для обложки
    await bot.editMessageText(
      `📝 *Создание: ${categoryNames[category]}*\n\n✅ AI подключен\n✅ Текст сгенерирован\n⏳ Ищу обложку...`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    const content = completion.choices[0]?.message?.content || "{}";
    console.log("AI raw response:", content.substring(0, 200));
    
    // Извлекаем JSON из ответа
    let cleanContent = content;
    
    // Убираем markdown code blocks
    cleanContent = cleanContent.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
    
    // Ищем JSON объект в тексте
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }
    
    // Заменяем реальные переносы строк на \n внутри строковых значений
    // Это сложная операция, делаем проще - заменяем все переносы
    cleanContent = cleanContent
      .replace(/\r\n/g, "\\n")
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t");
    
    console.log("Cleaned JSON:", cleanContent.substring(0, 200));
    
    let articleData;
    try {
      articleData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("JSON parse error, trying to fix...");
      // Пробуем исправить распространённые ошибки
      cleanContent = cleanContent
        .replace(/,\s*}/g, "}") // убираем trailing commas
        .replace(/,\s*]/g, "]")
        .replace(/\\n/g, " ") // заменяем \n на пробелы
        .replace(/\s+/g, " "); // убираем лишние пробелы
      
      articleData = JSON.parse(cleanContent);
    }

    // Поиск изображения через Unsplash
    const unsplashPhoto = await searchUnsplashImage(topic);
    const coverUrl = unsplashPhoto?.urls?.regular || null;
    const photoCredit = unsplashPhoto ? `Photo by ${unsplashPhoto.user.name} on Unsplash` : null;

    await bot.editMessageText(
      `📝 *Создание: ${categoryNames[category]}*\n\n✅ AI подключен\n✅ Текст сгенерирован\n✅ Обложка ${coverUrl ? "найдена" : "не найдена"}\n⏳ Сохраняю...`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        slug: articleData.slug + "-" + Date.now(),
        excerpt: articleData.excerpt,
        content: photoCredit ? `${articleData.content}\n\n---\n_${photoCredit}_` : articleData.content,
        cover: coverUrl,
        category: CATEGORY_MAP[category] || "NEWS",
        published: false,
      },
    });

    await bot.editMessageText(
      `📝 *Создание: ${categoryNames[category]}*\n\n✅ AI подключен\n✅ Текст сгенерирован\n✅ Обложка ${coverUrl ? "добавлена" : "—"}\n✅ Сохранено\n\n🎉 *Готово!*`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    // Отправляем превью изображения если есть
    if (coverUrl) {
      await bot.sendPhoto(chatId, coverUrl, { caption: "🖼 Обложка статьи" });
    }

    // Отправляем результат
    const preview = articleData.content.length > 500 
      ? articleData.content.substring(0, 500) + "..." 
      : articleData.content;

    bot.sendMessage(chatId, `
📰 *${articleData.title}*

📂 Категория: ${categoryNames[category]}
🏷 Теги: ${articleData.tags?.join(", ") || "—"}
🖼 Обложка: ${coverUrl ? "✅" : "❌"}

📝 *Превью:*
${articleData.excerpt}

📄 *Начало текста:*
${preview}

━━━━━━━━━━━━━━━━━━━━
🔗 ID: \`${article.id}\`
📝 Статус: Черновик
`.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Опубликовать", callback_data: `publish_${article.id}` },
            { text: "🖼 Другое фото", callback_data: `change_cover_${article.id}` },
          ],
          [
            { text: "👁 Предпросмотр", callback_data: `preview_${article.id}` },
            { text: "❌ Удалить", callback_data: `delete_article_${article.id}` },
          ],
          [{ text: "📋 В меню", callback_data: "back_to_menu" }],
        ],
      },
    });
  } catch (error) {
    console.error("Error generating article:", error);
    bot.editMessageText(
      `📝 *Создание: ${categoryNames[category]}*\n\n❌ Ошибка\n\n_${error instanceof Error ? error.message : "Попробуйте позже"}_`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );
  }
}

// ============================================
// 🎬 РАБОТА С TMDB
// ============================================

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
}

interface TMDBResponse {
  results?: TMDBMovie[];
}

async function searchTMDB(query: string): Promise<TMDBMovie[]> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=ru-RU&query=${encodeURIComponent(query)}&page=1`
    );
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    const data = await response.json() as TMDBResponse;
    return data.results?.slice(0, 10) || [];
  } catch (error) {
    console.error("Error searching TMDB:", error);
    throw error;
  }
}

async function getTMDBPopular(): Promise<TMDBMovie[]> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ru-RU&page=1`
  );
  const data = await response.json() as TMDBResponse;
  return data.results?.slice(0, 10) || [];
}

async function getTMDBUpcoming(): Promise<TMDBMovie[]> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=ru-RU&page=1`
  );
  const data = await response.json() as TMDBResponse;
  return data.results?.slice(0, 10) || [];
}

async function getTMDBTopRated(): Promise<TMDBMovie[]> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=ru-RU&page=1`
  );
  const data = await response.json() as TMDBResponse;
  return data.results?.slice(0, 10) || [];
}

async function getTMDBMovieDetails(tmdbId: number): Promise<TMDBMovie> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=ru-RU`
    );
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json() as TMDBMovie;
  } catch (error) {
    console.error("Error getting TMDB movie details:", error);
    throw error;
  }
}

interface TMDBCredits {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    order: number;
    profile_path: string | null;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    profile_path: string | null;
  }>;
}

async function getTMDBMovieCredits(tmdbId: number): Promise<TMDBCredits> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}&language=ru-RU`
    );
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json() as TMDBCredits;
  } catch (error) {
    console.error("Error getting TMDB movie credits:", error);
    throw error;
  }
}

// ============================================
// 📺 TMDB СЕРИАЛЫ
// ============================================

interface TMDBSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  last_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  genres?: Array<{ id: number; name: string }>;
  episode_run_time?: number[];
  seasons?: Array<{
    id: number;
    season_number: number;
    name: string;
    overview: string;
    poster_path: string | null;
    air_date: string | null;
    episode_count: number;
  }>;
}

interface TMDBSeriesResponse {
  results?: TMDBSeries[];
}

async function searchTMDBSeries(query: string): Promise<TMDBSeries[]> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  const response = await fetch(
    `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&language=ru-RU&query=${encodeURIComponent(query)}&page=1`
  );
  const data = await response.json() as TMDBSeriesResponse;
  return data.results?.slice(0, 10) || [];
}

async function getTMDBSeriesPopular(): Promise<TMDBSeries[]> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=ru-RU&page=1`
  );
  const data = await response.json() as TMDBSeriesResponse;
  return data.results?.slice(0, 10) || [];
}

async function getTMDBSeriesAiring(): Promise<TMDBSeries[]> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/on_the_air?api_key=${TMDB_API_KEY}&language=ru-RU&page=1`
  );
  const data = await response.json() as TMDBSeriesResponse;
  return data.results?.slice(0, 10) || [];
}

async function getTMDBSeriesTopRated(): Promise<TMDBSeries[]> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_API_KEY}&language=ru-RU&page=1`
  );
  const data = await response.json() as TMDBSeriesResponse;
  return data.results?.slice(0, 10) || [];
}

async function getTMDBSeriesDetails(tmdbId: number): Promise<TMDBSeries> {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY не настроен");
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=ru-RU`
    );
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json() as TMDBSeries;
  } catch (error) {
    console.error("Error getting TMDB series details:", error);
    throw error;
  }
}

async function importSeriesFromTMDB(chatId: number, tmdbId: number) {
  const progressMsg = await bot.sendMessage(chatId, "📺 *Импорт сериала*\n\n⏳ Загружаю данные из TMDB...", { parse_mode: "Markdown" });

  try {
    const series = await getTMDBSeriesDetails(tmdbId);

    await bot.editMessageText(
      `📺 *Импорт сериала*\n\n✅ Данные загружены\n⏳ Сохраняю в базу...`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    // Маппинг статуса
    const statusMap: Record<string, string> = {
      "Returning Series": "RETURNING",
      "Ended": "ENDED",
      "Canceled": "CANCELED",
      "In Production": "IN_PRODUCTION",
    };

    // Создаём сериал
    const newSeries = await prisma.series.create({
      data: {
        title: series.name,
        originalTitle: series.original_name,
        description: series.overview,
        firstAirDate: series.first_air_date ? new Date(series.first_air_date) : null,
        lastAirDate: series.last_air_date ? new Date(series.last_air_date) : null,
        episodeRuntime: series.episode_run_time?.[0] || null,
        poster: series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : null,
        backdrop: series.backdrop_path ? `https://image.tmdb.org/t/p/original${series.backdrop_path}` : null,
        status: (statusMap[series.status || ""] || "RETURNING") as any,
        tmdbId: series.id,
      },
    });

    // Добавляем жанры
    if (series.genres && series.genres.length > 0) {
      for (const tmdbGenre of series.genres) {
        const genreInfo = TMDB_GENRE_MAP[tmdbGenre.id] || { name: tmdbGenre.name, slug: tmdbGenre.name.toLowerCase().replace(/\s+/g, "-") };
        
        try {
          let genre = await prisma.genre.findUnique({ where: { slug: genreInfo.slug } });
          
          if (!genre) {
            genre = await prisma.genre.create({
              data: { name: genreInfo.name, slug: genreInfo.slug },
            });
          }

          await prisma.seriesGenre.create({
            data: { seriesId: newSeries.id, genreId: genre.id },
          });
        } catch { /* ignore */ }
      }
    }

    // Добавляем сезоны
    if (series.seasons && series.seasons.length > 0) {
      await bot.editMessageText(
        `📺 *Импорт сериала*\n\n✅ Данные загружены\n✅ Сериал сохранён\n⏳ Загружаю сезоны (${series.seasons.length})...`,
        { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
      );

      for (const tmdbSeason of series.seasons) {
        if (tmdbSeason.season_number === 0) continue; // Пропускаем "specials"
        
        await prisma.season.create({
          data: {
            seriesId: newSeries.id,
            seasonNumber: tmdbSeason.season_number,
            name: tmdbSeason.name,
            overview: tmdbSeason.overview || null,
            poster: tmdbSeason.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbSeason.poster_path}` : null,
            airDate: tmdbSeason.air_date ? new Date(tmdbSeason.air_date) : null,
          },
        });
      }
    }

    await bot.editMessageText(
      `📺 *Импорт сериала*\n\n✅ Данные загружены\n✅ Сериал сохранён\n✅ Сезоны добавлены\n\n🎉 *Готово!*`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    const seriesUrl = `${SITE_URL}/series/${newSeries.id}`;
    const watchUrl = `${SITE_URL}/watch/series/${newSeries.id}`;

    bot.sendMessage(chatId, `
📺 *${series.name}*
${series.original_name !== series.name ? `_(${series.original_name})_` : ""}

📅 Первый эфир: ${series.first_air_date || "—"}
📺 Сезонов: ${series.number_of_seasons || "—"}
📝 Эпизодов: ${series.number_of_episodes || "—"}
⭐ Рейтинг TMDB: ${series.vote_average?.toFixed(1) || "—"}

📝 ${series.overview?.substring(0, 300) || "Без описания"}...

━━━━━━━━━━━━━━━━━━━━
🔗 ID: \`${newSeries.id}\`
🌐 Ссылка: ${seriesUrl}
`.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "▶️ Смотреть сериал", url: watchUrl }],
          [{ text: "📺 Страница сериала", url: seriesUrl }],
          [{ text: "📺 Импортировать ещё", callback_data: "menu_series" }, { text: "📋 В меню", callback_data: "back_to_menu" }],
        ],
      },
    });
  } catch (error) {
    console.error("Error importing series:", error);
    bot.editMessageText(
      `📺 *Импорт сериала*\n\n❌ Ошибка импорта\n\n_${error instanceof Error ? error.message : "Попробуйте позже"}_`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );
  }
}

async function showTMDBSeries(chatId: number, series: TMDBSeries[], title: string) {
  if (series.length === 0) {
    bot.sendMessage(chatId, "😔 Сериалы не найдены", {
      reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_series" }]] }
    });
    return;
  }

  const buttons = series.map((s) => ([
    { text: `📺 ${s.name} (${s.first_air_date?.substring(0, 4) || "?"})`, callback_data: `import_series_${s.id}` }
  ]));
  buttons.push([{ text: "🔙 Назад", callback_data: "menu_series" }]);

  bot.sendMessage(chatId, `📺 *${title}*\n\nВыберите сериал для импорта:`, {
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: buttons },
  });
}

// Массовый импорт сериалов
async function massImportSeries(chatId: number, count: number = 20) {
  const progressMsg = await bot.sendMessage(chatId, `📦 *Массовый импорт сериалов*\n\n⏳ Загружаю ${count} сериалов из TMDB...`, { parse_mode: "Markdown" });

  try {
    const pages = Math.ceil(count / 20);
    let imported = 0;
    let skipped = 0;

    for (let page = 1; page <= pages && imported < count; page++) {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=ru-RU&page=${page}`
      );
      const data = await response.json() as TMDBSeriesResponse;
      
      for (const series of data.results || []) {
        if (imported >= count) break;
        
        // Проверяем, есть ли уже
        const exists = await prisma.series.findFirst({
          where: { OR: [{ tmdbId: series.id }, { title: series.name }] },
        });

        if (exists) {
          skipped++;
          continue;
        }

        // Получаем детали
        const details = await getTMDBSeriesDetails(series.id);
        
        const statusMap: Record<string, string> = {
          "Returning Series": "RETURNING",
          "Ended": "ENDED",
          "Canceled": "CANCELED",
          "In Production": "IN_PRODUCTION",
        };

        const newSeries = await prisma.series.create({
          data: {
            title: details.name,
            originalTitle: details.original_name,
            description: details.overview,
            firstAirDate: details.first_air_date ? new Date(details.first_air_date) : null,
            lastAirDate: details.last_air_date ? new Date(details.last_air_date) : null,
            episodeRuntime: details.episode_run_time?.[0] || null,
            poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
            status: (statusMap[details.status || ""] || "RETURNING") as any,
            tmdbId: details.id,
          },
        });

        // Добавляем жанры
        if (details.genres) {
          for (const g of details.genres) {
            const genreInfo = TMDB_GENRE_MAP[g.id] || { name: g.name, slug: g.name.toLowerCase().replace(/\s+/g, "-") };
            try {
              let genre = await prisma.genre.findUnique({ where: { slug: genreInfo.slug } });
              if (!genre) {
                genre = await prisma.genre.create({ data: { name: genreInfo.name, slug: genreInfo.slug } });
              }
              await prisma.seriesGenre.create({ data: { seriesId: newSeries.id, genreId: genre.id } });
            } catch { /* ignore */ }
          }
        }

        // Добавляем сезоны
        if (details.seasons) {
          for (const s of details.seasons) {
            if (s.season_number === 0) continue;
            try {
              await prisma.season.create({
                data: {
                  seriesId: newSeries.id,
                  seasonNumber: s.season_number,
                  name: s.name,
                  overview: s.overview || null,
                  poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
                  airDate: s.air_date ? new Date(s.air_date) : null,
                },
              });
            } catch { /* ignore */ }
          }
        }

        imported++;

        if (imported % 5 === 0) {
          await bot.editMessageText(
            `📦 *Массовый импорт сериалов*\n\n⏳ Импортировано: ${imported}/${count}\n⏭ Пропущено: ${skipped}`,
            { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
          );
        }
      }
    }

    await bot.editMessageText(
      `📦 *Массовый импорт сериалов завершён!*\n\n✅ Импортировано: ${imported}\n⏭ Пропущено (дубли): ${skipped}`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error("Mass series import error:", error);
    bot.editMessageText(
      `📦 *Массовый импорт сериалов*\n\n❌ Ошибка\n\n_${error instanceof Error ? error.message : "Попробуйте позже"}_`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );
  }
}

// Массовый импорт фильмов
async function massImportMovies(chatId: number, count: number = 50) {
  const progressMsg = await bot.sendMessage(chatId, `📦 *Массовый импорт*\n\n⏳ Загружаю ${count} фильмов из TMDB...`, { parse_mode: "Markdown" });

  try {
    const pages = Math.ceil(count / 20);
    let imported = 0;
    let skipped = 0;

    for (let page = 1; page <= pages && imported < count; page++) {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ru-RU&page=${page}`
      );
      const data = await response.json() as TMDBResponse;
      
      for (const movie of data.results || []) {
        if (imported >= count) break;
        
        // Проверяем, есть ли уже
        const exists = await prisma.movie.findFirst({
          where: { title: movie.title },
        });

        if (exists) {
          skipped++;
          continue;
        }

        // Получаем детали
        const details = await getTMDBMovieDetails(movie.id);
        
        const newMovie = await prisma.movie.create({
          data: {
            title: details.title,
            originalTitle: details.original_title,
            description: details.overview,
            releaseDate: details.release_date ? new Date(details.release_date) : null,
            runtime: details.runtime || null,
            poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
          },
        });

        // Добавляем жанры
        if (details.genres) {
          for (const g of details.genres) {
            const genreInfo = TMDB_GENRE_MAP[g.id] || { name: g.name, slug: g.name.toLowerCase().replace(/\s+/g, "-") };
            try {
              let genre = await prisma.genre.findUnique({ where: { slug: genreInfo.slug } });
              if (!genre) {
                genre = await prisma.genre.create({ data: { name: genreInfo.name, slug: genreInfo.slug } });
              }
              await prisma.movieGenre.create({ data: { movieId: newMovie.id, genreId: genre.id } });
            } catch { /* ignore */ }
          }
        }

        // Добавляем актёров (без деталей для ускорения массового импорта)
        try {
          const credits = await getTMDBMovieCredits(movie.id);
          const actors = credits?.cast || [];
          
          for (const tmdbActor of actors) {
            try {
              let actor = await prisma.actor.findFirst({ where: { name: tmdbActor.name } });
              
              if (!actor) {
                actor = await prisma.actor.create({
                  data: {
                    name: tmdbActor.name,
                    photo: tmdbActor.profile_path ? `https://image.tmdb.org/t/p/w500${tmdbActor.profile_path}` : null,
                  },
                });
              }

              await prisma.movieActor.create({
                data: {
                  movieId: newMovie.id,
                  actorId: actor.id,
                  character: tmdbActor.character || "",
                  order: tmdbActor.order || 0,
                },
              });
            } catch { /* ignore */ }
          }
        } catch { /* ignore */ }

        imported++;

        if (imported % 10 === 0) {
          await bot.editMessageText(
            `📦 *Массовый импорт*\n\n⏳ Импортировано: ${imported}/${count}\n⏭ Пропущено: ${skipped}`,
            { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
          );
        }
      }
    }

    await bot.editMessageText(
      `📦 *Массовый импорт завершён!*\n\n✅ Импортировано: ${imported}\n⏭ Пропущено (дубли): ${skipped}`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error("Mass import error:", error);
    bot.editMessageText(
      `📦 *Массовый импорт*\n\n❌ Ошибка\n\n_${error instanceof Error ? error.message : "Попробуйте позже"}_`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );
  }
}

// Маппинг жанров TMDB на русский
const TMDB_GENRE_MAP: Record<number, { name: string; slug: string }> = {
  28: { name: "Боевик", slug: "action" },
  12: { name: "Приключения", slug: "adventure" },
  16: { name: "Мультфильм", slug: "animation" },
  35: { name: "Комедия", slug: "comedy" },
  80: { name: "Криминал", slug: "crime" },
  99: { name: "Документальный", slug: "documentary" },
  18: { name: "Драма", slug: "drama" },
  10751: { name: "Семейный", slug: "family" },
  14: { name: "Фэнтези", slug: "fantasy" },
  36: { name: "История", slug: "history" },
  27: { name: "Ужасы", slug: "horror" },
  10402: { name: "Музыка", slug: "music" },
  9648: { name: "Детектив", slug: "mystery" },
  10749: { name: "Мелодрама", slug: "romance" },
  878: { name: "Фантастика", slug: "sci-fi" },
  10770: { name: "ТВ фильм", slug: "tv-movie" },
  53: { name: "Триллер", slug: "thriller" },
  10752: { name: "Военный", slug: "war" },
  37: { name: "Вестерн", slug: "western" },
};

async function importMovieFromTMDB(chatId: number, tmdbId: number) {
  const progressMsg = await bot.sendMessage(chatId, "🎬 *Импорт фильма*\n\n⏳ Загружаю данные из TMDB...", { parse_mode: "Markdown" });

  try {
    const movie = await getTMDBMovieDetails(tmdbId);

    await bot.editMessageText(
      `🎬 *Импорт фильма*\n\n✅ Данные загружены\n⏳ Сохраняю в базу...`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    // Создаём фильм
    const newMovie = await prisma.movie.create({
      data: {
        title: movie.title,
        originalTitle: movie.original_title,
        description: movie.overview,
        releaseDate: movie.release_date ? new Date(movie.release_date) : null,
        runtime: movie.runtime || null,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
      },
    });

    // Добавляем жанры
    const addedGenres: string[] = [];
    if (movie.genres && movie.genres.length > 0) {
      await bot.editMessageText(
        `🎬 *Импорт фильма*\n\n✅ Данные загружены\n✅ Фильм сохранён\n⏳ Добавляю жанры...`,
        { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
      );

      for (const tmdbGenre of movie.genres) {
        const genreInfo = TMDB_GENRE_MAP[tmdbGenre.id] || { name: tmdbGenre.name, slug: tmdbGenre.name.toLowerCase().replace(/\s+/g, "-") };
        
        try {
          // Создаём или находим жанр
          let genre = await prisma.genre.findUnique({ where: { slug: genreInfo.slug } });
          
          if (!genre) {
            genre = await prisma.genre.create({
              data: { name: genreInfo.name, slug: genreInfo.slug },
            });
          }

          // Связываем фильм с жанром
          await prisma.movieGenre.create({
            data: { movieId: newMovie.id, genreId: genre.id },
          });
          
          addedGenres.push(genreInfo.name);
        } catch {
          // Жанр уже существует или другая ошибка - пропускаем
        }
      }
    }

    // Добавляем актёров
    let addedActors = 0;
    try {
      await bot.editMessageText(
        `🎬 *Импорт фильма*\n\n✅ Данные загружены\n✅ Фильм сохранён\n✅ Жанры добавлены (${addedGenres.length})\n⏳ Добавляю актёров...`,
        { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
      );

      const credits = await getTMDBMovieCredits(tmdbId);
      const actors = credits?.cast || [];

      for (const tmdbActor of actors) {
        try {
          // Проверяем, есть ли актёр в базе
          let actor = await prisma.actor.findFirst({
            where: { name: tmdbActor.name },
          });

          if (!actor) {
            // Получаем детали актёра
            const personResponse = await fetch(
              `https://api.themoviedb.org/3/person/${tmdbActor.id}?api_key=${TMDB_API_KEY}&language=ru-RU`
            );
            const personDetails = await personResponse.json();

            actor = await prisma.actor.create({
              data: {
                name: tmdbActor.name,
                bio: personDetails.biography || null,
                photo: tmdbActor.profile_path ? `https://image.tmdb.org/t/p/w500${tmdbActor.profile_path}` : null,
                birthDate: personDetails.birthday ? new Date(personDetails.birthday) : null,
                birthPlace: personDetails.place_of_birth || null,
                deathDate: personDetails.deathday ? new Date(personDetails.deathday) : null,
              },
            });
          }

          // Связываем актёра с фильмом
          await prisma.movieActor.create({
            data: {
              movieId: newMovie.id,
              actorId: actor.id,
              character: tmdbActor.character || "",
              order: tmdbActor.order || 0,
            },
          });

          addedActors++;
        } catch (error) {
          console.error(`Error adding actor ${tmdbActor.name}:`, error);
          // Продолжаем с другими актёрами
        }
      }
    } catch (error) {
      console.error("Error importing actors:", error);
      // Продолжаем даже если не удалось импортировать актёров
    }

    await bot.editMessageText(
      `🎬 *Импорт фильма*\n\n✅ Данные загружены\n✅ Фильм сохранён\n✅ Жанры добавлены (${addedGenres.length})\n✅ Актёры добавлены (${addedActors})\n\n🎉 *Готово!*`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    const genresText = addedGenres.length > 0 ? addedGenres.join(", ") : "—";

    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
    const watchUrl = `${SITE_URL}/watch/${newMovie.id}`;
    const movieUrl = `${SITE_URL}/movies/${newMovie.id}`;

    bot.sendMessage(chatId, `
🎬 *${movie.title}*
${movie.original_title !== movie.title ? `_(${movie.original_title})_` : ""}

📅 Дата выхода: ${movie.release_date || "—"}
⏱ Длительность: ${movie.runtime ? movie.runtime + " мин" : "—"}
⭐ Рейтинг TMDB: ${movie.vote_average?.toFixed(1) || "—"}
🏷 Жанры: ${genresText}

📝 ${movie.overview?.substring(0, 300) || "Без описания"}...

━━━━━━━━━━━━━━━━━━━━
🔗 ID: \`${newMovie.id}\`
🌐 Ссылка: ${movieUrl}
`.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "▶️ Смотреть фильм", url: watchUrl }],
          [{ text: "📄 Страница фильма", url: movieUrl }],
          [{ text: "🎬 Импортировать ещё", callback_data: "menu_movies" }, { text: "📋 В меню", callback_data: "back_to_menu" }],
        ],
      },
    });
  } catch (error) {
    console.error("Error importing movie:", error);
    bot.editMessageText(
      `🎬 *Импорт фильма*\n\n❌ Ошибка импорта\n\n_${error instanceof Error ? error.message : "Попробуйте позже"}_`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );
  }
}

async function showTMDBMovies(chatId: number, movies: TMDBMovie[], title: string) {
  if (movies.length === 0) {
    bot.sendMessage(chatId, "😔 Фильмы не найдены", {
      reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_movies" }]] }
    });
    return;
  }

  const buttons = movies.map((m) => ([
    { text: `🎬 ${m.title} (${m.release_date?.substring(0, 4) || "?"})`, callback_data: `import_${m.id}` }
  ]));
  buttons.push([{ text: "🔙 Назад", callback_data: "menu_movies" }]);

  bot.sendMessage(chatId, `🎬 *${title}*\n\nВыберите фильм для импорта:`, {
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: buttons },
  });
}

// ============================================
// 👥 ПОЛЬЗОВАТЕЛИ
// ============================================

async function showUsers(chatId: number, filter: "all" | "new" | "top") {
  let users;
  let title;

  switch (filter) {
    case "new":
      users = await prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { reviews: true, ratings: true } } },
      });
      title = "🆕 Новые пользователи";
      break;
    case "top":
      users = await prisma.user.findMany({
        take: 10,
        include: { _count: { select: { reviews: true, ratings: true } } },
        orderBy: { reviews: { _count: "desc" } },
      });
      title = "🏆 Топ активных";
      break;
    default:
      users = await prisma.user.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { reviews: true, ratings: true } } },
      });
      title = "👥 Все пользователи";
  }

  if (users.length === 0) {
    bot.sendMessage(chatId, "😔 Пользователи не найдены", {
      reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_users" }]] }
    });
    return;
  }

  const userList = users.map((u, i) => 
    `${i + 1}. *${u.name || u.email}*\n   📧 ${u.email}\n   ⭐ ${u._count.reviews} отзывов, ${u._count.ratings} оценок`
  ).join("\n\n");

  bot.sendMessage(chatId, `${title}\n\n${userList}`, {
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_users" }]] },
  });
}

// ============================================
// ⭐ МОДЕРАЦИЯ ОТЗЫВОВ
// ============================================

async function showPendingReviews(chatId: number) {
  const reviews = await prisma.review.findMany({
    where: { isApproved: false },
    take: 5,
    include: { user: true, movie: true },
    orderBy: { createdAt: "desc" },
  });

  if (reviews.length === 0) {
    bot.sendMessage(chatId, "✅ Нет отзывов на модерации!", {
      reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_reviews" }]] }
    });
    return;
  }

  for (const review of reviews) {
    const text = `
⏳ *Отзыв на модерации*

🎬 Фильм: ${review.movie.title}
👤 Автор: ${review.user.name || review.user.email}
📅 Дата: ${review.createdAt.toLocaleDateString("ru")}

💬 _${review.content.substring(0, 300)}${review.content.length > 300 ? "..." : ""}_
`.trim();

    bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Одобрить", callback_data: `approve_review_${review.id}` },
            { text: "❌ Отклонить", callback_data: `reject_review_${review.id}` },
          ],
        ],
      },
    });
  }

  bot.sendMessage(chatId, `📊 Всего на модерации: ${reviews.length} отзывов`, {
    reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_reviews" }]] }
  });
}

// ============================================
// 📊 АНАЛИТИКА
// ============================================

async function sendDetailedStats(chatId: number) {
  const progressMsg = await bot.sendMessage(chatId, "📊 *Аналитика*\n\n⏳ Собираю данные...", { parse_mode: "Markdown" });

  try {
    const [
      moviesCount,
      usersCount,
      reviewsCount,
      articlesCount,
      collectionsCount,
      ratingsCount,
      pendingReviews,
      todayUsers,
      publishedArticles,
      draftArticles,
    ] = await Promise.all([
      prisma.movie.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.article.count(),
      prisma.collection.count(),
      prisma.rating.count(),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.article.count({ where: { published: true } }),
      prisma.article.count({ where: { published: false } }),
    ]);

    // Топ фильмов по рейтингу
    const topMovies = await prisma.movie.findMany({
      take: 5,
      orderBy: { ratings: { _count: "desc" } },
      include: { _count: { select: { ratings: true } } },
    });

    const topMoviesList = topMovies.map((m, i) => 
      `${i + 1}. ${m.title} (${m._count.ratings} оценок)`
    ).join("\n");

    const statsText = `
📊 *Аналитика КиноТека*

━━━ *Контент* ━━━
🎬 Фильмов: ${moviesCount}
📚 Подборок: ${collectionsCount}
📰 Статей: ${publishedArticles} опубликовано / ${draftArticles} черновиков

━━━ *Пользователи* ━━━
👥 Всего: ${usersCount}
🆕 За сутки: ${todayUsers}
⭐ Отзывов: ${reviewsCount}
🎯 Оценок: ${ratingsCount}

━━━ *Модерация* ━━━
⏳ На проверке: ${pendingReviews} отзывов

━━━ *Топ фильмов* ━━━
${topMoviesList || "—"}

🔗 Сайт: ${SITE_URL}
`.trim();

    await bot.editMessageText(statsText, {
      chat_id: chatId,
      message_id: progressMsg.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔄 Обновить", callback_data: "menu_analytics" }],
          [{ text: "📋 В меню", callback_data: "back_to_menu" }],
        ],
      },
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    bot.editMessageText("❌ Ошибка при получении статистики", {
      chat_id: chatId,
      message_id: progressMsg.message_id,
    });
  }
}

// ============================================
// 📚 ПОДБОРКИ
// ============================================

async function generateCollection(chatId: number, theme: string) {
  const progressMsg = await bot.sendMessage(chatId, "📚 *Создание подборки*\n\n⏳ Загружаю фильмы...", { parse_mode: "Markdown" });

  try {
    const movies = await prisma.movie.findMany({
      take: 50,
      select: { id: true, title: true, genres: { select: { genre: { select: { name: true } } } } },
    });

    if (movies.length === 0) {
      bot.editMessageText("❌ В базе нет фильмов для подборки. Сначала импортируйте фильмы из TMDB.", {
        chat_id: chatId,
        message_id: progressMsg.message_id,
      });
      return;
    }

    await bot.editMessageText(
      `📚 *Создание подборки*\n\n✅ Загружено ${movies.length} фильмов\n⏳ AI подбирает...`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    const moviesForAI = movies.map(m => ({
      id: m.id,
      title: m.title,
      genres: m.genres.map(g => g.genre.name)
    }));

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Создай подборку фильмов. Фильмы в базе: ${JSON.stringify(moviesForAI)}
          
Формат JSON: {"title": "Название", "slug": "slug", "description": "Описание", "movieIds": ["id1", "id2"]}`,
        },
        { role: "user", content: `Тема: ${theme}. Выбери 5-10 фильмов. Только JSON.` },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const collectionData = JSON.parse(cleanContent);

    const collection = await prisma.collection.create({
      data: {
        title: collectionData.title,
        slug: collectionData.slug + "-" + Date.now(),
        description: collectionData.description,
      },
    });

    const addedMovies: string[] = [];
    for (let i = 0; i < (collectionData.movieIds?.length || 0); i++) {
      try {
        await prisma.collectionMovie.create({
          data: { collectionId: collection.id, movieId: collectionData.movieIds[i], order: i },
        });
        const movie = movies.find(m => m.id === collectionData.movieIds[i]);
        if (movie) addedMovies.push(movie.title);
      } catch { /* ignore */ }
    }

    await bot.editMessageText(
      `📚 *Создание подборки*\n\n✅ Загружено ${movies.length} фильмов\n✅ AI подобрал фильмы\n✅ Сохранено\n\n🎉 *Готово!*`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: "Markdown" }
    );

    const moviesList = addedMovies.map((t, i) => `${i + 1}. ${t}`).join("\n");

    bot.sendMessage(chatId, `
📚 *${collection.title}*

📝 ${collection.description || "—"}

🎬 *Фильмы (${addedMovies.length}):*
${moviesList || "_Не удалось добавить фильмы_"}

🔗 ${SITE_URL}/collections/${collection.slug}
`.trim(), {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[{ text: "📋 В меню", callback_data: "back_to_menu" }]] },
    });
  } catch (error) {
    console.error("Error generating collection:", error);
    bot.editMessageText(`❌ Ошибка: ${error instanceof Error ? error.message : "Попробуйте позже"}`, {
      chat_id: chatId,
      message_id: progressMsg.message_id,
    });
  }
}

// ============================================
// 🔄 ОБРАБОТКА CALLBACK
// ============================================

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message?.chat.id;
    if (!chatId || !isAdmin(chatId)) {
      bot.answerCallbackQuery(query.id, { text: "❌ У вас нет доступа" });
      return;
    }

    const action = query.data || "";
    bot.answerCallbackQuery(query.id);

  // Меню навигация
  if (action === "back_to_menu") {
    userStates.delete(chatId);
    bot.sendMessage(chatId, "📋 *Главное меню:*", { parse_mode: "Markdown", ...getMainMenu() });
    return;
  }

  if (action === "menu_content") {
    bot.sendMessage(chatId, "📝 *Создание контента*\n\nВыберите тип:", { parse_mode: "Markdown", ...getContentMenu() });
    return;
  }

  if (action === "menu_movies") {
    bot.sendMessage(chatId, "🎬 *Управление фильмами*\n\nВыберите действие:", { parse_mode: "Markdown", ...getMoviesMenu() });
    return;
  }

  if (action === "menu_series") {
    bot.sendMessage(chatId, "📺 *Управление сериалами*\n\nВыберите действие:", { parse_mode: "Markdown", ...getSeriesMenu() });
    return;
  }

  if (action === "menu_users") {
    bot.sendMessage(chatId, "👥 *Пользователи*\n\nВыберите раздел:", { parse_mode: "Markdown", ...getUsersMenu() });
    return;
  }

  if (action === "menu_reviews") {
    bot.sendMessage(chatId, "⭐ *Модерация отзывов*", { parse_mode: "Markdown", ...getReviewsMenu() });
    return;
  }

  if (action === "menu_analytics") {
    await sendDetailedStats(chatId);
    return;
  }

  // Создание контента
  if (action === "create_news") {
    userStates.set(chatId, { action: "awaiting_topic", data: { category: "news" } });
    bot.sendMessage(chatId, "📰 *Создание новости*\n\nВведите тему или выберите:", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎬 Новинки кино", callback_data: "topic_news_releases" }],
          [{ text: "🏆 Кинопремии", callback_data: "topic_news_awards" }],
          [{ text: "⭐ Новости о звёздах", callback_data: "topic_news_celebs" }],
          [{ text: "🔙 Назад", callback_data: "menu_content" }],
        ],
      },
    });
    return;
  }

  if (action === "create_interview") {
    userStates.set(chatId, { action: "awaiting_topic", data: { category: "interviews" } });
    bot.sendMessage(chatId, "🎤 *Создание интервью*\n\nВведите имя актёра/режиссёра или выберите:", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎭 Популярный актёр", callback_data: "topic_interview_actor" }],
          [{ text: "🎬 Известный режиссёр", callback_data: "topic_interview_director" }],
          [{ text: "🔙 Назад", callback_data: "menu_content" }],
        ],
      },
    });
    return;
  }

  if (action === "create_review_article") {
    userStates.set(chatId, { action: "awaiting_topic", data: { category: "reviews" } });
    bot.sendMessage(chatId, "📝 *Создание обзора*\n\nВведите название фильма:", { parse_mode: "Markdown" });
    return;
  }

  if (action === "create_article") {
    userStates.set(chatId, { action: "awaiting_topic", data: { category: "articles" } });
    bot.sendMessage(chatId, "📄 *Создание статьи*\n\nВведите тему или выберите:", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📊 Тренды кино", callback_data: "topic_article_trends" }],
          [{ text: "🎞 История кинематографа", callback_data: "topic_article_history" }],
          [{ text: "🔙 Назад", callback_data: "menu_content" }],
        ],
      },
    });
    return;
  }

  if (action === "create_collection") {
    userStates.set(chatId, { action: "awaiting_collection_theme", data: {} });
    bot.sendMessage(chatId, "📚 *Создание подборки*\n\nВведите тему или выберите:", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎄 Праздничные", callback_data: "collection_holidays" }],
          [{ text: "😱 Триллеры", callback_data: "collection_thrillers" }],
          [{ text: "💑 Романтика", callback_data: "collection_romance" }],
          [{ text: "🚀 Фантастика", callback_data: "collection_scifi" }],
          [{ text: "🔙 Назад", callback_data: "menu_content" }],
        ],
      },
    });
    return;
  }

  // Быстрые темы для контента
  if (action.startsWith("topic_")) {
    const state = userStates.get(chatId);
    const topics: Record<string, string> = {
      "topic_news_releases": "Новинки и премьеры кино этого месяца",
      "topic_news_awards": "Последние новости о кинопремиях и наградах",
      "topic_news_celebs": "Интересные новости о голливудских звёздах",
      "topic_interview_actor": "Интервью с популярным актёром о его последней роли",
      "topic_interview_director": "Беседа с известным режиссёром о секретах мастерства",
      "topic_article_trends": "Главные тренды в современном кинематографе",
      "topic_article_history": "Золотая эпоха Голливуда: как всё начиналось",
    };
    if (state?.data?.category && topics[action]) {
      userStates.delete(chatId);
      await generateArticle(chatId, state.data.category as string, topics[action]);
    }
    return;
  }

  // Быстрые темы для подборок
  if (action.startsWith("collection_")) {
    const themes: Record<string, string> = {
      "collection_holidays": "Фильмы для праздничного настроения",
      "collection_thrillers": "Лучшие триллеры",
      "collection_romance": "Романтические фильмы для вечера",
      "collection_scifi": "Научная фантастика",
    };
    userStates.delete(chatId);
    await generateCollection(chatId, themes[action] || "Лучшие фильмы");
    return;
  }

  // TMDB
  if (action === "tmdb_search") {
    userStates.set(chatId, { action: "awaiting_tmdb_search", data: {} });
    bot.sendMessage(chatId, "🔍 Введите название фильма для поиска:");
    return;
  }

  if (action === "tmdb_popular") {
    bot.sendMessage(chatId, "⏳ Загружаю популярные фильмы...");
    const movies = await getTMDBPopular();
    await showTMDBMovies(chatId, movies, "🔥 Популярные фильмы");
    return;
  }

  if (action === "tmdb_upcoming") {
    bot.sendMessage(chatId, "⏳ Загружаю новинки...");
    const movies = await getTMDBUpcoming();
    await showTMDBMovies(chatId, movies, "🆕 Скоро в кино");
    return;
  }

  if (action === "tmdb_top") {
    bot.sendMessage(chatId, "⏳ Загружаю топ рейтинга...");
    const movies = await getTMDBTopRated();
    await showTMDBMovies(chatId, movies, "🎯 Топ по рейтингу");
    return;
  }

  if (action.startsWith("import_series_")) {
    const tmdbId = parseInt(action.replace("import_series_", ""));
    await importSeriesFromTMDB(chatId, tmdbId);
    return;
  }

  if (action.startsWith("import_")) {
    const tmdbId = parseInt(action.replace("import_", ""));
    await importMovieFromTMDB(chatId, tmdbId);
    return;
  }

  // Сериалы TMDB
  if (action === "tmdb_series_search") {
    userStates.set(chatId, { action: "awaiting_series_search", data: {} });
    bot.sendMessage(chatId, "🔍 Введите название сериала для поиска:");
    return;
  }

  if (action === "tmdb_series_popular") {
    bot.sendMessage(chatId, "⏳ Загружаю популярные сериалы...");
    const series = await getTMDBSeriesPopular();
    await showTMDBSeries(chatId, series, "🔥 Популярные сериалы");
    return;
  }

  if (action === "tmdb_series_airing") {
    bot.sendMessage(chatId, "⏳ Загружаю сериалы в эфире...");
    const series = await getTMDBSeriesAiring();
    await showTMDBSeries(chatId, series, "🆕 Сейчас в эфире");
    return;
  }

  if (action === "tmdb_series_top") {
    bot.sendMessage(chatId, "⏳ Загружаю топ сериалов...");
    const series = await getTMDBSeriesTopRated();
    await showTMDBSeries(chatId, series, "🎯 Топ по рейтингу");
    return;
  }

  if (action === "tmdb_series_mass") {
    bot.sendMessage(chatId, "📦 *Массовый импорт сериалов*\n\nСколько сериалов импортировать?", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "20 сериалов", callback_data: "mass_series_20" }, { text: "50 сериалов", callback_data: "mass_series_50" }],
          [{ text: "🔙 Назад", callback_data: "menu_series" }],
        ],
      },
    });
    return;
  }

  if (action.startsWith("mass_series_")) {
    const count = parseInt(action.replace("mass_series_", ""));
    await massImportSeries(chatId, count);
    return;
  }

  // Массовый импорт фильмов
  if (action === "tmdb_mass_import") {
    bot.sendMessage(chatId, "📦 *Массовый импорт фильмов*\n\nСколько фильмов импортировать?", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "20 фильмов", callback_data: "mass_movies_20" }, { text: "50 фильмов", callback_data: "mass_movies_50" }],
          [{ text: "100 фильмов", callback_data: "mass_movies_100" }],
          [{ text: "🔙 Назад", callback_data: "menu_movies" }],
        ],
      },
    });
    return;
  }

  if (action.startsWith("mass_movies_")) {
    const count = parseInt(action.replace("mass_movies_", ""));
    await massImportMovies(chatId, count);
    return;
  }

  // Пользователи
  if (action === "users_list") { await showUsers(chatId, "all"); return; }
  if (action === "users_new") { await showUsers(chatId, "new"); return; }
  if (action === "users_top") { await showUsers(chatId, "top"); return; }

  // Отзывы
  if (action === "reviews_pending") { await showPendingReviews(chatId); return; }

  if (action === "reviews_approved") {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      take: 10,
      include: { user: true, movie: true },
      orderBy: { createdAt: "desc" },
    });

    if (reviews.length === 0) {
      bot.sendMessage(chatId, "✅ Нет одобренных отзывов", {
        reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_reviews" }]] }
      });
      return;
    }

    const reviewsList = reviews.map((r, i) => 
      `${i + 1}. *${r.movie.title}*\n   👤 ${r.user.name || r.user.email}\n   💬 ${r.content.substring(0, 100)}...`
    ).join("\n\n");

    bot.sendMessage(chatId, `✅ *Одобренные отзывы*\n\n${reviewsList}`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_reviews" }]] }
    });
    return;
  }

  if (action === "reviews_stats") {
    const [total, approved, pending] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: true } }),
      prisma.review.count({ where: { isApproved: false } }),
    ]);

    bot.sendMessage(chatId, `📊 *Статистика отзывов*\n\n📝 Всего: ${total}\n✅ Одобрено: ${approved}\n⏳ На модерации: ${pending}`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_reviews" }]] }
    });
    return;
  }

  if (action.startsWith("approve_review_")) {
    const reviewId = action.replace("approve_review_", "");
    await prisma.review.update({ where: { id: reviewId }, data: { isApproved: true } });
    bot.sendMessage(chatId, "✅ Отзыв одобрен!");
    await showPendingReviews(chatId);
    return;
  }

  if (action.startsWith("reject_review_")) {
    const reviewId = action.replace("reject_review_", "");
    await prisma.review.delete({ where: { id: reviewId } });
    bot.sendMessage(chatId, "❌ Отзыв удалён");
    await showPendingReviews(chatId);
    return;
  }

  // Публикация/удаление статей
  if (action.startsWith("publish_")) {
    const articleId = action.replace("publish_", "");
    await prisma.article.update({ where: { id: articleId }, data: { published: true } });
    bot.sendMessage(chatId, "✅ Статья опубликована!\n\n🔗 " + SITE_URL + "/blog");
    return;
  }

  if (action.startsWith("delete_article_")) {
    const articleId = action.replace("delete_article_", "");
    await prisma.article.delete({ where: { id: articleId } });
    bot.sendMessage(chatId, "🗑️ Статья удалена");
    return;
  }

  // Черновики статей
  if (action === "show_drafts") {
    const drafts = await prisma.article.findMany({
      where: { published: false },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    if (drafts.length === 0) {
      bot.sendMessage(chatId, "📝 Нет черновиков", {
        reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_content" }]] }
      });
      return;
    }

    const draftsList = drafts.map((a, i) => 
      `${i + 1}. *${a.title}*\n   📂 ${a.category}\n   📅 ${a.createdAt.toLocaleDateString("ru")}`
    ).join("\n\n");

    bot.sendMessage(chatId, `📋 *Мои черновики*\n\n${draftsList}`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[{ text: "🔙 Назад", callback_data: "menu_content" }]] }
    });
    return;
  }

  // Предпросмотр статьи
  if (action.startsWith("preview_")) {
    const articleId = action.replace("preview_", "");
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    
    if (!article) {
      bot.sendMessage(chatId, "❌ Статья не найдена");
      return;
    }

    const preview = article.content.length > 1000 
      ? article.content.substring(0, 1000) + "..." 
      : article.content;

    bot.sendMessage(chatId, `👁 *Предпросмотр: ${article.title}*\n\n${preview}\n\n🔗 ${SITE_URL}/blog/${article.slug}`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Опубликовать", callback_data: `publish_${articleId}` }],
          [{ text: "🖼 Другое фото", callback_data: `change_cover_${articleId}` }],
          [{ text: "🔙 Назад", callback_data: "back_to_menu" }],
        ],
      },
    });
    return;
  }

  // Смена обложки
  if (action.startsWith("change_cover_")) {
    const articleId = action.replace("change_cover_", "");
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    
    if (!article) {
      bot.sendMessage(chatId, "❌ Статья не найдена");
      return;
    }

    bot.sendMessage(chatId, "🖼 Ищу новое изображение...");
    
    const newPhoto = await searchUnsplashImage(article.title);
    if (newPhoto) {
      await prisma.article.update({
        where: { id: articleId },
        data: { cover: newPhoto.urls.regular },
      });
      await bot.sendPhoto(chatId, newPhoto.urls.regular, { 
        caption: `✅ Новая обложка установлена!\n\n📷 ${newPhoto.user.name} / Unsplash`,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔄 Ещё вариант", callback_data: `change_cover_${articleId}` }],
            [{ text: "✅ Опубликовать", callback_data: `publish_${articleId}` }],
            [{ text: "📋 В меню", callback_data: "back_to_menu" }],
          ],
        },
      });
    } else {
      bot.sendMessage(chatId, "😔 Не удалось найти изображение. Попробуйте позже.");
    }
    return;
  }

  // Свободный чат
  if (action === "free_chat") {
    userStates.set(chatId, { action: "free_chat", data: {} });
    bot.sendMessage(chatId, `
💬 *AI Помощник*

Я могу помочь с любыми вопросами о сайте:

• "Сколько фильмов в базе?"
• "Создай описание для фильма Начало"
• "Придумай название для подборки триллеров"
• "Напиши анонс для новости о премьере"

Напишите ваш вопрос или /menu для выхода.
`.trim(), { parse_mode: "Markdown" });
    return;
  }
});

// ============================================
// 💬 ОБРАБОТКА ТЕКСТА
// ============================================

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId) || !msg.text || msg.text.startsWith("/")) return;

  const state = userStates.get(chatId);

  // Поиск в TMDB (фильмы)
  if (state?.action === "awaiting_tmdb_search") {
    userStates.delete(chatId);
    bot.sendMessage(chatId, `⏳ Ищу "${msg.text}"...`);
    try {
      const movies = await searchTMDB(msg.text);
      await showTMDBMovies(chatId, movies, `🔍 Результаты: "${msg.text}"`);
    } catch (error) {
      bot.sendMessage(chatId, `❌ Ошибка поиска: ${error instanceof Error ? error.message : "Попробуйте позже"}`);
    }
    return;
  }

  // Поиск в TMDB (сериалы)
  if (state?.action === "awaiting_series_search") {
    userStates.delete(chatId);
    bot.sendMessage(chatId, `⏳ Ищу сериал "${msg.text}"...`);
    try {
      const series = await searchTMDBSeries(msg.text);
      await showTMDBSeries(chatId, series, `🔍 Результаты: "${msg.text}"`);
    } catch (error) {
      bot.sendMessage(chatId, `❌ Ошибка поиска: ${error instanceof Error ? error.message : "Попробуйте позже"}`);
    }
    return;
  }

  // Создание контента
  if (state?.action === "awaiting_topic" && state.data.category) {
    userStates.delete(chatId);
    await generateArticle(chatId, state.data.category as string, msg.text);
    return;
  }

  // Создание подборки
  if (state?.action === "awaiting_collection_theme") {
    userStates.delete(chatId);
    await generateCollection(chatId, msg.text);
    return;
  }

  // Свободный чат
  if (state?.action === "free_chat") {
    bot.sendMessage(chatId, "⏳ Думаю...");

    try {
      // Проверяем наличие API ключа перед использованием
      if (!GROQ_API_KEY) {
        bot.sendMessage(chatId, `❌ Ошибка: GROQ_API_KEY не установлен в переменных окружения.\n\nПроверьте файл .env и убедитесь, что переменная GROQ_API_KEY задана.`, {
          reply_markup: { inline_keyboard: [[{ text: "📋 В меню", callback_data: "back_to_menu" }]] },
        });
        return;
      }

      const [moviesCount, usersCount, articlesCount] = await Promise.all([
        prisma.movie.count(),
        prisma.user.count(),
        prisma.article.count(),
      ]);

      const groq = getGroq();
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Ты AI-помощник администратора киносайта КиноТека.
            
Статистика сайта:
- Фильмов: ${moviesCount}
- Пользователей: ${usersCount}
- Статей: ${articlesCount}

Помогай с вопросами о контенте, генерируй тексты, давай рекомендации. Отвечай на русском, кратко и по делу.`,
          },
          { role: "user", content: msg.text },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      bot.sendMessage(chatId, completion.choices[0]?.message?.content || "Не удалось получить ответ", {
        reply_markup: { inline_keyboard: [[{ text: "📋 В меню", callback_data: "back_to_menu" }]] },
      });
    } catch (error) {
      console.error("Free chat error:", error);
      let errorMessage = "Попробуйте позже";
      
      if (error instanceof Error) {
        if (error.message.includes("API key") || error.message.includes("401") || error.message.includes("Invalid API Key")) {
          errorMessage = "Неверный или отсутствующий API ключ Groq. Проверьте переменную GROQ_API_KEY в .env файле.";
        } else if (error.message.includes("429") || error.message.includes("rate limit")) {
          errorMessage = "Превышен лимит запросов. Попробуйте позже.";
        } else {
          errorMessage = error.message;
        }
      }
      
      bot.sendMessage(chatId, `❌ Ошибка: ${errorMessage}`, {
        reply_markup: { inline_keyboard: [[{ text: "📋 В меню", callback_data: "back_to_menu" }]] },
      });
    }
    return;
  }
});

// ============================================
// 🚀 ЗАПУСК
// ============================================

console.log("🎬 ══════════════════════════════════════");
console.log("🎬 КиноТека Бот запущен!");
console.log("🎬 ══════════════════════════════════════");
console.log(`📱 Admin ID: ${ADMIN_ID}`);
console.log(`🌐 Site URL: ${SITE_URL}`);
console.log(`🤖 AI: Groq (Llama 3.3)`);
console.log(`🎬 TMDB: ${TMDB_API_KEY ? "✅" : "❌"}`);
console.log(`🖼 Unsplash: ${UNSPLASH_ACCESS_KEY ? "✅" : "❌"}`);
console.log("🎬 ══════════════════════════════════════");
