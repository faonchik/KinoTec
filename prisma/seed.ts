import { PrismaClient, Role, MovieStatus, ArticleCategory, WatchlistType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Начинаем заполнение базы данных...");

  // Создаем пользователей
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@kinoteka.com" },
    update: {},
    create: {
      email: "admin@kinoteka.com",
      name: "Администратор",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@kinoteka.com" },
    update: {},
    create: {
      email: "user@kinoteka.com",
      name: "Иван Петров",
      password: hashedPassword,
      role: Role.USER,
    },
  });

  console.log("✅ Пользователи созданы");

  // Создаем жанры
  const genres = await Promise.all([
    prisma.genre.upsert({
      where: { slug: "drama" },
      update: {},
      create: { name: "Драма", slug: "drama", description: "Фильмы с глубоким эмоциональным содержанием" },
    }),
    prisma.genre.upsert({
      where: { slug: "action" },
      update: {},
      create: { name: "Боевик", slug: "action", description: "Фильмы с динамичными сценами и экшеном" },
    }),
    prisma.genre.upsert({
      where: { slug: "comedy" },
      update: {},
      create: { name: "Комедия", slug: "comedy", description: "Смешные и развлекательные фильмы" },
    }),
    prisma.genre.upsert({
      where: { slug: "sci-fi" },
      update: {},
      create: { name: "Фантастика", slug: "sci-fi", description: "Научно-фантастические фильмы" },
    }),
    prisma.genre.upsert({
      where: { slug: "thriller" },
      update: {},
      create: { name: "Триллер", slug: "thriller", description: "Напряженные и захватывающие фильмы" },
    }),
    prisma.genre.upsert({
      where: { slug: "horror" },
      update: {},
      create: { name: "Ужасы", slug: "horror", description: "Страшные и пугающие фильмы" },
    }),
    prisma.genre.upsert({
      where: { slug: "romance" },
      update: {},
      create: { name: "Мелодрама", slug: "romance", description: "Романтические истории о любви" },
    }),
    prisma.genre.upsert({
      where: { slug: "animation" },
      update: {},
      create: { name: "Анимация", slug: "animation", description: "Мультфильмы и анимационные фильмы" },
    }),
    prisma.genre.upsert({
      where: { slug: "documentary" },
      update: {},
      create: { name: "Документальный", slug: "documentary", description: "Документальные фильмы" },
    }),
    prisma.genre.upsert({
      where: { slug: "crime" },
      update: {},
      create: { name: "Криминал", slug: "crime", description: "Криминальные истории и детективы" },
    }),
  ]);

  console.log("✅ Жанры созданы");

  // Создаем режиссеров
  const nolan = await prisma.director.upsert({
    where: { id: "nolan" },
    update: {},
    create: {
      id: "nolan",
      name: "Кристофер Нолан",
      bio: "Кристофер Нолан — британско-американский кинорежиссёр, сценарист и продюсер. Известен своими сложными нарративами и визуально впечатляющими фильмами. Снял такие картины как «Начало», «Тёмный рыцарь» и «Интерстеллар».",
      photo: "https://image.tmdb.org/t/p/w500/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg",
      birthDate: new Date("1970-07-30"),
      birthPlace: "Лондон, Англия",
    },
  });

  const villeneuve = await prisma.director.upsert({
    where: { id: "villeneuve" },
    update: {},
    create: {
      id: "villeneuve",
      name: "Дени Вильнёв",
      bio: "Дени Вильнёв — канадский кинорежиссёр и сценарист. Признанный мастер визуального повествования, создатель таких фильмов как «Прибытие», «Бегущий по лезвию 2049» и «Дюна».",
      photo: "https://image.tmdb.org/t/p/w500/zdDx9Xs93UIrJFWYApYR28J8M6b.jpg",
      birthDate: new Date("1967-10-03"),
      birthPlace: "Три-Ривьер, Квебек, Канада",
    },
  });

  const tarantino = await prisma.director.upsert({
    where: { id: "tarantino" },
    update: {},
    create: {
      id: "tarantino",
      name: "Квентин Тарантино",
      bio: "Квентин Тарантино — американский кинорежиссёр, сценарист, продюсер и актёр. Известен своим уникальным стилем, нелинейным повествованием и диалогами. Автор культовых фильмов «Криминальное чтиво» и «Убить Билла».",
      photo: "https://image.tmdb.org/t/p/w500/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg",
      birthDate: new Date("1963-03-27"),
      birthPlace: "Ноксвилл, Теннесси, США",
    },
  });

  console.log("✅ Режиссёры созданы");

  // Создаем актеров
  const dicaprio = await prisma.actor.upsert({
    where: { id: "dicaprio" },
    update: {},
    create: {
      id: "dicaprio",
      name: "Леонардо Ди Каприо",
      bio: "Леонардо Вильгельм Ди Каприо — американский актёр и кинопродюсер. Обладатель премии «Оскар». Известен ролями в фильмах «Титаник», «Начало», «Волк с Уолл-стрит».",
      photo: "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
      birthDate: new Date("1974-11-11"),
      birthPlace: "Лос-Анджелес, Калифорния, США",
    },
  });

  const pitt = await prisma.actor.upsert({
    where: { id: "pitt" },
    update: {},
    create: {
      id: "pitt",
      name: "Брэд Питт",
      bio: "Брэд Питт — американский актёр и кинопродюсер. Обладатель премии «Оскар». Снялся в таких фильмах как «Бойцовский клуб», «Семь» и «Однажды в Голливуде».",
      photo: "https://image.tmdb.org/t/p/w500/cckcYc2v0yh1tc9QjRelptcOBko.jpg",
      birthDate: new Date("1963-12-18"),
      birthPlace: "Шони, Оклахома, США",
    },
  });

  const chalamet = await prisma.actor.upsert({
    where: { id: "chalamet" },
    update: {},
    create: {
      id: "chalamet",
      name: "Тимоти Шаламе",
      bio: "Тимоти Хэл Шаламе — американский актёр. Номинант на премию «Оскар». Известен по фильмам «Назови меня своим именем», «Дюна» и «Маленькие женщины».",
      photo: "https://image.tmdb.org/t/p/w500/BE2sdjpgsa2rNTFa66f7upkaOP.jpg",
      birthDate: new Date("1995-12-27"),
      birthPlace: "Нью-Йорк, США",
    },
  });

  console.log("✅ Актёры созданы");

  // Создаем фильмы
  const inception = await prisma.movie.upsert({
    where: { id: "inception" },
    update: { tmdbId: "27205" },
    create: {
      id: "inception",
      tmdbId: "27205",
      title: "Начало",
      originalTitle: "Inception",
      description: "Кобб — талантливый вор, лучший в опасном искусстве извлечения: он крадет ценные секреты из глубин подсознания во время сна, когда человеческий разум наиболее уязвим. Редкие способности Кобба сделали его ценным игроком в мире корпоративного шпионажа, но они же превратили его в беглеца и лишили всего, что он любил.",
      poster: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
      trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      releaseDate: new Date("2010-07-16"),
      runtime: 148,
      budget: BigInt(160000000),
      revenue: BigInt(836836967),
      country: "США, Великобритания",
      status: MovieStatus.RELEASED,
      popularity: 95.5,
      directorId: nolan.id,
    },
  });

  const interstellar = await prisma.movie.upsert({
    where: { id: "interstellar" },
    update: { tmdbId: "157336" },
    create: {
      id: "interstellar",
      tmdbId: "157336",
      title: "Интерстеллар",
      originalTitle: "Interstellar",
      description: "Когда засуха, пыльные бури и вымирание растений приводят человечество к продовольственному кризису, команда исследователей и учёных отправляется через червоточину в космос в поисках нового дома для человечества.",
      poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
      trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      releaseDate: new Date("2014-11-07"),
      runtime: 169,
      budget: BigInt(165000000),
      revenue: BigInt(677463813),
      country: "США, Великобритания, Канада",
      status: MovieStatus.RELEASED,
      popularity: 92.3,
      directorId: nolan.id,
    },
  });

  const dune = await prisma.movie.upsert({
    where: { id: "dune" },
    update: { tmdbId: "438631" },
    create: {
      id: "dune",
      tmdbId: "438631",
      title: "Дюна",
      originalTitle: "Dune",
      description: "Атрейдесы прибывают на планету Арракис, чтобы контролировать добычу меланжа — самого ценного ресурса во вселенной. Однако их ждёт предательство и борьба за выживание.",
      poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
      trailer: "https://www.youtube.com/watch?v=n9xhJrPXop4",
      releaseDate: new Date("2021-10-22"),
      runtime: 155,
      budget: BigInt(165000000),
      revenue: BigInt(434751000),
      country: "США, Канада",
      status: MovieStatus.RELEASED,
      popularity: 89.7,
      directorId: villeneuve.id,
    },
  });

  const pulpFiction = await prisma.movie.upsert({
    where: { id: "pulp-fiction" },
    update: { tmdbId: "680" },
    create: {
      id: "pulp-fiction",
      tmdbId: "680",
      title: "Криминальное чтиво",
      originalTitle: "Pulp Fiction",
      description: "Несколько связанных историй из криминального мира Лос-Анджелеса: два наёмных убийцы философствуют о жизни, боксёр вынужден нарушить уговор с мафией, а гангстер и его жена переживают необычное свидание.",
      poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
      trailer: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
      releaseDate: new Date("1994-10-14"),
      runtime: 154,
      budget: BigInt(8000000),
      revenue: BigInt(213928762),
      country: "США",
      status: MovieStatus.RELEASED,
      popularity: 88.4,
      directorId: tarantino.id,
    },
  });

  const darkKnight = await prisma.movie.upsert({
    where: { id: "dark-knight" },
    update: { tmdbId: "155" },
    create: {
      id: "dark-knight",
      tmdbId: "155",
      title: "Тёмный рыцарь",
      originalTitle: "The Dark Knight",
      description: "Бэтмен продолжает войну с преступностью. При поддержке лейтенанта Гордона и прокурора Харви Дента, он стремится уничтожить организованную преступность в Готэме. Но появляется новый злодей — Джокер.",
      poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
      trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      releaseDate: new Date("2008-07-18"),
      runtime: 152,
      budget: BigInt(185000000),
      revenue: BigInt(1004558444),
      country: "США, Великобритания",
      status: MovieStatus.RELEASED,
      popularity: 94.2,
      directorId: nolan.id,
    },
  });

  const bladeRunner = await prisma.movie.upsert({
    where: { id: "blade-runner-2049" },
    update: { tmdbId: "335984" },
    create: {
      id: "blade-runner-2049",
      tmdbId: "335984",
      title: "Бегущий по лезвию 2049",
      originalTitle: "Blade Runner 2049",
      description: "Молодой офицер K обнаруживает тайну, которая может ввергнуть в хаос то, что осталось от общества. Это открытие заставляет его отправиться на поиски Рика Декарда, бывшего блейдраннера, который пропал 30 лет назад.",
      poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/ilRyazdMJwN05exqhwK4tMKBYZs.jpg",
      trailer: "https://www.youtube.com/watch?v=gCcx85zbxz4",
      releaseDate: new Date("2017-10-06"),
      runtime: 164,
      budget: BigInt(150000000),
      revenue: BigInt(259239658),
      country: "США, Великобритания, Канада",
      status: MovieStatus.RELEASED,
      popularity: 87.1,
      directorId: villeneuve.id,
    },
  });

  console.log("✅ Фильмы созданы");

  // Связываем фильмы с жанрами
  const genreMap = Object.fromEntries(genres.map(g => [g.slug, g.id]));

  await Promise.all([
    // Начало
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: inception.id, genreId: genreMap["sci-fi"] } },
      update: {},
      create: { movieId: inception.id, genreId: genreMap["sci-fi"] },
    }),
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: inception.id, genreId: genreMap["action"] } },
      update: {},
      create: { movieId: inception.id, genreId: genreMap["action"] },
    }),
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: inception.id, genreId: genreMap["thriller"] } },
      update: {},
      create: { movieId: inception.id, genreId: genreMap["thriller"] },
    }),
    // Интерстеллар
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: interstellar.id, genreId: genreMap["sci-fi"] } },
      update: {},
      create: { movieId: interstellar.id, genreId: genreMap["sci-fi"] },
    }),
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: interstellar.id, genreId: genreMap["drama"] } },
      update: {},
      create: { movieId: interstellar.id, genreId: genreMap["drama"] },
    }),
    // Дюна
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: dune.id, genreId: genreMap["sci-fi"] } },
      update: {},
      create: { movieId: dune.id, genreId: genreMap["sci-fi"] },
    }),
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: dune.id, genreId: genreMap["drama"] } },
      update: {},
      create: { movieId: dune.id, genreId: genreMap["drama"] },
    }),
    // Криминальное чтиво
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: pulpFiction.id, genreId: genreMap["crime"] } },
      update: {},
      create: { movieId: pulpFiction.id, genreId: genreMap["crime"] },
    }),
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: pulpFiction.id, genreId: genreMap["drama"] } },
      update: {},
      create: { movieId: pulpFiction.id, genreId: genreMap["drama"] },
    }),
    // Тёмный рыцарь
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: darkKnight.id, genreId: genreMap["action"] } },
      update: {},
      create: { movieId: darkKnight.id, genreId: genreMap["action"] },
    }),
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: darkKnight.id, genreId: genreMap["crime"] } },
      update: {},
      create: { movieId: darkKnight.id, genreId: genreMap["crime"] },
    }),
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: darkKnight.id, genreId: genreMap["thriller"] } },
      update: {},
      create: { movieId: darkKnight.id, genreId: genreMap["thriller"] },
    }),
    // Бегущий по лезвию
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: bladeRunner.id, genreId: genreMap["sci-fi"] } },
      update: {},
      create: { movieId: bladeRunner.id, genreId: genreMap["sci-fi"] },
    }),
    prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: bladeRunner.id, genreId: genreMap["thriller"] } },
      update: {},
      create: { movieId: bladeRunner.id, genreId: genreMap["thriller"] },
    }),
  ]);

  console.log("✅ Жанры связаны с фильмами");

  const futurePremiere = await prisma.movie.upsert({
    where: { id: "seed-future-premiere" },
    update: { releaseDate: new Date("2026-09-15") },
    create: {
      id: "seed-future-premiere",
      title: "Демо: будущая премьера",
      originalTitle: "Seed future premiere",
      description:
        "Вспомогательная карточка для календаря премьер. Удалите после импорта из TMDB.",
      poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/ilRyazdMJwN05exqhwK4tMKBYZs.jpg",
      releaseDate: new Date("2026-09-15"),
      runtime: 120,
      country: "США",
      status: MovieStatus.RELEASED,
      popularity: 10,
      directorId: villeneuve.id,
    },
  });

  await prisma.movieGenre.upsert({
    where: {
      movieId_genreId: { movieId: futurePremiere.id, genreId: genreMap["sci-fi"] },
    },
    update: {},
    create: { movieId: futurePremiere.id, genreId: genreMap["sci-fi"] },
  });

  // Связываем актеров с фильмами
  await Promise.all([
    prisma.movieActor.upsert({
      where: { movieId_actorId: { movieId: inception.id, actorId: dicaprio.id } },
      update: {},
      create: { movieId: inception.id, actorId: dicaprio.id, character: "Кобб", order: 1 },
    }),
    prisma.movieActor.upsert({
      where: { movieId_actorId: { movieId: pulpFiction.id, actorId: pitt.id } },
      update: {},
      create: { movieId: pulpFiction.id, actorId: pitt.id, character: "Флойд", order: 1 },
    }),
    prisma.movieActor.upsert({
      where: { movieId_actorId: { movieId: dune.id, actorId: chalamet.id } },
      update: {},
      create: { movieId: dune.id, actorId: chalamet.id, character: "Пол Атрейдес", order: 1 },
    }),
  ]);

  console.log("✅ Актёры связаны с фильмами");

  // Создаем рейтинги
  await Promise.all([
    prisma.rating.upsert({
      where: { userId_movieId: { userId: user.id, movieId: inception.id } },
      update: {},
      create: { userId: user.id, movieId: inception.id, value: 9 },
    }),
    prisma.rating.upsert({
      where: { userId_movieId: { userId: user.id, movieId: interstellar.id } },
      update: {},
      create: { userId: user.id, movieId: interstellar.id, value: 10 },
    }),
    prisma.rating.upsert({
      where: { userId_movieId: { userId: user.id, movieId: dune.id } },
      update: {},
      create: { userId: user.id, movieId: dune.id, value: 8 },
    }),
    prisma.rating.upsert({
      where: { userId_movieId: { userId: admin.id, movieId: darkKnight.id } },
      update: {},
      create: { userId: admin.id, movieId: darkKnight.id, value: 10 },
    }),
    prisma.rating.upsert({
      where: { userId_movieId: { userId: admin.id, movieId: pulpFiction.id } },
      update: {},
      create: { userId: admin.id, movieId: pulpFiction.id, value: 9 },
    }),
  ]);

  console.log("✅ Рейтинги созданы");

  // Создаем отзывы
  await prisma.review.upsert({
    where: { userId_movieId: { userId: user.id, movieId: inception.id } },
    update: {},
    create: {
      userId: user.id,
      movieId: inception.id,
      content: "Потрясающий фильм! Нолан снова превзошёл себя. Многослойный сюжет, великолепная визуализация и отличная игра актёров. Смотрел несколько раз и каждый раз нахожу что-то новое.",
      isApproved: true,
    },
  });

  await prisma.review.upsert({
    where: { userId_movieId: { userId: user.id, movieId: interstellar.id } },
    update: {},
    create: {
      userId: user.id,
      movieId: interstellar.id,
      content: "Один из лучших научно-фантастических фильмов всех времён. Невероятная эмоциональная глубина, потрясающий саундтрек Ханса Циммера и впечатляющие визуальные эффекты.",
      isApproved: true,
    },
  });

  console.log("✅ Отзывы созданы");

  // Создаем статьи блога
  await prisma.article.upsert({
    where: { slug: "best-sci-fi-movies-2024" },
    update: {},
    create: {
      title: "Лучшие фантастические фильмы 2024 года",
      slug: "best-sci-fi-movies-2024",
      content: `
# Лучшие фантастические фильмы 2024 года

2024 год подарил нам множество захватывающих научно-фантастических картин. В этой статье мы рассмотрим самые выдающиеся из них.

## 1. Дюна: Часть вторая

Продолжение эпической саги Дени Вильнёва превзошло все ожидания. Тимоти Шаламе блестяще справился с ролью Пола Атрейдеса, а визуальные эффекты поражают воображение.

## 2. Звёздные войны: Новая надежда

Новая глава легендарной франшизы вернула поклонников в далёкую-далёкую галактику с новыми героями и приключениями.

## Заключение

Научная фантастика продолжает эволюционировать, предлагая зрителям всё более глубокие и визуально впечатляющие истории.
      `,
      excerpt: "Обзор лучших научно-фантастических фильмов, вышедших в 2024 году.",
      cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
      published: true,
      publishedAt: new Date("2024-11-15"),
      category: ArticleCategory.FEATURE,
    },
  });

  await prisma.article.upsert({
    where: { slug: "nolan-interview-2024" },
    update: {},
    create: {
      title: "Эксклюзивное интервью с Кристофером Ноланом",
      slug: "nolan-interview-2024",
      content: `
# Эксклюзивное интервью с Кристофером Ноланом

Мы поговорили с легендарным режиссёром о его творческом процессе и будущих проектах.

## О начале карьеры

«Я всегда знал, что хочу снимать фильмы. С детства я экспериментировал с камерой отца, создавая короткометражки с друзьями.»

## О работе с актёрами

«Для меня важно создать атмосферу доверия на съёмочной площадке. Когда актёры чувствуют себя комфортно, они способны на настоящее волшебство.»

## О будущих проектах

«Я всегда ищу истории, которые заставляют меня задуматься. Следующий проект будет о природе времени и памяти.»
      `,
      excerpt: "Легендарный режиссёр рассказывает о своём творческом пути и планах на будущее.",
      cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
      published: true,
      publishedAt: new Date("2024-10-20"),
      category: ArticleCategory.INTERVIEW,
    },
  });

  console.log("✅ Статьи созданы");

  // Добавляем в избранное и список просмотра
  await prisma.favorite.upsert({
    where: { userId_movieId: { userId: user.id, movieId: inception.id } },
    update: {},
    create: { userId: user.id, movieId: inception.id },
  });

  await prisma.watchlist.upsert({
    where: { userId_movieId: { userId: user.id, movieId: bladeRunner.id } },
    update: {},
    create: { userId: user.id, movieId: bladeRunner.id, type: WatchlistType.WANT_TO_WATCH },
  });

  await prisma.watchlist.upsert({
    where: { userId_movieId: { userId: user.id, movieId: inception.id } },
    update: {},
    create: { userId: user.id, movieId: inception.id, type: WatchlistType.WATCHED },
  });

  console.log("✅ Избранное и списки просмотра созданы");

  const collWeekly = await prisma.collection.upsert({
    where: { slug: "sci-fi-picks-week" },
    update: {},
    create: {
      title: "Фантастика недели (редакция)",
      slug: "sci-fi-picks-week",
      description: "Рекомендованная подборка редакции.",
      isPublic: true,
      isFeatured: true,
      order: 1,
      userId: null,
    },
  });

  const collAuthor = await prisma.collection.upsert({
    where: { slug: "admin-author-picks" },
    update: {},
    create: {
      title: "Авторский выбор администратора",
      slug: "admin-author-picks",
      description: "Личные рекомендации от редакции КиноТеки.",
      isPublic: true,
      isFeatured: false,
      order: 0,
      userId: admin.id,
    },
  });

  const collThematic = await prisma.collection.upsert({
    where: { slug: "nolan-worlds" },
    update: {},
    create: {
      title: "Миры Нолана",
      slug: "nolan-worlds",
      description: "Тематическая подборка фильмов Кристофера Нолана.",
      isPublic: true,
      isFeatured: false,
      order: 2,
      userId: null,
    },
  });

  const collectionMovieRows = [
    { collectionId: collWeekly.id, movieId: inception.id, order: 0 },
    { collectionId: collWeekly.id, movieId: interstellar.id, order: 1 },
    { collectionId: collAuthor.id, movieId: inception.id, order: 0 },
    { collectionId: collAuthor.id, movieId: darkKnight.id, order: 1 },
    { collectionId: collThematic.id, movieId: inception.id, order: 0 },
    { collectionId: collThematic.id, movieId: darkKnight.id, order: 1 },
    { collectionId: collThematic.id, movieId: interstellar.id, order: 2 },
  ];

  for (const row of collectionMovieRows) {
    await prisma.collectionMovie.upsert({
      where: {
        collectionId_movieId: {
          collectionId: row.collectionId,
          movieId: row.movieId,
        },
      },
      update: { order: row.order },
      create: row,
    });
  }

  console.log("✅ Подборки созданы");

  // Заполняем магазин кастомизации
  console.log("🛒 Создание предметов магазина...");
  const shopItems = [
    // Рамки
    { id: "shop-frame-simple", name: "Простая рамка", type: "PROFILE_FRAME", value: "frame-simple", price: 100, rarity: "COMMON" },
    { id: "shop-frame-circle", name: "Круглая рамка", type: "PROFILE_FRAME", value: "frame-circle", price: 150, rarity: "COMMON" },
    { id: "shop-frame-gradient", name: "Градиентная рамка", type: "PROFILE_FRAME", value: "frame-gradient", price: 300, rarity: "UNCOMMON" },
    { id: "shop-frame-neon", name: "Неоновая рамка", type: "PROFILE_FRAME", value: "frame-neon", price: 400, rarity: "UNCOMMON" },
    { id: "shop-frame-gold", name: "Золотая рамка", type: "PROFILE_FRAME", value: "frame-gold", price: 800, rarity: "RARE" },
    { id: "shop-frame-fire", name: "Огненная рамка", type: "PROFILE_FRAME", value: "frame-fire", price: 1500, rarity: "EPIC" },
    { id: "shop-frame-oscar", name: "Рамка Оскар", type: "PROFILE_FRAME", value: "frame-oscar", price: 5000, rarity: "LEGENDARY" },
    // Значки
    { id: "shop-badge-1", name: "🎬", type: "PROFILE_BADGE", value: "🎬", price: 50, rarity: "COMMON" },
    { id: "shop-badge-2", name: "⭐", type: "PROFILE_BADGE", value: "⭐", price: 200, rarity: "UNCOMMON" },
    { id: "shop-badge-3", name: "👑", type: "PROFILE_BADGE", value: "👑", price: 600, rarity: "RARE" },
    // Цвета
    { id: "shop-color-blue", name: "Синий", type: "NAME_COLOR", value: "#3b82f6", price: 100, rarity: "COMMON" },
    { id: "shop-color-gold", name: "Золотой", type: "NAME_COLOR", value: "#fbbf24", price: 600, rarity: "RARE" },
    { id: "shop-color-rainbow", name: "Радужный", type: "NAME_COLOR", value: "gradient-rainbow", price: 4000, rarity: "LEGENDARY" },
    // Темы
    { id: "shop-theme-light", name: "Светлая", type: "THEME", value: "theme-light", price: 200, rarity: "COMMON" },
    { id: "shop-theme-midnight", name: "Полуночный синий", type: "THEME", value: "theme-midnight", price: 400, rarity: "UNCOMMON" },
    { id: "shop-theme-cyberpunk", name: "Киберпанк", type: "THEME", value: "theme-cyberpunk", price: 1000, rarity: "RARE" },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { id: item.id },
      update: {},
      create: item as any,
    });
  }
  console.log(`✅ Создано ${shopItems.length} предметов магазина`);

  // Загружаем полный список товаров из seed-shop.ts
  console.log("🛒 Загрузка полного списка товаров магазина...");
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const seedShop = require("./seed-shop");
    const shopItemsData = seedShop.shopItems || [];
    
    for (const item of shopItemsData) {
      const itemId = `shop-${item.value}`;
      await prisma.shopItem.upsert({
        where: { id: itemId },
        update: {
          name: item.name,
          description: item.description || null,
          type: item.type,
          value: item.value,
          price: item.price,
          rarity: item.rarity,
          isActive: true,
        },
        create: {
          id: itemId,
          name: item.name,
          description: item.description || null,
          type: item.type,
          value: item.value,
          price: item.price,
          rarity: item.rarity,
          isActive: true,
        },
      });
    }
    console.log(`✅ Загружено ${shopItemsData.length} товаров из seed-shop.ts`);
  } catch (error) {
    console.warn("⚠️ Не удалось загрузить seed-shop.ts:", error);
  }

  console.log("🎉 База данных успешно заполнена!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

