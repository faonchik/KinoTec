import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Pagination } from "@/components/ui/Pagination";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";

export const metadata: Metadata = {
  title: "Актёры",
  description: "Список актёров в базе КиноТеки",
};

interface ActorsPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

const ACTORS_PER_PAGE = 12;

async function getActors(page: number, query?: string) {
  const skip = (page - 1) * ACTORS_PER_PAGE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }

  const [actors, total] = await Promise.all([
    prisma.actor.findMany({
      where,
      skip,
      take: ACTORS_PER_PAGE,
      include: {
        _count: { select: { movies: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.actor.count({ where }),
  ]);

  return {
    actors,
    total,
    totalPages: Math.ceil(total / ACTORS_PER_PAGE),
  };
}

export default async function ActorsPage({ searchParams }: ActorsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const { actors, total, totalPages } = await getActors(page, params.q);

  return (
    <div className="min-h-screen bg-[#151C2C]">
      {/* Divider */}
      <div className="h-px bg-[#2A3550]" />

      {/* Content */}
      <div className="px-14 py-12">
        {/* Title Section */}
        <div className="mb-2">
          <h1 className="font-oswald text-4xl font-bold text-white">Актёры</h1>
          <p className="font-mono text-[13px] text-[#8B95A8] mt-2 max-w-2xl">
            Откройте для себя талантливых актёров. Загляните в их фильмографию и биографию.
          </p>
        </div>

        {/* Search */}
        <div className="mt-6 mb-8">
          <form action="/actors" method="GET" className="relative w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5A6478]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              name="q"
              type="text"
              defaultValue={params.q || ""}
              placeholder="Поиск актёров..."
              className="w-full h-12 bg-[#1A2236] rounded-2xl pl-12 pr-4 font-mono text-[13px] text-white placeholder-[#5A6478] border border-[#2A3550] outline-none focus:ring-1 focus:ring-[#FF8400]/50 transition-all"
            />
          </form>
        </div>

        {/* Info + Sort row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[13px] text-[#5A6478]">
              Всего: {total} актёров
            </span>
          </div>
          <button className="flex items-center gap-2 bg-[#FF8400] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-5 py-2.5 rounded-2xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Популярные
          </button>
        </div>

        {/* Actors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {actors.map((actor) => (
            <Link
              key={actor.id}
              href={`/actors/${actor.id}`}
              className="group"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#1A2236] mb-3">
                {actor.photo ? (() => {
                  const url = getProxiedImageUrl(actor.photo);
                  return shouldUseUnoptimized(url) ? (
                    <img src={url!} alt={actor.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <Image src={url!} alt={actor.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  );
                })() : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1E2740] to-[#2A3550] flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#3A4560]" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <h3 className="font-mono text-[14px] font-semibold text-white group-hover:text-[#FF8400] transition-colors">
                {actor.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[11px] text-[#5A6478]">
                  {actor._count.movies} {actor._count.movies === 1 ? "фильм" : "фильмов"}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl={`/actors${params.q ? `?q=${params.q}` : ""}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
