import { PrismaClient, AchievementCategory } from "@prisma/client";

const prisma = new PrismaClient();

const achievements = [
  // Просмотры
  { code: "FIRST_MOVIE", name: "Первый шаг", description: "Посмотрите свой первый фильм", icon: "🎬", points: 10, category: "WATCHING" },
  { code: "WATCHED_10", name: "Начинающий киноман", description: "Посмотрите 10 фильмов", icon: "🎥", points: 50, category: "WATCHING" },
  { code: "WATCHED_50", name: "Опытный зритель", description: "Посмотрите 50 фильмов", icon: "📽️", points: 100, category: "WATCHING" },
  { code: "WATCHED_100", name: "Киногурман", description: "Посмотрите 100 фильмов", icon: "🏆", points: 200, category: "WATCHING" },
  { code: "MARATHON", name: "Марафонец", description: "Посмотрите 5 фильмов за день", icon: "🏃", points: 75, category: "WATCHING" },
  { code: "NIGHT_OWL", name: "Ночная сова", description: "Начните смотреть фильм после полуночи", icon: "🦉", points: 25, category: "WATCHING" },
  
  // Отзывы
  { code: "FIRST_REVIEW", name: "Первое слово", description: "Напишите свой первый отзыв", icon: "✍️", points: 15, category: "REVIEWS" },
  { code: "REVIEWS_10", name: "Критик", description: "Напишите 10 отзывов", icon: "📝", points: 60, category: "REVIEWS" },
  { code: "REVIEWS_50", name: "Публицист", description: "Напишите 50 отзывов", icon: "📰", points: 150, category: "REVIEWS" },
  { code: "HELPFUL_REVIEW", name: "Полезный отзыв", description: "Получите 10 лайков на отзыв", icon: "👍", points: 40, category: "REVIEWS" },
  
  // Коллекционирование
  { code: "GENRE_MASTER", name: "Мастер жанра", description: "Посмотрите 20 фильмов одного жанра", icon: "🎭", points: 80, category: "COLLECTOR" },
  { code: "DIRECTOR_FAN", name: "Фанат режиссёра", description: "Посмотрите 5 фильмов одного режиссёра", icon: "🎬", points: 60, category: "COLLECTOR" },
  { code: "DECADE_EXPLORER", name: "Исследователь эпох", description: "Посмотрите фильмы из 5 разных десятилетий", icon: "🕰️", points: 70, category: "COLLECTOR" },
  { code: "WORLD_CINEMA", name: "Мировое кино", description: "Посмотрите фильмы из 10 разных стран", icon: "🌍", points: 90, category: "COLLECTOR" },
  
  // Социальные
  { code: "FIRST_FAVORITE", name: "Первая любовь", description: "Добавьте фильм в избранное", icon: "❤️", points: 10, category: "SOCIAL" },
  { code: "FAVORITES_25", name: "Коллекционер", description: "Добавьте 25 фильмов в избранное", icon: "💖", points: 50, category: "SOCIAL" },
  { code: "WATCHLIST_PRO", name: "Планировщик", description: "Добавьте 50 фильмов в список просмотра", icon: "📋", points: 40, category: "SOCIAL" },
  
  // Общие
  { code: "EARLY_BIRD", name: "Ранняя пташка", description: "Зарегистрируйтесь на сайте", icon: "🐦", points: 5, category: "GENERAL" },
  { code: "PROFILE_COMPLETE", name: "Завершённый профиль", description: "Заполните все поля профиля", icon: "✅", points: 20, category: "GENERAL" },
  { code: "LUCKY_SPIN", name: "Удача улыбнулась", description: "Найдите фильм через рулетку", icon: "🎰", points: 15, category: "GENERAL" },
];

async function main() {
  console.log("🏆 Добавление достижений...\n");

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {
        ...achievement,
        category: achievement.category as AchievementCategory,
      },
      create: {
        ...achievement,
        category: achievement.category as AchievementCategory,
      },
    });
    console.log(`✅ ${achievement.icon} ${achievement.name}`);
  }

  console.log(`\n🎉 Добавлено ${achievements.length} достижений!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

