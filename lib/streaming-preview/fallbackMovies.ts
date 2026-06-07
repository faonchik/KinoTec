import type {
  StreamingPreviewMovie,
  StreamingPreviewPayload,
} from "@/components/streaming-preview/types";

export function isDemoMovieId(id: string) {
  return id.startsWith("_sp-demo-");
}

/**
 * Когда в БД нет фильмов или нет постеров — показываем киношное превью с публичными кадрами TMDB.
 */
export const STREAMING_PREVIEW_FALLBACK: StreamingPreviewMovie[] = [
  {
    id: "_sp-demo-1",
    title: "Blade Runner 2049",
    originalTitle: "Blade Runner 2049",
    description:
      "Тридцать лет после событий первого фильма молодой агент Кей раскрывает секрет, который может погрузить остатки общества в хаос.",
    poster: "https://image.tmdb.org/t/p/w500/gajY2tTN9PIF47QsdGYZa52v8XA.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/sAtoMlVC2JaCfPXBYxboSVeMLHF.jpg",
    trailer: null,
    videoUrl: null,
    runtime: 164,
    releaseDate: "2017-10-04T00:00:00.000Z",
    popularity: 99,
    genreNames: ["Фантастика", "Триллер"],
    genreSlugs: ["fantastika", "thriller"],
    avgRating: 4.8,
    demoProgress: 62,
  },
  {
    id: "_sp-demo-2",
    title: "Dune: Part Two",
    originalTitle: "Dune: Part Two",
    description:
      "Пол Атрейдес объединяется с Чанни и фрименами, чтобы вести войну против заговорщиков, уничтоживших его семью.",
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo84BRpg7ZWf6qwqhgNebHWV5.jpg",
    trailer: null,
    videoUrl: null,
    runtime: 166,
    releaseDate: "2024-02-27T00:00:00.000Z",
    popularity: 98,
    genreNames: ["Фантастика", "Приключения"],
    genreSlugs: ["fantastika", "priklyucheniya"],
    avgRating: 4.7,
    demoProgress: 0,
  },
  {
    id: "_sp-demo-3",
    title: "Oppenheimer",
    originalTitle: "Oppenheimer",
    description: "История американского учёного Роберта Оппенгеймера и его роли в разработке атомной бомбы.",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0N.jpg",
    trailer: null,
    videoUrl: null,
    runtime: 180,
    releaseDate: "2023-07-19T00:00:00.000Z",
    popularity: 97,
    genreNames: ["Драма", "История"],
    genreSlugs: ["drama", "history"],
    avgRating: 4.6,
    demoProgress: 88,
  },
  {
    id: "_sp-demo-4",
    title: "The Batman",
    originalTitle: "The Batman",
    description: "Бэтмен исследует коррупцию в Готэме и сталкивается с Загадочником.",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7RHQpOJQjS0qOusrycN1.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0f5FwzKOY7CQBPR.jpg",
    trailer: null,
    videoUrl: null,
    runtime: 176,
    releaseDate: "2022-03-01T00:00:00.000Z",
    popularity: 95,
    genreNames: ["Криминал", "Драма"],
    genreSlugs: ["crime", "drama"],
    avgRating: 4.5,
    demoProgress: 34,
  },
  {
    id: "_sp-demo-5",
    title: "Everything Everywhere All at Once",
    originalTitle: "Everything Everywhere All at Once",
    description: "Эвелин Ван путешествует по параллельным вселенным, чтобы спасти мир.",
    poster: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fIrt9MpAqeyogE2FwPoa1l0Tbjv.jpg",
    trailer: null,
    videoUrl: null,
    runtime: 139,
    releaseDate: "2022-03-24T00:00:00.000Z",
    popularity: 94,
    genreNames: ["Комедия", "Фантастика"],
    genreSlugs: ["comedy", "fantastika"],
    avgRating: 4.6,
    demoProgress: 0,
  },
  {
    id: "_sp-demo-6",
    title: "Parasite",
    originalTitle: "기생충",
    description: "Семья Ки-тэк пробирается в дом богатых Паков.",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/TUphAIUIaLkKKVetI81WmJbdal.jpg",
    trailer: null,
    videoUrl: null,
    runtime: 132,
    releaseDate: "2019-05-30T00:00:00.000Z",
    popularity: 93,
    genreNames: ["Триллер", "Драма"],
    genreSlugs: ["thriller", "drama"],
    avgRating: 4.7,
    demoProgress: 100,
  },
  {
    id: "_sp-demo-7",
    title: "Mad Max: Fury Road",
    originalTitle: "Mad Max: Fury Road",
    description: "Макс и Фуриоса сбегают от тирана Несмертного Джо.",
    poster: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNh8bs43K8.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/tbhdX8tzhTUCNpd82JRLhgHaQql.jpg",
    trailer: null,
    videoUrl: null,
    runtime: 120,
    releaseDate: "2015-05-13T00:00:00.000Z",
    popularity: 92,
    genreNames: ["Боевик", "Фантастика"],
    genreSlugs: ["action", "fantastika"],
    avgRating: 4.5,
    demoProgress: 15,
  },
  {
    id: "_sp-demo-8",
    title: "Interstellar",
    originalTitle: "Interstellar",
    description: "Исследователи отправляются через червоточину в поисках нового дома для человечества.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/pbrkL804c8yAvENzFKJ7dAhX0UU.jpg",
    trailer: null,
    videoUrl: null,
    runtime: 169,
    releaseDate: "2014-11-05T00:00:00.000Z",
    popularity: 96,
    genreNames: ["Фантастика", "Драма"],
    genreSlugs: ["fantastika", "drama"],
    avgRating: 4.6,
    demoProgress: 45,
  },
];

