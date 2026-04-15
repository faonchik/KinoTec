import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("collections");
  return {
    title: t("title"),
    description: t("description"),
  };
}

async function getCollections() {
  const collections = await prisma.collection.findMany({
    where: { isPublic: true },
    include: {
      movies: {
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              poster: true,
            },
          },
        },
        orderBy: { order: "asc" },
        take: 4,
      },
      _count: { select: { movies: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }],
  });

  return collections;
}

export default async function CollectionsPage() {
  const collections = await getCollections();
  const t = await getTranslations("collections");

  return (
    <div className="min-h-screen bg-[#151C2C]">
      {/* Title Section */}
      <div className="px-12 pt-10 pb-2">
        <h1 className="font-oswald text-4xl font-bold text-white">Подборки фильмов</h1>
        <p className="font-mono text-[13px] text-[#8B95A8] mt-2">{t("description")}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 px-12 py-4">
        <button className="font-mono text-[13px] font-semibold text-white bg-[#FF8400] px-4 py-2 rounded-2xl">
          Все
        </button>
        <button className="font-mono text-[13px] text-[#8B95A8] hover:text-white bg-[#2A3550] px-4 py-2 rounded-2xl transition-colors">
          Авторские
        </button>
        <button className="font-mono text-[13px] text-[#8B95A8] hover:text-white bg-[#2A3550] px-4 py-2 rounded-2xl transition-colors">
          Подборки недели
        </button>
        <button className="font-mono text-[13px] text-[#8B95A8] hover:text-white bg-[#2A3550] px-4 py-2 rounded-2xl transition-colors">
          Тематические
        </button>
      </div>

      {/* Collections Grid */}
      <div className="px-12 py-6">
        {collections.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <p className="font-mono text-[13px] text-[#5A6478]">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group"
              >
                <article className="bg-[#1A2236] rounded-2xl overflow-hidden hover:ring-1 hover:ring-[#FF8400]/30 transition-all hover:shadow-lg hover:shadow-[#FF8400]/5">
                  {/* Cover Preview */}
                  <div className="relative h-48 bg-[#0D1420]">
                    {collection.cover ? (
                      <Image
                        src={collection.cover}
                        alt={collection.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : collection.movies.length > 0 ? (
                      <div className="grid grid-cols-4 h-full">
                        {collection.movies.slice(0, 4).map((cm, idx) => (
                          <div key={cm.movie.id} className="relative h-full">
                            {cm.movie.poster ? (
                              <Image
                                src={cm.movie.poster}
                                alt={cm.movie.title}
                                fill
                                className={`object-cover transition-transform duration-500 ${
                                  idx === 0 ? "group-hover:scale-110" : ""
                                }`}
                                sizes="120px"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#1E2740] flex items-center justify-center text-2xl">
                                🎬
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#1E2740] to-[#2A3550]">
                        📚
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2236] to-transparent" />
                    
                    {/* Featured badge */}
                    {collection.isFeatured && (
                      <div className="absolute top-3 left-3 bg-[#FF8400] text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        ⭐ {t("recommended")}
                      </div>
                    )}
                    
                    {/* Count */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg font-mono text-[11px] text-white">
                      {collection._count.movies} {t("movies")}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="font-oswald text-lg font-bold text-white group-hover:text-[#FF8400] transition-colors mb-2">
                      {collection.title}
                    </h2>
                    
                    {collection.description && (
                      <p className="font-mono text-[12px] text-[#5A6478] line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {collections.length >= 9 && (
          <div className="flex justify-center mt-10">
            <button className="flex items-center gap-2 bg-[#2A3550] hover:bg-[#3A4560] text-white font-mono text-[13px] font-semibold px-8 py-3 rounded-2xl transition-colors">
              Загрузить ещё ↓
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0D1420] mt-10 px-12 py-12">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-[#FF8400]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="font-oswald text-xl font-bold text-[#FF8400]">КиноТека</span>
            </div>
            <p className="font-mono text-[12px] text-[#5A6478] max-w-xs">
              Ваш путеводитель в мире кино. Находите фильмы, читайте отзывы, следите за новинками.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="font-oswald text-sm font-bold text-white mb-3">Каталог</h4>
              <div className="space-y-2">
                <Link href="/movies" className="block font-mono text-[12px] text-[#5A6478] hover:text-white transition-colors">Фильмы</Link>
                <Link href="/series" className="block font-mono text-[12px] text-[#5A6478] hover:text-white transition-colors">Сериалы</Link>
                <Link href="/collections" className="block font-mono text-[12px] text-[#5A6478] hover:text-white transition-colors">Подборки</Link>
                <Link href="/actors" className="block font-mono text-[12px] text-[#5A6478] hover:text-white transition-colors">Актёры</Link>
              </div>
            </div>
            <div>
              <h4 className="font-oswald text-sm font-bold text-white mb-3">Возможности</h4>
              <div className="space-y-2">
                <Link href="/party" className="block font-mono text-[12px] text-[#5A6478] hover:text-white transition-colors">Смотреть вместе</Link>
                <Link href="/calendar" className="block font-mono text-[12px] text-[#5A6478] hover:text-white transition-colors">Премьеры</Link>
                <Link href="/recommend" className="block font-mono text-[12px] text-[#5A6478] hover:text-white transition-colors">Рекомендации</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-[#2A3550] mb-6" />
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] text-[#5A6478]">© 2024 КиноТека. Все права защищены.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="font-mono text-[11px] text-[#5A6478] hover:text-white transition-colors">Политика конфиденциальности</Link>
            <Link href="/terms" className="font-mono text-[11px] text-[#5A6478] hover:text-white transition-colors">Условия использования</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
