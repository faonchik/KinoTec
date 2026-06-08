"use client";

import type { CSSProperties, SVGProps } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { previewMoviePageHref, previewWatchPageHref } from "@/lib/streaming-preview/previewLinks";
import { useCallback, useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { ProxiedImage } from "@/components/ui/ProxiedImage";
import type { StreamingPreviewMovie, StreamingPreviewPayload } from "./types";

const SP_BG = "#141414";
const SP_SURFACE = "#121821";
const SP_ACCENT = "#ffb84d";

function isDirectVideo(url: string | null | undefined) {
  if (!url) return false;
  const u = url.trim().toLowerCase();
  return u.endsWith(".mp4") || u.endsWith(".webm") || u.includes(".mp4?") || u.includes(".webm?");
}

function similarFromPool(pool: StreamingPreviewMovie[], movie: StreamingPreviewMovie, n = 14) {
  const slugs = new Set(movie.genreSlugs);
  const scored = pool
    .filter((m) => m.id !== movie.id)
    .map((m) => ({
      m,
      score: m.genreSlugs.filter((g) => slugs.has(g)).length + m.popularity * 0.001,
    }))
    .sort((a, b) => b.score - a.score);
  const out: StreamingPreviewMovie[] = [];
  const seen = new Set<string>();
  for (const { m } of scored) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
    if (out.length >= n) break;
  }
  return out;
}

type Props = {
  data: StreamingPreviewPayload;
  /** Встроено в основной layout с боковой панелью сайта — сдвиг нижнего мини-плеера. */
  embedded?: boolean;
};

