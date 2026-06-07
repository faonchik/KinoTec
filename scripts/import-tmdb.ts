import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

let API_KEY = "";
let USE_BEARER = false;

function isPlaceholderKey(raw: string): boolean {
  const t = raw.trim();
  return !t || t === "ваш_ключ_здесь" || t === "your_key_here";
}

async function getApiKey() {
  if (API_KEY) return API_KEY;

  const envKey = process.env.TMDB_API_KEY?.trim();
  if (envKey && !isPlaceholderKey(envKey)) {
    API_KEY = envKey;
    USE_BEARER = envKey.startsWith("eyJ");
    console.log(USE_BEARER ? "✅ TMDB: Read Access Token (Bearer)" : "✅ TMDB: API Key (query)");
    return API_KEY;
  }

  const freekeys = (await import("freekeys")).default;
  const keys = await freekeys();
  API_KEY = keys.tmdb_key;
  USE_BEARER = false;
  console.log("✅ TMDB API ключ получен через freekeys");
  return API_KEY;
}

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  await getApiKey();
  const searchParams = new URLSearchParams({
    language: "ru-RU",
    ...params,
  });
  if (!USE_BEARER) {
    searchParams.set("api_key", API_KEY);
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (USE_BEARER) {
    headers.Authorization = `Bearer ${API_KEY}`;
  }

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`, { headers });
  if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
  return response.json();
}

function getImageUrl(path: string | null, size = "w500") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

interface TMDBPerson {
  job?: string;
  name: string;
  id: number;
  profile_path: string | null;
  character?: string;
  order?: number;
}

interface TMDBCountry {
  name: string;
}

interface TMDBGenre {
  id: number;
  name: string;
}

async function importMovie(tmdbId: number) {
  try {
    // Получаем данные фильма
    const movie = await fetchTMDB(`/movie/${tmdbId}`);
    const credits = await fetchTMDB(`/movie/${tmdbId}/credits`);

    // Проверяем, есть ли уже такой фильм
    const existingMovie = await prisma.movie.findFirst({
      where: { 
        OR: [
          { title: movie.title },
          { originalTitle: movie.original_title }
        ]
      }
    });

    if (existingMovie) {
      console.log(`⏭️  Пропускаем: ${movie.title} (уже есть)`);
      return null;
    }

    // Режиссёр
    const tmdbDirector = credits.crew.find((c: TMDBPerson) => c.job === "Director");
    let directorId = null;

    if (tmdbDirector) {
      let director = await prisma.director.findFirst({
        where: { name: tmdbDirector.name },
      });

      if (!director) {
        const personDetails = await fetchTMDB(`/person/${tmdbDirector.id}`);
        director = await prisma.director.create({
          data: {
            name: tmdbDirector.name,
            bio: personDetails.biography || null,
            photo: getImageUrl(tmdbDirector.profile_path),
            birthDate: personDetails.birthday ? new Date(personDetails.birthday) : null,
            birthPlace: personDetails.place_of_birth || null,
          },
        });
        console.log(`  👨‍🎬 Добавлен режиссёр: ${director.name}`);
      }
      directorId = director.id;
    }

    // Жанры
    const genreIds: string[] = [];
    for (const g of (movie.genres as TMDBGenre[]) || []) {
      const slug = g.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-zа-яё0-9-]/g, "");
      let genre = await prisma.genre.findFirst({ where: { name: g.name } });
      if (!genre) {
        genre = await prisma.genre.create({ data: { name: g.name, slug } });
      }
      genreIds.push(genre.id);
    }

    // Создаём фильм
    const newMovie = await prisma.movie.create({
      data: {
        title: movie.title,
        originalTitle: movie.original_title,
        description: movie.overview,
        poster: getImageUrl(movie.poster_path),
        backdrop: getImageUrl(movie.backdrop_path, "original"),
        releaseDate: movie.release_date ? new Date(movie.release_date) : null,
        runtime: movie.runtime || null,
        budget: movie.budget ? BigInt(movie.budget) : null,
        revenue: movie.revenue ? BigInt(movie.revenue) : null,
        country: movie.production_countries?.map((c: TMDBCountry) => c.name).join(", ") || null,
        popularity: movie.vote_average * 10,
        directorId,
        genres: {
          create: genreIds.map((genreId) => ({ genreId })),
        },
      },
    });

    console.log(`✅ Импортирован: ${movie.title} (${movie.release_date?.slice(0, 4) || "N/A"})`);

    // Актёры (все из cast, обычно до 20-30)
    const topActors = (credits.cast as TMDBPerson[]) || [];
    for (const a of topActors) {
      let actor = await prisma.actor.findFirst({ where: { name: a.name } });
      
      if (!actor) {
        const personDetails = await fetchTMDB(`/person/${a.id}`);
        actor = await prisma.actor.create({
          data: {
            name: a.name,
            bio: personDetails.biography || null,
            photo: getImageUrl(a.profile_path),
            birthDate: personDetails.birthday ? new Date(personDetails.birthday) : null,
            birthPlace: personDetails.place_of_birth || null,
          },
        });
        console.log(`  🎭 Добавлен актёр: ${actor.name}`);
      }

      await prisma.movieActor.create({
        data: {
          movieId: newMovie.id,
          actorId: actor.id,
          character: a.character || "",
          order: a.order || 0,
        },
      });
    }

    return newMovie;
  } catch (error) {
    console.error(`❌ Ошибка импорта ${tmdbId}:`, error);
    return null;
  }
}

async function main() {
  console.log("🎬 Начинаем импорт фильмов из TMDB...\n");

  // Популярные фильмы (несколько страниц)
  const categories = [
    { name: "Популярные", endpoint: "/movie/popular" },
    { name: "Топ рейтинг", endpoint: "/movie/top_rated" },
    { name: "Сейчас в кино", endpoint: "/movie/now_playing" },
  ];

  let totalImported = 0;

  for (const category of categories) {
    console.log(`\n📂 ${category.name}:`);
    
    for (let page = 1; page <= 3; page++) {
      const data = await fetchTMDB(category.endpoint, { page: page.toString() });
      
      for (const movie of data.results) {
        const result = await importMovie(movie.id);
        if (result) totalImported++;
        
        // Небольшая задержка чтобы не перегружать API
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }

  console.log(`\n🎉 Готово! Импортировано ${totalImported} фильмов`);

  // Статистика
  const stats = await prisma.$transaction([
    prisma.movie.count(),
    prisma.actor.count(),
    prisma.director.count(),
    prisma.genre.count(),
  ]);

  console.log(`\n📊 Статистика базы данных:`);
  console.log(`   Фильмов: ${stats[0]}`);
  console.log(`   Актёров: ${stats[1]}`);
  console.log(`   Режиссёров: ${stats[2]}`);
  console.log(`   Жанров: ${stats[3]}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
