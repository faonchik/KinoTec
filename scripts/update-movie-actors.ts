/**
 * Скрипт для обновления актёров существующих фильмов из TMDB
 * 
 * Использование:
 *   npx tsx scripts/update-movie-actors.ts [movieId]
 * 
 * Если указан movieId - обновляет только этот фильм
 * Если не указан - обновляет все фильмы с менее чем 5 актёрами
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("❌ TMDB_API_KEY не установлен в переменных окружения");
  process.exit(1);
}

interface TMDBPerson {
  id: number;
  name: string;
  character: string;
  order: number;
  profile_path: string | null;
}

interface TMDBCredits {
  cast: TMDBPerson[];
}

async function fetchTMDB(endpoint: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3${endpoint}?api_key=${TMDB_API_KEY}&language=ru-RU`
  );
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
}

function getImageUrl(path: string | null, size: string = "w500"): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

async function searchMovieInTMDB(title: string, year?: number): Promise<number | null> {
  try {
    const query = encodeURIComponent(title);
    const params: Record<string, string> = { query };
    if (year) {
      params.year = year.toString();
    }
    const data = await fetchTMDB(`/search/movie`, params);
    
    if (data.results && data.results.length > 0) {
      // Если указан год, ищем наиболее подходящий результат
      if (year) {
        const matching = data.results.find(
          (m: { release_date?: string }) => 
            m.release_date && new Date(m.release_date).getFullYear() === year
        );
        return matching ? matching.id : data.results[0].id;
      }
      // Берём первый результат (наиболее релевантный)
      return data.results[0].id;
    }
    return null;
  } catch (error) {
    console.error(`Ошибка поиска "${title}" в TMDB:`, error);
    return null;
  }
}

async function updateMovieActors(movieId: string) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        actors: true,
      },
    });

    if (!movie) {
      console.log(`❌ Фильм ${movieId} не найден`);
      return false;
    }

    // Пропускаем, если уже есть достаточно актёров (5+)
    if (movie.actors.length >= 5) {
      console.log(`⏭️  Пропускаем "${movie.title}" - уже есть ${movie.actors.length} актёров`);
      return false;
    }

    console.log(`\n🎬 Обновляю "${movie.title}" (${movie.actors.length} актёров)`);

    // Ищем фильм в TMDB
    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined;
    const tmdbId = await searchMovieInTMDB(movie.title, year);

    if (!tmdbId) {
      // Пробуем поиск по оригинальному названию
      if (movie.originalTitle && movie.originalTitle !== movie.title) {
        const tmdbIdAlt = await searchMovieInTMDB(movie.originalTitle, year);
        if (tmdbIdAlt) {
          console.log(`  ✅ Найден в TMDB по оригинальному названию (ID: ${tmdbIdAlt})`);
          return await importActorsFromTMDB(movieId, tmdbIdAlt);
        }
      }
      console.log(`  ⚠️  Не найден в TMDB`);
      return false;
    }

    console.log(`  ✅ Найден в TMDB (ID: ${tmdbId})`);
    return await importActorsFromTMDB(movieId, tmdbId);
  } catch (error) {
    console.error(`❌ Ошибка обновления фильма ${movieId}:`, error);
    return false;
  }
}

async function importActorsFromTMDB(movieId: string, tmdbId: number): Promise<boolean> {
  try {
    const credits = await fetchTMDB(`/movie/${tmdbId}/credits`) as TMDBCredits;
    const actors = credits?.cast || [];

    if (actors.length === 0) {
      console.log(`  ⚠️  Нет актёров в TMDB`);
      return false;
    }

    console.log(`  📥 Импортирую ${actors.length} актёров...`);

    let added = 0;
    let skipped = 0;

    for (const tmdbActor of actors) {
      try {
        // Проверяем, есть ли уже такой актёр в базе
        let actor = await prisma.actor.findFirst({
          where: { name: tmdbActor.name },
        });

        // Проверяем, не связан ли уже этот актёр с фильмом
        const existingLink = await prisma.movieActor.findUnique({
          where: {
            movieId_actorId: {
              movieId,
              actorId: actor?.id || "",
            },
          },
        });

        if (existingLink) {
          skipped++;
          continue;
        }

        // Создаём актёра, если его нет
        if (!actor) {
          // Получаем детали актёра
          const personDetails = await fetchTMDB(`/person/${tmdbActor.id}`);
          
          actor = await prisma.actor.create({
            data: {
              name: tmdbActor.name,
              bio: personDetails.biography || null,
              photo: getImageUrl(tmdbActor.profile_path),
              birthDate: personDetails.birthday ? new Date(personDetails.birthday) : null,
              birthPlace: personDetails.place_of_birth || null,
              deathDate: personDetails.deathday ? new Date(personDetails.deathday) : null,
            },
          });
          console.log(`    🎭 Создан актёр: ${actor.name}`);
        }

        // Связываем актёра с фильмом
        await prisma.movieActor.create({
          data: {
            movieId,
            actorId: actor.id,
            character: tmdbActor.character || "",
            order: tmdbActor.order || 0,
          },
        });

        added++;
      } catch (error) {
        console.error(`    ⚠️  Ошибка добавления актёра ${tmdbActor.name}:`, error);
        skipped++;
      }
    }

    console.log(`  ✅ Добавлено: ${added}, пропущено: ${skipped}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Ошибка импорта актёров:`, error);
    return false;
  }
}

async function main() {
  const movieId = process.argv[2];

  if (movieId) {
    // Обновляем один фильм
    console.log("🎬 Обновление актёров для одного фильма\n");
    await updateMovieActors(movieId);
  } else {
    // Обновляем все фильмы с недостаточным количеством актёров
    console.log("🎬 Обновление актёров для всех фильмов\n");

    const movies = await prisma.movie.findMany({
      include: {
        actors: true,
      },
    });

    const moviesToUpdate = movies.filter((m) => m.actors.length < 5);

    console.log(`📊 Найдено фильмов для обновления: ${moviesToUpdate.length} из ${movies.length}\n`);

    let updated = 0;
    let failed = 0;

    for (const movie of moviesToUpdate) {
      const success = await updateMovieActors(movie.id);
      if (success) {
        updated++;
      } else {
        failed++;
      }

      // Небольшая задержка, чтобы не перегружать TMDB API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`\n✅ Обновлено: ${updated}`);
    console.log(`❌ Не удалось обновить: ${failed}`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

