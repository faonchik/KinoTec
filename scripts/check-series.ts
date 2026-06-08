import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const series = await prisma.series.findMany({
    where: {
      title: {
        contains: "Пацаны"
      }
    },
    include: {
      seasons: {
        include: {
          episodes: true
        }
      }
    }
  });

  console.log("=== The Boys Stats ===");
  for (const s of series) {
    console.log(`Series: "${s.title}" (ID: ${s.id}, tmdbId: ${s.tmdbId})`);
    console.log(`  Seasons count: ${s.seasons.length}`);
    for (const season of s.seasons) {
      console.log(`    Season ${season.seasonNumber} ("${season.name}"): ${season.episodes.length} episodes`);
    }
  }

  // Also check if there are other series with 0 seasons
  const zeroSeasons = await prisma.series.findMany({
    where: {
      seasons: { none: {} }
    }
  });
  console.log(`\nSeries with 0 seasons in DB: ${zeroSeasons.length}`);
  for (const s of zeroSeasons.slice(0, 10)) {
    console.log(`- "${s.title}" (ID: ${s.id}, tmdbId: ${s.tmdbId})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
