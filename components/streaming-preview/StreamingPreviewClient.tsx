"use client";

import type { SVGProps } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ProxiedImage } from "@/components/ui/ProxiedImage";
import { FilmStripMark } from "@/components/layout/FilmStripMark";
import { previewMoviePageHref } from "@/lib/streaming-preview/previewLinks";
import { CinematicMainExperience } from "./CinematicMainExperience";
import type { StreamingPreviewMovie, StreamingPreviewPayload } from "./types";

const SP_BG = "#0b0f14";
const SP_SURFACE = "#121821";
const SP_ACCENT = "#ffb84d";

function useDebouncedValue<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const nav = [
  { label: "Главная", href: "/", icon: HomeIcon },
  { label: "Каталог", href: "/movies", icon: GridIcon },
  { label: "Сериалы", href: "/series", icon: SeriesIcon },
  { label: "Профиль", href: "/profile", icon: UserIcon },
];

export function StreamingPreviewClient({ data }: { data: StreamingPreviewPayload }) {
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 320);
  const [results, setResults] = useState<StreamingPreviewMovie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const id = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      setResults([]);
      return;
    }
    const q = debounced.trim();
    if (q.length < 2) {
      setResults([]);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    fetch(`/api/movies/search?q=${encodeURIComponent(q)}&limit=16`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const list = (json.movies ?? []) as Array<{
          id: string;
          title: string;
          originalTitle: string | null;
          description: string | null;
          poster: string | null;
          backdrop: string | null;
          trailer: string | null;
          videoUrl: string | null;
          runtime: number | null;
          releaseDate: string | null;
          popularity: number;
          genres?: { genre: { name: string; slug: string } }[];
          ratings?: { value: number }[];
        }>;
        const mapped: StreamingPreviewMovie[] = list.map((m) => {
          const ratings = m.ratings ?? [];
          const avgRating = ratings.length
            ? ratings.reduce((a, r) => a + r.value, 0) / ratings.length
            : 0;
          const genres = m.genres ?? [];
          return {
            id: m.id,
            title: m.title,
            originalTitle: m.originalTitle,
            description: m.description,
            poster: m.poster,
            backdrop: m.backdrop,
            trailer: m.trailer,
            videoUrl: m.videoUrl,
            runtime: m.runtime,
            releaseDate: m.releaseDate,
            popularity: m.popularity ?? 0,
            genreNames: genres.map((g) => g.genre.name),
            genreSlugs: genres.map((g) => g.genre.slug),
            avgRating,
            demoProgress: 0,
          };
        });
        setResults(mapped);
      })
      .catch(() => setResults([]))
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, searchOpen]);

  return (
    <div
      className="min-h-screen overflow-x-hidden selection:bg-[#ffb84d]/30 selection:text-white"
      style={{
        backgroundColor: SP_BG,
        ["--sp-accent" as string]: SP_ACCENT,
        ["--sp-surface" as string]: SP_SURFACE,
      }}
    >
      <div className="relative z-10 flex min-h-screen">
        <aside
          className="sticky top-0 flex h-screen w-[76px] shrink-0 flex-col border-r border-white/[0.06] px-2 py-6 backdrop-blur-2xl lg:w-[220px] lg:px-4"
          style={{
            background: `linear-gradient(180deg, ${SP_SURFACE}f2 0%, ${SP_BG}cc 100%)`,
            boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="mb-10 flex items-center justify-center lg:justify-start lg:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e50914] text-white shadow-lg shadow-red-900/35">
              <FilmStripMark className="h-6 w-6" />
            </div>
            <span className="hidden font-[family-name:var(--font-sp-display)] text-lg font-semibold tracking-tight lg:inline">
              KinoTec
            </span>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-2 py-3 text-white/55 transition hover:bg-white/[0.06] hover:text-white lg:px-3"
              >
                <item.icon className="h-5 w-5 shrink-0 opacity-70 group-hover:opacity-100" />
                <span className="hidden text-sm font-medium lg:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto hidden rounded-xl border border-white/[0.06] bg-black/20 p-3 text-[11px] leading-relaxed text-white/40 lg:block">
            Превью интерфейса. Основной сайт —{" "}
            <Link href="/" className="text-[#ffb84d]/90 underline-offset-2 hover:underline">
              главная
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_minmax(0,560px)_minmax(0,1fr)] items-center gap-3 border-b border-white/[0.06] px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="min-w-0" aria-hidden />
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSearchOpen(true)}
              className="flex w-full max-w-[560px] justify-self-center items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#121821]/80 py-2.5 pl-4 pr-4 text-left text-sm text-white/40 shadow-inner shadow-black/40 transition hover:border-[#ffb84d]/25 hover:text-white/60"
            >
              <SearchIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">Поиск фильмов, актёров, режиссёров…</span>
            </motion.button>
            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSearchOpen(true)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-white/80 lg:hidden"
                aria-label="Поиск"
              >
                <SearchIcon className="h-5 w-5" />
              </motion.button>
              <Link
                href="/profile/watchlist"
                className="hidden rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-[#ffb84d]/30 hover:text-white sm:inline-block"
              >
                Watchlist
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#121821]/90 py-1.5 pl-1.5 pr-3 shadow-lg shadow-black/30"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white/15 to-white/5 text-xs font-semibold text-white/90">
                  {(session?.user?.name ?? session?.user?.email ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <span className="hidden max-w-[120px] truncate text-sm text-white/85 lg:inline">
                  {session?.user?.name ?? "Гость"}
                </span>
              </Link>
            </div>
          </header>

          <main>
            <CinematicMainExperience data={data} />
          </main>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Закрыть"
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="fixed left-1/2 top-[8vh] z-[90] w-[min(92vw,640px)] -translate-x-1/2 overflow-hidden rounded-3xl border border-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
              style={{ background: `linear-gradient(165deg, ${SP_SURFACE}fa 0%, ${SP_BG}f5 100%)` }}
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                <SearchIcon className="h-5 w-5 text-white/35" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Начните вводить название…"
                  className="min-w-0 flex-1 bg-transparent py-2 text-base text-white outline-none placeholder:text-white/35"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-lg p-2 text-white/45 hover:bg-white/[0.06] hover:text-white"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[min(60vh,480px)] overflow-y-auto p-3">
                {query.trim().length < 2 && (
                  <p className="px-2 py-8 text-center text-sm text-white/40">
                    Введите минимум 2 символа — результаты появятся здесь.
                  </p>
                )}
                {query.trim().length >= 2 && searchLoading && (
                  <p className="py-10 text-center text-sm text-white/45">Поиск…</p>
                )}
                {query.trim().length >= 2 && !searchLoading && results.length === 0 && (
                  <p className="py-10 text-center text-sm text-white/45">Ничего не найдено.</p>
                )}
                <ul className="space-y-1">
                  {results.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={previewMoviePageHref(m.id)}
                        onClick={() => setSearchOpen(false)}
                        className="flex gap-3 rounded-2xl p-2 transition hover:bg-white/[0.06]"
                      >
                        <div className="relative h-[72px] w-[52px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#1a2435] to-[#0d1219] ring-1 ring-white/10">
                          {m.poster || m.backdrop ? (
                            <ProxiedImage
                              src={m.poster || m.backdrop}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="60px"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg opacity-40" aria-hidden>
                              🎬
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 py-0.5">
                          <p className="truncate font-medium text-white">{m.title}</p>
                          <p className="truncate text-xs text-white/45">
                            {[m.releaseDate && new Date(m.releaseDate).getFullYear(), m.genreNames[0]]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  );
}
function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  );
}
function SeriesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 19v2" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}
function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}
function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
