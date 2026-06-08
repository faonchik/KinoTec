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
    return API_KEY;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const freekeys = require("freekeys");
  const keys = await freekeys();
  API_KEY = keys.tmdb_key;
  USE_BEARER = false;
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

async function main() {
  const seriesList = await prisma.series.findMany({
    where: {
      tmdbId: { not: null },
      seasons: { none: {} }
    }
  });

  console.log(`Found ${seriesList.length} TV Series to sync.`);

  for (const s of seriesList) {
    if (!s.tmdbId) continue;
    console.log(`Syncing "${s.title}" (tmdbId: ${s.tmdbId})...`);

    try {
      // Fetch tv details
      const tvData = await fetchTMDB(`/tv/${s.tmdbId}`);
      
      const seasonsData = tvData.seasons || [];
      for (const season of seasonsData) {
        const seasonNumber = season.season_number;
        
        console.log(`  Fetching Season ${seasonNumber}...`);
        const seasonDetails = await fetchTMDB(`/tv/${s.tmdbId}/season/${seasonNumber}`);
        
        // Create season record
        const createdSeason = await prisma.season.create({
          data: {
            seasonNumber: seasonNumber,
            name: season.name || `Сезон ${seasonNumber}`,
            overview: season.overview || null,
            poster: getImageUrl(season.poster_path),
            airDate: season.air_date ? new Date(season.air_date) : null,
            seriesId: s.id,
          }
        });

        // Create episode records
        const episodes = seasonDetails.episodes || [];
        for (const ep of episodes) {
          await prisma.episode.create({
            data: {
              episodeNumber: ep.episode_number,
              name: ep.name || `Эпизод ${ep.episode_number}`,
              overview: ep.overview || null,
              stillPath: getImageUrl(ep.still_path),
              airDate: ep.air_date ? new Date(ep.air_date) : null,
              runtime: ep.runtime || tvData.episode_run_time?.[0] || null,
              seasonId: createdSeason.id,
            }
          });
        }
      }

      console.log(`✅ Completed "${s.title}"`);
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`❌ Failed to sync "${s.title}":`, e);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