export function CinematicMainExperience({ data, embedded = false }: Props) {
  const [detail, setDetail] = useState<StreamingPreviewMovie | null>(null);
  const [miniPlayer, setMiniPlayer] = useState<StreamingPreviewMovie | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hero = data.hero;
  const heroVideo = hero && isDirectVideo(hero.videoUrl) ? hero.videoUrl : hero && isDirectVideo(hero.trailer) ? hero.trailer : null;
  const pageRgb = embedded ? "20 20 20" : "11 15 20";
  const pageHex = embedded ? "#141414" : "#141414";

  const similar = useMemo(
    () => (detail ? similarFromPool(data.pool, detail) : []),
    [detail, data.pool]
  );

  const toggleWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const miniPlayerLeft = embedded ? "lg:left-[212px]" : "lg:left-[220px]";

  return (
    <div
      className="relative selection:bg-[#ffb84d]/30 selection:text-white"
      style={
        {
          backgroundColor: embedded ? "transparent" : SP_BG,
          ["--sp-accent" as string]: SP_ACCENT,
          ["--sp-surface" as string]: SP_SURFACE,
          ["--hero-glow-x" as string]: "50%",
          ["--hero-glow-y" as string]: "38%",
        } as CSSProperties & Record<string, string>
      }
      onMouseMove={(e) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height, left, top } = currentTarget.getBoundingClientRect();
        currentTarget.style.setProperty("--hero-glow-x", `${((clientX - left) / width) * 100}%`);
        currentTarget.style.setProperty("--hero-glow-y", `${((clientY - top) / height) * 100}%`);
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-90"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${SP_ACCENT}22, transparent 50%)`,
        }}
      />

      <div className={`relative overflow-x-hidden ${embedded ? "z-0" : "z-10"}`}>
        <section
          className={`relative overflow-hidden ${
            embedded ? "min-h-[max(520px,72svh)]" : "min-h-[max(680px,92svh)]"
          }`}
        >
          {heroVideo ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              poster={hero?.backdrop ?? hero?.poster ?? undefined}
            />
          ) : hero?.backdrop || hero?.poster ? (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 14, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: "reverse" }}
            >
              <HeroBackdrop
                backdrop={hero.backdrop}
                poster={hero.poster}
                className="absolute inset-0"
                overlayClassName="hidden"
                priority
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#121821] to-black" aria-hidden />
          )}

          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background: `radial-gradient(1200px circle at var(--hero-glow-x, 50%) var(--hero-glow-y, 38%), rgba(255,184,77,0.2), transparent 52%), linear-gradient(to top, rgb(${pageRgb}) 0%, transparent 38%), linear-gradient(90deg, rgb(${pageRgb} / 0.94) 0%, transparent 44%)`,
            }}
            aria-hidden
          />
          <div
            className={`absolute inset-0 z-[2] bg-gradient-to-t to-transparent ${embedded ? "from-[#141414] via-[#141414]/65" : "from-[#141414] via-[#141414]/65"}`}
            aria-hidden
          />
          <div
            className="absolute inset-0 z-[3] opacity-70"
            style={{
              background: `radial-gradient(ellipse at center, transparent 0%, ${pageHex} 78%)`,
            }}
            aria-hidden
          />

          {hero && (
            <div className="relative z-10 flex min-h-[max(680px,92svh)] flex-col justify-end px-4 pb-16 pt-32 sm:px-8 lg:px-14 lg:pb-24">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-3xl"
              >
                <p className="mb-3 font-[family-name:var(--font-sp-display)] text-xs font-semibold uppercase tracking-[0.35em] text-[#ffb84d]/90">
                  Оригинал · премьера сезона
                </p>
                <h1 className="font-[family-name:var(--font-sp-display)] text-4xl font-semibold leading-[0.95] tracking-tight text-white shadow-black/50 text-balance sm:text-5xl lg:text-7xl">
                  {hero.title}
                </h1>
                {hero.originalTitle && hero.originalTitle !== hero.title && (
                  <p className="mt-2 text-lg text-white/50">{hero.originalTitle}</p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/55">
                  {hero.releaseDate && <span>{new Date(hero.releaseDate).getFullYear()}</span>}
                  {hero.runtime && (
                    <>
                      <span className="text-white/25">·</span>
                      <span>{hero.runtime} мин</span>
                    </>
                  )}
                  {hero.genreNames.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-white/70"
                    >
                      {g}
                    </span>
                  ))}
                  {hero.avgRating > 0 && (
                    <span className="rounded-md bg-[#ffb84d]/15 px-2 py-0.5 text-xs font-medium text-[#ffb84d]">
                      ★ {hero.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="mt-6 line-clamp-3 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
                  {hero.description ?? "Погрузитесь в историю, где каждый кадр — кино."}
                </p>
                <div className="mt-8 flex flex-col gap-5">
                  <div className="flex items-center gap-1.5 sm:gap-4 w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-nowrap">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setMiniPlayer(hero);
                        setDetail(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-[#ffb84d] sm:px-8 px-4 sm:py-3.5 py-2 text-xs sm:text-sm font-semibold text-[#141414] shadow-[0_12px_40px_rgba(255,184,77,0.35)] ring-1 ring-black/10 transition hover:bg-[#ffc56a] hover:shadow-[0_14px_44px_rgba(255,184,77,0.42)] shrink-0"
                    >
                      <PlaySolidIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      Смотреть
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDetail(hero)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/[0.08] sm:px-7 px-3.5 sm:py-3.5 py-2 text-xs sm:text-sm font-medium text-white backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.12] shrink-0"
                    >
                      <InfoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                      Детали
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => toggleWatchlist(hero.id)}
                      className={`inline-flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full border transition shrink-0 ${
                        watchlist.has(hero.id)
                          ? "border-[#ffb84d]/50 bg-[#ffb84d]/15 text-[#ffb84d]"
                          : "border-white/15 bg-black/25 text-white/70 hover:text-white"
                      }`}
                      aria-label="В список"
                    >
                      <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5" filled={watchlist.has(hero.id)} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(hero.id)}
                      className={`inline-flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full border transition shrink-0 ${
                        favorites.has(hero.id)
                          ? "border-rose-400/50 bg-rose-500/15 text-rose-300"
                          : "border-white/15 bg-black/25 text-white/70 hover:text-white"
                      }`}
                      aria-label="Избранное"
                    >
                      <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" filled={favorites.has(hero.id)} />
                    </button>
                  </div>
                  {hero.demoProgress > 0 && (
                    <div className="max-w-md border-t border-white/[0.08] pt-4">
                      <div className="mb-1.5 flex justify-between text-xs text-white/50">
                        <span>Прогресс просмотра</span>
                        <span>{hero.demoProgress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#ffb84d] to-amber-200"
                          initial={{ width: 0 }}
                          animate={{ width: `${hero.demoProgress}%` }}
                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </section>

        {/* Мягкий переход героя к ленте (без «среза» по цвету) */}
        <div
          className={`pointer-events-none relative ${
            embedded ? "z-0 -mt-8 h-20 sm:-mt-10 sm:h-24" : "z-[11] -mt-28 h-36 sm:-mt-32 sm:h-40"
          }`}
          aria-hidden
          style={{
            background: `linear-gradient(to bottom, rgb(${pageRgb} / 0) 0%, rgb(${pageRgb} / 0.5) 42%, rgb(${pageRgb}) 100%)`,
          }}
        />

        <div
          className={`relative space-y-14 px-4 pb-14 sm:px-6 sm:pb-16 lg:space-y-16 lg:px-10 lg:pb-20 ${
            embedded ? "z-0 pt-4 sm:pt-6 lg:pt-8" : "z-10 pt-6 sm:pt-8 lg:pt-10"
          }`}
        >
          {data.rows.map((row, ri) => (
            <section key={row.key} className="max-w-[1920px]">
              <div className="mb-5 flex items-end justify-between gap-4 px-0.5">
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="font-[family-name:var(--font-sp-display)] text-2xl font-semibold tracking-tight text-white lg:text-3xl"
                  >
                    {row.title}
                  </motion.h2>
                  {row.subtitle && <p className="mt-1 text-sm text-white/45">{row.subtitle}</p>}
                </div>
                <Link
                  href="/movies"
                  className="shrink-0 text-xs font-medium uppercase tracking-wider text-[#ffb84d]/90 hover:text-[#ffb84d]"
                >
                  Все →
                </Link>
              </div>
              <CarouselRow
                movies={row.movies}
                watchlist={watchlist}
                favorites={favorites}
                onToggleWl={toggleWatchlist}
                onToggleFav={toggleFavorite}
                onOpenDetail={setDetail}
                rowIndex={ri}
              />
            </section>
          ))}
        </div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {detail && (
            <>
              <motion.div
                className="fixed inset-0 z-[1040] bg-black/55 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDetail(null)}
              />
              <motion.aside
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0, right: 0.8 }}
                onDragEnd={(event, info) => {
                  // Если свайпнули вправо более чем на 100px или с высокой скоростью
                  if (info.offset.x > 100 || info.velocity.x > 500) {
                    setDetail(null);
                  }
                }}
                className="fixed right-0 top-0 z-[1050] flex h-full w-full max-w-lg flex-col border-l border-white/[0.08] shadow-2xl touch-pan-y"
                style={{
                  background: `linear-gradient(200deg, ${SP_SURFACE} 0%, ${SP_BG} 100%)`,
                }}
                initial={{ x: "105%" }}
                animate={{ x: 0 }}
                exit={{ x: "105%" }}
                transition={{ type: "spring", stiffness: 320, damping: 36 }}
              >
                <div className="relative h-56 w-full shrink-0 sm:h-64">
                  {detail.backdrop || detail.poster ? (
                    <ProxiedImage
                      src={detail.backdrop || detail.poster}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="512px"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2435] to-[#0d1219] text-5xl opacity-40"
                      aria-hidden
                    >
                      🎬
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121821] to-transparent" />
                  <button
                    type="button"
                    onClick={() => setDetail(null)}
                    className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md z-30 hover:bg-black/60 transition-colors"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-10 pt-2">
                  <h2 className="font-[family-name:var(--font-sp-display)] text-2xl font-semibold leading-tight">
                    {detail.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/50">
                    {detail.genreNames.map((g) => (
                      <span key={g} className="rounded-md bg-white/[0.06] px-2 py-1">
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-white/65">
                    {detail.description ?? "Описание появится позже."}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={previewWatchPageHref(detail.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ffb84d] px-6 py-2.5 text-sm font-semibold text-black"
                    >
                      <PlaySolidIcon className="h-4 w-4" />
                      Воспроизвести
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleWatchlist(detail.id)}
                      className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80"
                    >
                      {watchlist.has(detail.id) ? "В watchlist" : "+ Watchlist"}
                    </button>
                  </div>
                  <h3 className="mt-10 font-[family-name:var(--font-sp-display)] text-lg font-semibold text-white/90">
                    Похожее
                  </h3>
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {similar.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDetail(m)}
                        className="group relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-white/10"
                      >
                        <ProxiedImage
                          src={m.poster || m.backdrop}
                          alt=""
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="120px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                        <p className="absolute bottom-1 left-1 right-1 truncate text-center text-[10px] font-medium text-white">
                          {m.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence>
        {miniPlayer && (
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-[60] border-t border-white/[0.08] px-3 py-3 backdrop-blur-2xl sm:px-6 ${miniPlayerLeft}`}
            style={{
              background: `linear-gradient(0deg, ${SP_BG}f8 0%, ${SP_SURFACE}dd 100%)`,
              boxShadow: "0 -12px 48px rgba(0,0,0,0.5)",
            }}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="mx-auto flex max-w-5xl items-center gap-4">
              <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#1a2435] to-[#0d1219] ring-1 ring-white/15 sm:h-16 sm:w-28">
                {miniPlayer.poster || miniPlayer.backdrop ? (
                  <ProxiedImage
                    src={miniPlayer.poster || miniPlayer.backdrop}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg opacity-40" aria-hidden>
                    🎬
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black">
                    <PlaySolidIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{miniPlayer.title}</p>
                <p className="truncate text-xs text-white/45">Демо-плеер · превью интерфейса</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ffb84d] to-amber-100"
                    style={{ width: `${miniPlayer.demoProgress || 12}%` }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={previewWatchPageHref(miniPlayer.id)}
                  className="hidden rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/85 sm:inline-block"
                >
                  На весь экран
                </Link>
                <button
                  type="button"
                  onClick={() => setMiniPlayer(null)}
                  className="rounded-full p-2 text-white/50 hover:bg-white/[0.08] hover:text-white"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CarouselRow({
  movies,
  watchlist,
  favorites,
  onToggleWl,
  onToggleFav,
  onOpenDetail,
  rowIndex,
}: {
  movies: StreamingPreviewMovie[];
  watchlist: Set<string>;
  favorites: Set<string>;
  onToggleWl: (id: string) => void;
  onToggleFav: (id: string) => void;
  onOpenDetail: (m: StreamingPreviewMovie) => void;
  rowIndex: number;
}) {
  const [hasHover, setHasHover] = useState(false);
  useEffect(() => {
    setHasHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const cardFrame =
    "relative h-[234px] w-[156px] overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.12] sm:h-[276px] sm:w-[184px] lg:h-[300px] lg:w-[200px]";

  /** Края ряда: градиент к `rgb/0`, не к ключевому слову `transparent` — иначе в sRGB появляется жёлтая кайма. */
  const rowEdgeFadeLeft = "linear-gradient(to right, rgb(20 20 20) 0%, rgb(20 20 20 / 0) 100%)";
  const rowEdgeFadeRight = "linear-gradient(to left, rgb(20 20 20) 0%, rgb(20 20 20 / 0) 100%)";

  return (
    <div className="group/row relative">
      <div
        className="pointer-events-none absolute left-0 top-0 z-20 hidden h-full w-14 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 lg:block"
        style={{ background: rowEdgeFadeLeft }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-20 hidden h-full w-14 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 lg:block"
        style={{ background: rowEdgeFadeRight }}
        aria-hidden
      />
      <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-4 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {movies.map((m, i) => (
          <motion.article
            key={m.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: 0.04 * i + rowIndex * 0.05,
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="group/card shrink-0 snap-start"
          >
            <div className="relative">
              <motion.div
                whileHover={hasHover ? { y: -8 } : undefined}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="relative"
              >
                <Link href={previewMoviePageHref(m.id)} className="block">
                  <div className={cardFrame}>
                    <StreamingCarouselPoster
                      movie={m}
                      sizes="(max-width:640px) 200px, 220px"
                      imageClassName="group-hover/card:scale-[1.04]"
                      priority={rowIndex === 0 && i < 4}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                    {m.demoProgress > 0 && (
                      <div className="absolute bottom-0 left-2 right-2 h-1 overflow-hidden rounded-full bg-black/50">
                        <div
                          className="h-full rounded-full bg-[#ffb84d] shadow-[0_0_12px_rgba(255,184,77,0.5)]"
                          style={{ width: `${m.demoProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="absolute right-2 top-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:transition sm:group-hover/card:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleFav(m.id);
                    }}
                    className={`rounded-lg p-1.5 backdrop-blur-md ${
                      favorites.has(m.id) ? "bg-rose-500/30 text-rose-100" : "bg-black/45 text-white"
                    }`}
                  >
                    <HeartIcon className="h-4 w-4" filled={favorites.has(m.id)} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleWl(m.id);
                    }}
                    className={`rounded-lg p-1.5 backdrop-blur-md ${
                      watchlist.has(m.id) ? "bg-[#ffb84d]/25 text-[#ffb84d]" : "bg-black/45 text-white"
                    }`}
                  >
                    <BookmarkIcon className="h-4 w-4" filled={watchlist.has(m.id)} />
                  </button>
                </div>
              </motion.div>
              <div className="mt-3 flex w-[156px] items-start justify-between gap-2 px-0.5 sm:w-[184px] lg:w-[200px]">
                <div className="min-w-0 flex-1">
                  <Link
                    href={previewMoviePageHref(m.id)}
                    className="line-clamp-2 text-sm font-semibold leading-snug text-white/95 hover:text-[#ffb84d]"
                  >
                    {m.title}
                  </Link>
                  {m.avgRating > 0 && <p className="mt-1 text-xs text-white/40">★ {m.avgRating.toFixed(1)}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenDetail(m)}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/[0.05] p-1.5 text-white/60 hover:border-[#ffb84d]/30 hover:text-[#ffb84d]"
                  aria-label="Инфо"
                >
                  <InfoIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function StreamingCarouselPoster({
  movie,
  sizes,
  priority,
  imageClassName,
}: {
  movie: StreamingPreviewMovie;
  sizes: string;
  priority?: boolean;
  imageClassName?: string;
}) {
  const [broken, setBroken] = useState(false);
  const src = movie.poster || movie.backdrop;
  const showImg = Boolean(src && !broken);

  if (!showImg) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1a2435] to-[#0d1219] p-3 text-center">
        <span className="text-3xl opacity-40" aria-hidden>
          🎬
        </span>
        <span className="line-clamp-3 text-[10px] font-medium leading-snug text-white/50">{movie.title}</span>
      </div>
    );
  }

  return (
    <ProxiedImage
      src={src}
      alt={movie.title}
      fill
      className={`object-cover object-center transition duration-700 ease-out ${imageClassName ?? ""}`}
      sizes={sizes}
      priority={priority}
      onError={() => setBroken(true)}
    />
  );
}

function PlaySolidIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}
function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}
function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );
}
function HeartIcon({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? "0" : "1.5"} {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
function BookmarkIcon({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M6 4h12v16l-6-4-6 4V4z" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

