"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ProxiedImage } from "@/components/ui/ProxiedImage";

type SearchHit = {
  id: string;
  type: "movie" | "actor" | "director";
  title: string;
  subtitle?: string;
  image?: string;
  rating?: number;
};

function resultHref(r: SearchHit) {
  if (r.type === "movie") return `/movies/${r.id}`;
  if (r.type === "actor") return `/actors/${r.id}`;
  return `/directors/${r.id}`;
}

function useDebouncedValue<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function HeaderSearch() {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 320);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const rafId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) {
      setResults([]);
      return;
    }
    const q = debounced.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("type", "all");
    fetch(`/api/search?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setResults((json.results ?? []) as SearchHit[]);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  const advancedHref = query.trim()
    ? `/search?q=${encodeURIComponent(query.trim())}`
    : "/search";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-xl items-center gap-3 rounded-sm border border-white/[0.12] bg-black/40 py-2.5 pl-4 pr-4 text-left text-sm text-white/50 shadow-inner transition hover:border-white/25 hover:text-white/80"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" strokeLinecap="round" />
        </svg>
        <span className="truncate">
          {t("search")}…
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label={t("close")}
              className="fixed inset-0 z-[1001] bg-black/75 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="header-search-title"
              className="fixed left-1/2 top-[max(5rem,10vh)] z-[1002] w-[min(94vw,560px)] overflow-hidden rounded-xl border border-white/[0.1] bg-[#181818] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
              initial={{ opacity: 0, y: -12, scale: 0.98, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: -8, scale: 0.99, x: "-50%" }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              <h2 id="header-search-title" className="sr-only">
                {t("search")}
              </h2>
              <div className="flex items-center gap-2 border-b border-white/[0.08] px-3 py-2.5 sm:px-4">
                <svg className="h-4 w-4 shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`${t("search")}…`}
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/35 sm:text-base"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label={t("close")}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="max-h-[min(55vh,420px)] overflow-y-auto p-2 sm:p-3">
                {query.trim().length < 2 && (
                  <p className="px-2 py-8 text-center text-sm text-white/40">{t("searchMinHint")}</p>
                )}
                {query.trim().length >= 2 && loading && (
                  <p className="py-10 text-center text-sm text-white/45">{t("searching")}</p>
                )}
                {query.trim().length >= 2 && !loading && results.length === 0 && (
                  <p className="py-10 text-center text-sm text-white/45">{t("searchNoResults")}</p>
                )}
                <ul className="space-y-1">
                  {results.map((r) => (
                    <li key={`${r.type}-${r.id}`}>
                      <Link
                        href={resultHref(r)}
                        onClick={close}
                        className="flex gap-3 rounded-lg p-2 transition hover:bg-white/[0.06]"
                      >
                        <div className="relative h-[72px] w-[52px] shrink-0 overflow-hidden rounded-md bg-white/[0.06] ring-1 ring-white/10">
                          {r.image ? (
                            <ProxiedImage src={r.image} alt={r.title} fill className="object-cover" sizes="52px" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg opacity-40" aria-hidden>
                              {r.type === "movie" ? "🎬" : "👤"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 py-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/55">
                              {r.type === "movie" ? t("typeMovie") : r.type === "actor" ? t("typeActor") : t("typeDirector")}
                            </span>
                            {typeof r.rating === "number" && r.rating > 0 && (
                              <span className="text-xs text-[#ffb84d]">★ {r.rating.toFixed(1)}</span>
                            )}
                          </div>
                          <p className="truncate font-medium text-white">{r.title}</p>
                          {r.subtitle && <p className="truncate text-xs text-white/45">{r.subtitle}</p>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/[0.08] px-3 py-2.5 sm:px-4">
                <Link
                  href={advancedHref}
                  onClick={close}
                  className="block text-center text-xs font-semibold uppercase tracking-wider text-[#ffb84d]/90 transition hover:text-[#ffb84d]"
                >
                  {t("searchAdvanced")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
