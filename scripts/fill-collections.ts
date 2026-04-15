import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎬 Заполнение подборок фильмами...\n");

  // Получаем все фильмы
  const allMovies = await prisma.movie.findMany({
    include: {
      genres: { include: { genre: true } },
      director: true,
      ratings: true,
    },
    orderBy: { popularity: "desc" },
  });

  if (allMovies.length === 0) {
    console.log("⚠️ Нет фильмов в базе. Сначала импортируйте фильмы из TMDB.");
    return;
  }

  // Получаем подборки
  const collections = await prisma.collection.findMany();

  for (const collection of collections) {
    let moviesToAdd: typeof allMovies = [];

    // Логика подбора фильмов для каждой подборки
    switch (collection.slug) {
      case "oscar-2024":
        // Оскар 2024 - популярные фильмы 2024 года
        moviesToAdd = allMovies
          .filter((m) => {
            if (!m.releaseDate) return false;
            const year = new Date(m.releaseDate).getFullYear();
            return year >= 2023 && year <= 2024;
          })
          .slice(0, 10);
        break;

      case "classics":
        // Классика - старые фильмы с высоким рейтингом
        moviesToAdd = allMovies
          .filter((m) => {
            if (!m.releaseDate) return false;
            const year = new Date(m.releaseDate).getFullYear();
            return year < 2000;
          })
          .sort((a, b) => {
            const ratingA = a.ratings.length
              ? a.ratings.reduce((acc, r) => acc + r.value, 0) / a.ratings.length
              : 0;
            const ratingB = b.ratings.length
              ? b.ratings.reduce((acc, r) => acc + r.value, 0) / b.ratings.length
              : 0;
            return ratingB - ratingA;
          })
          .slice(0, 15);
        break;

      case "netflix-top":
        // Топ Netflix - популярные фильмы последних лет
        moviesToAdd = allMovies
          .filter((m) => {
            if (!m.releaseDate) return false;
            const year = new Date(m.releaseDate).getFullYear();
            return year >= 2020;
          })
          .slice(0, 12);
        break;

      case "nolan-collection":
        // Фильмы Нолана
        moviesToAdd = allMovies.filter((m) => m.director?.name?.includes("Нолан")).slice(0, 10);
        break;

      case "family-movies":
        // Семейные - комедии и анимация
        moviesToAdd = allMovies
          .filter((m) =>
            m.genres.some(
              (g) => g.genre.slug === "comedy" || g.genre.slug === "animation"
            )
          )
          .slice(0, 10);
        break;

      case "underrated-gems":
        // Недооценённые - фильмы с низкой популярностью но хорошим рейтингом
        moviesToAdd = allMovies
          .filter((m) => {
            const rating = m.ratings.length
              ? m.ratings.reduce((acc, r) => acc + r.value, 0) / m.ratings.length
              : 0;
            return rating >= 7 && m.popularity < 50;
          })
          .slice(0, 10);
        break;

      default:
        // По умолчанию - топ популярных
        moviesToAdd = allMovies.slice(0, 10);
    }

    // Удаляем старые связи
    await prisma.collectionMovie.deleteMany({
      where: { collectionId: collection.id },
    });

    // Добавляем фильмы в подборку
    for (let i = 0; i < moviesToAdd.length; i++) {
      await prisma.collectionMovie.create({
        data: {
          collectionId: collection.id,
          movieId: moviesToAdd[i].id,
          order: i,
        },
      });
    }

    console.log(`✅ ${collection.title}: добавлено ${moviesToAdd.length} фильмов`);
  }

  console.log("\n🎉 Подборки заполнены!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

