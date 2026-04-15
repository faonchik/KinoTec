import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

let API_KEY = "";

async function getApiKey() {
  if (API_KEY) return API_KEY;
  const freekeys = (await import("freekeys")).default;
  const keys = await freekeys();
  API_KEY = keys.tmdb_key;
  console.log("✅ TMDB API ключ получен");
  return API_KEY;
}

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = await getApiKey();
  const searchParams = new URLSearchParams({
    api_key: apiKey,
    ...params,
  });
  
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);
  if (!response.ok) return null;
  return response.json();
}

async function searchPerson(name: string) {
  const data = await fetchTMDB("/search/person", { query: name });
  if (!data?.results?.length) return null;
  return data.results[0];
}

async function getPersonDetails(personId: number, language = "ru-RU") {
  return await fetchTMDB(`/person/${personId}`, { language });
}

async function updateDirectorBio(director: { id: string; name: string; bio: string | null }) {
  try {
    // Ищем режиссёра в TMDB
    const person = await searchPerson(director.name);
    if (!person) {
      console.log(`⏭️  Не найден в TMDB: ${director.name}`);
      return false;
    }

    // Получаем детали на русском
    let details = await getPersonDetails(person.id, "ru-RU");
    let bio = details?.biography;

    // Если нет русской биографии, берём английскую
    if (!bio || bio.length < 50) {
      const enDetails = await getPersonDetails(person.id, "en-US");
      if (enDetails?.biography && enDetails.biography.length > (bio?.length || 0)) {
        bio = enDetails.biography;
      }
    }

    if (!bio || bio.length < 20) {
      console.log(`⏭️  Нет биографии: ${director.name}`);
      return false;
    }

    // Обновляем в базе
    await prisma.director.update({
      where: { id: director.id },
      data: { 
        bio,
        birthDate: details?.birthday ? new Date(details.birthday) : undefined,
        deathDate: details?.deathday ? new Date(details.deathday) : undefined,
        birthPlace: details?.place_of_birth || undefined,
      },
    });

    console.log(`✅ Обновлён: ${director.name} (${bio.length} символов)`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка: ${director.name}`, error);
    return false;
  }
}

async function updateActorBio(actor: { id: string; name: string; bio: string | null }) {
  try {
    const person = await searchPerson(actor.name);
    if (!person) {
      console.log(`⏭️  Не найден в TMDB: ${actor.name}`);
      return false;
    }

    let details = await getPersonDetails(person.id, "ru-RU");
    let bio = details?.biography;

    if (!bio || bio.length < 50) {
      const enDetails = await getPersonDetails(person.id, "en-US");
      if (enDetails?.biography && enDetails.biography.length > (bio?.length || 0)) {
        bio = enDetails.biography;
      }
    }

    if (!bio || bio.length < 20) {
      console.log(`⏭️  Нет биографии: ${actor.name}`);
      return false;
    }

    await prisma.actor.update({
      where: { id: actor.id },
      data: { 
        bio,
        birthDate: details?.birthday ? new Date(details.birthday) : undefined,
        deathDate: details?.deathday ? new Date(details.deathday) : undefined,
        birthPlace: details?.place_of_birth || undefined,
      },
    });

    console.log(`✅ Обновлён: ${actor.name} (${bio.length} символов)`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка: ${actor.name}`, error);
    return false;
  }
}

async function main() {
  console.log("📚 Обновление биографий режиссёров и актёров...\n");

  // Режиссёры без биографии или с короткой биографией
  const directors = await prisma.director.findMany({
    where: {
      OR: [
        { bio: null },
        { bio: "" },
      ]
    },
    select: { id: true, name: true, bio: true },
  });

  console.log(`\n👨‍🎬 Режиссёры без биографии: ${directors.length}`);
  
  let updatedDirectors = 0;
  for (const director of directors) {
    const success = await updateDirectorBio(director);
    if (success) updatedDirectors++;
    await new Promise(r => setTimeout(r, 250)); // Задержка для API
  }

  // Топ актёры без биографии (только первые 200 для скорости)
  const actors = await prisma.actor.findMany({
    where: {
      OR: [
        { bio: null },
        { bio: "" },
      ]
    },
    select: { id: true, name: true, bio: true },
    take: 500,
  });

  console.log(`\n🎭 Актёры без биографии: ${actors.length} (обрабатываем первые 200)`);
  
  let updatedActors = 0;
  for (const actor of actors) {
    const success = await updateActorBio(actor);
    if (success) updatedActors++;
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n✨ Готово!`);
  console.log(`   Режиссёров обновлено: ${updatedDirectors}/${directors.length}`);
  console.log(`   Актёров обновлено: ${updatedActors}/${actors.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

