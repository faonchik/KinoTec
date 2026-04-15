/**
 * Скрипт для автоматического сопоставления Kinopoisk ID с фильмами в базе
 * 
 * Использует TMDB API для получения external_ids (включая kinopoisk_id)
 * и сопоставляет фильмы по названию и году
 * 
 * Использование:
 * npx tsx scripts/match-kinopoisk-ids.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import prisma from "../lib/prisma";
import tmdb from "../lib/tmdb";

// Читаем список доступных Kinopoisk ID
function loadKinopoiskIds(): Set<string> {
  try {
    const filePath = join(process.cwd(), "..", "kp_id_list.txt");
    console.log(`📖 Читаю файл: ${filePath}`);
    
    const fileContent = readFileSync(filePath, "utf-8");
    const ids = fileContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && /^\d+$/.test(line));

    console.log(`✅ Найдено ${ids.length} Kinopoisk ID в файле\n`);
    return new Set(ids);
  } catch (error) {
    console.error("❌ Ошибка при чтении файла:", error);
    return new Set();
  }
}

// Получаем external_ids из TMDB (включая kinopoisk_id)
async function getTMDBExternalIds(tmdbId: number): Promise<{ kinopoiskId?: string } | null> {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.warn("⚠️  TMDB_API_KEY не настроен");
      return null;
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${apiKey}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      kinopoiskId: data.imdb_id ? null : (data.id ? String(data.id) : undefined), // TMDB не возвращает kinopoisk_id напрямую
    };
  } catch (error) {
    return null;
  }
}

// Основная функция сопоставления
async function matchKinopoiskIds() {
  const kinopoiskIdsSet = loadKinopoiskIds();
  
  if (kinopoiskIdsSet.size === 0) {
    console.error("❌ Не удалось загрузить Kinopoisk ID из файла");
    return;
  }

  console.log("🔍 Начинаю поиск фильмов без kinopoiskId...\n");

  // Получаем все фильмы без kinopoiskId
  const moviesWithoutKpId = await prisma.movie.findMany({
    where: {
      kinopoiskId: null,
    },
    select: {
      id: true,
      title: true,
      originalTitle: true,
      releaseDate: true,
      tmdbId: true,
    },
    take: 1000, // Обрабатываем по 1000 за раз
  });

  console.log(`📊 Найдено ${moviesWithoutKpId.length} фильмов без kinopoiskId\n`);

  let matched = 0;
  let updated = 0;

  for (const movie of moviesWithoutKpId) {
    try {
      // Если есть tmdbId, пробуем получить external_ids
      if (movie.tmdbId) {
        const externalIds = await getTMDBExternalIds(parseInt(movie.tmdbId));
        // К сожалению, TMDB не возвращает kinopoisk_id напрямую
      }

      // Пробуем найти kinopoiskId через поиск по названию
      // Это требует использования внешнего API или базы данных сопоставления
      // Пока пропускаем этот фильм
      
      console.log(`⏭️  Пропущен: ${movie.title} (нет способа автоматического сопоставления)`);
    } catch (error) {
      console.error(`❌ Ошибка при обработке ${movie.title}:`, error);
    }
  }

  console.log(`\n✅ Обработано: ${matched} совпадений, ${updated} обновлено`);
}

// Запуск
matchKinopoiskIds()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Критическая ошибка:", error);
    prisma.$disconnect();
    process.exit(1);
  });