/** Дополняет ряд фильмами из демо, пока не наберётся минимум кадров с постером/фоном. */
export function padRowWithDemoMovies(
  movies: StreamingPreviewMovie[],
  minWithVisual = 5
): StreamingPreviewMovie[] {
  const has = (m: StreamingPreviewMovie) => Boolean(m.poster || m.backdrop);
  const out = [...movies];
  const extras = [...STREAMING_PREVIEW_FALLBACK];
  while (out.filter(has).length < minWithVisual && extras.length > 0) {
    const n = extras.shift()!;
    if (!out.some((x) => x.id === n.id)) out.push(n);
  }
  return out;
}

function takeUnique<T extends { id: string }>(items: T[], n: number): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of items) {
    if (seen.has(x.id)) continue;
    seen.add(x.id);
    out.push(x);
    if (out.length >= n) break;
  }
  return out;
}

/** Hero + ряды; если в БД мало постеров — подмешиваем TMDB-демо. */
export function buildPayloadFromPool(pool: StreamingPreviewMovie[]): StreamingPreviewPayload {
  const hasVisual = (m: StreamingPreviewMovie) => Boolean(m.poster || m.backdrop);
  const visualDb = pool.filter(hasVisual);
  const needsDemoBlend = visualDb.length < 8;
  const visualBlend = needsDemoBlend
    ? takeUnique([...visualDb, ...STREAMING_PREVIEW_FALLBACK], 48)
    : visualDb;

  const byBackdrop = [...visualBlend].sort(
    (a, b) => Number(Boolean(b.backdrop)) - Number(Boolean(a.backdrop))
  );
  const hero = byBackdrop[0] ?? STREAMING_PREVIEW_FALLBACK[0] ?? null;

  const spotlight = takeUnique(visualBlend, 22);
  const premieres = takeUnique(
    [...(needsDemoBlend ? visualBlend : pool)]
      .filter(hasVisual)
      .sort(
        (a, b) => new Date(b.releaseDate ?? 0).getTime() - new Date(a.releaseDate ?? 0).getTime()
      ),
    18
  );
  const curated = takeUnique(
    visualBlend.filter((m) => !spotlight.slice(0, 8).some((s) => s.id === m.id)),
    18
  );
  const hallOfFame = takeUnique([...visualBlend].sort((a, b) => b.avgRating - a.avgRating), 16);

  const rows = [
    { key: "spotlight", title: "Spotlight", subtitle: "Сейчас в эфире", movies: spotlight },
    { key: "premieres", title: "Премьеры", subtitle: "Недавно добавлено", movies: premieres },
    { key: "curated", title: "Подборка редакции", movies: curated },
    { key: "rated", title: "Высокая оценка зрителей", movies: hallOfFame },
  ].filter((r) => r.movies.length > 0);

  const mergedPool = takeUnique([...pool, ...STREAMING_PREVIEW_FALLBACK], 200);
  return {
    hero,
    rows,
    pool: mergedPool.length ? mergedPool : STREAMING_PREVIEW_FALLBACK,
  };
}
