"use client";

import Link from "next/link";
import { ProxiedImage } from "@/components/ui/ProxiedImage";

export type WatchStripItem = { id: string; title: string; poster: string | null };

type WatchAvailableFilmsStripProps = {
  title: string;
  items: WatchStripItem[];
  currentMovieId: string;
};

/**
 * Горизонтальный список фильмов с тем же типом доступа к просмотру — переключение без поиска по сайту.
 */
export function WatchAvailableFilmsStrip({ title, items, currentMovieId }: WatchAvailableFilmsStripProps) {
  if (!items.length) return null;

  return (
    <section className="border-t border-white/10 bg-[#0a0f18]" aria-label={title}>
      <div className="px-3 pt-3 pb-2 md:px-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">{title}</h2>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-3 pt-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]">
          {items.map((m) => {
            const active = m.id === currentMovieId;
            return (
              <Link
                key={m.id}
                href={`/watch/${m.id}`}
                prefetch={false}
                className={`group relative w-[104px] flex-shrink-0 overflow-hidden rounded-lg bg-slate-800/80 outline-none ring-offset-2 ring-offset-[#0a0f18] transition hover:ring-2 hover:ring-amber-500/60 focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  active ? "ring-2 ring-amber-500" : ""
                }`}
              >
                <div className="relative aspect-[2/3] w-full bg-slate-900">
                  {m.poster ? (
                    <ProxiedImage
                      src={m.poster}
                      alt={m.title}
                      fill
                      className="object-cover transition group-hover:opacity-90"
                      sizes="104px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl text-white/25">▶</div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5 pt-6">
                    <p className="line-clamp-2 text-[11px] font-medium leading-tight text-white">{m.title}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
