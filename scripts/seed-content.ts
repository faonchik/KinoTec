import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎬 Создание подборок и челленджей...\n");

  // Подборки
  const collections = [
    {
      title: "Оскар 2024: Лучшие фильмы",
      slug: "oscar-2024",
      description: "Номинанты и победители премии Оскар 2024 года",
      isFeatured: true,
      order: 1,
    },
    {
      title: "Классика мирового кино",
      slug: "classics",
      description: "Фильмы, которые должен посмотреть каждый",
      isFeatured: true,
      order: 2,
    },
    {
      title: "Топ Netflix 2024",
      slug: "netflix-top",
      description: "Самые популярные фильмы на Netflix",
      isFeatured: true,
      order: 3,
    },
    {
      title: "Шедевры Кристофера Нолана",
      slug: "nolan-collection",
      description: "Все фильмы легендарного режиссёра",
      order: 4,
    },
    {
      title: "Для семейного просмотра",
      slug: "family-movies",
      description: "Фильмы, которые понравятся всей семье",
      order: 5,
    },
    {
      title: "Недооценённые шедевры",
      slug: "underrated-gems",
      description: "Фильмы, которые заслуживают большего внимания",
      order: 6,
    },
  ];

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: collection,
      create: collection,
    });
    console.log(`✅ Подборка: ${collection.title}`);
  }

  // Челленджи
  const challenges = [
    {
      title: "Неделя ужасов",
      slug: "horror-week",
      description: "Посмотрите 7 фильмов ужасов за неделю. Только для смелых! 👻",
      type: "GENRE" as const,
      goal: 7,
      points: 150,
      conditions: { genre: "horror" },
      isActive: true,
    },
    {
      title: "Мир Нолана",
      slug: "nolan-world",
      description: "Погрузитесь в фильмографию Кристофера Нолана — посмотрите 5 его фильмов",
      type: "DIRECTOR" as const,
      goal: 5,
      points: 200,
      conditions: { director: "Christopher Nolan" },
      isActive: true,
    },
    {
      title: "Комедийный марафон",
      slug: "comedy-marathon",
      description: "Время посмеяться! Посмотрите 10 комедий 😂",
      type: "GENRE" as const,
      goal: 10,
      points: 100,
      conditions: { genre: "comedy" },
      isActive: true,
    },
    {
      title: "Путешествие во времени",
      slug: "time-travel",
      description: "Посмотрите по одному фильму из каждого десятилетия (60-е, 70-е, 80-е, 90-е, 00-е, 10-е, 20-е)",
      type: "CUSTOM" as const,
      goal: 7,
      points: 250,
      conditions: { decades: [1960, 1970, 1980, 1990, 2000, 2010, 2020] },
      isActive: true,
    },
    {
      title: "Новичок",
      slug: "beginner",
      description: "Отличное начало! Посмотрите первые 5 фильмов на КиноТеке",
      type: "CUSTOM" as const,
      goal: 5,
      points: 50,
      isActive: true,
    },
    {
      title: "Киноман",
      slug: "cinephile",
      description: "Настоящий ценитель! Посмотрите 50 фильмов",
      type: "CUSTOM" as const,
      goal: 50,
      points: 500,
      isActive: true,
    },
    {
      title: "Мастер драмы",
      slug: "drama-master",
      description: "Посмотрите 15 драматических фильмов",
      type: "GENRE" as const,
      goal: 15,
      points: 200,
      conditions: { genre: "drama" },
      isActive: true,
    },
    {
      title: "Фантастика и фэнтези",
      slug: "scifi-fantasy",
      description: "Исследуйте миры фантастики — посмотрите 10 фильмов жанра",
      type: "GENRE" as const,
      goal: 10,
      points: 150,
      conditions: { genre: "science-fiction" },
      isActive: true,
    },
  ];

  for (const challenge of challenges) {
    await prisma.challenge.upsert({
      where: { slug: challenge.slug },
      update: challenge,
      create: challenge,
    });
    console.log(`✅ Челлендж: ${challenge.title}`);
  }

  console.log("\n🎉 Готово!");
  console.log(`📚 Создано ${collections.length} подборок`);
  console.log(`🎯 Создано ${challenges.length} челленджей`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

