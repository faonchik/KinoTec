"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";
import { FilmStripMark } from "@/components/layout/FilmStripMark";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

export function Header() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") || pathname === "/admin";
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [spacerHeight, setSpacerHeight] = useState(60);
  const headerRef = useRef<HTMLElement>(null);
  const headerBarRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuPanelRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuNavRef = useRef<HTMLElement>(null);
  const [menuOverlayTopPx, setMenuOverlayTopPx] = useState(56);
  const [userMenuPlacement, setUserMenuPlacement] = useState({ top: 64, right: 16 });
  const [userMenuMounted, setUserMenuMounted] = useState(false);

  useLayoutEffect(() => {
    setUserMenuMounted(true);
  }, []);
  const [mobileMenuTopPx, setMobileMenuTopPx] = useState(60);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/avatar`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
          }
          return res.json();
        })
        .then((data) => {
          setUserAvatar(data.avatar ?? null);
        })
        .catch(() => setUserAvatar(null));
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setUserAvatar(event.detail.avatar);
    };
    window.addEventListener("avatarUpdated", handleAvatarUpdate as EventListener);
    return () => window.removeEventListener("avatarUpdated", handleAvatarUpdate as EventListener);
  }, []);

  useLayoutEffect(() => {
    const bar = headerBarRef.current;
    if (!bar) return;
    const measureBar = () => {
      const bottom = bar.getBoundingClientRect().bottom;
      setMobileMenuTopPx(bottom);
      setMenuOverlayTopPx(bottom);
    };
    measureBar();
    const roBar = new ResizeObserver(measureBar);
    roBar.observe(bar);
    window.addEventListener("resize", measureBar);
    return () => {
      roBar.disconnect();
      window.removeEventListener("resize", measureBar);
    };
  }, [isMobileMenuOpen, isUserMenuOpen, status, session?.user?.id]);

  /** Позиция выпадающего меню профиля (портал в body — вне transform шапки) */
  useLayoutEffect(() => {
    if (!isUserMenuOpen) return;
    const update = () => {
      const btn = userMenuButtonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setUserMenuPlacement({
        top: rect.bottom + 12,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsUserMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      setSpacerHeight(h);
      document.documentElement.style.setProperty("--site-header-height", `${h}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobileMenuOpen, isUserMenuOpen, status, session?.user?.id]);

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("movies"), href: "/movies" },
    { name: t("series"), href: "/series" },
    { name: t("actors"), href: "/actors" },
    { name: t("directors"), href: "/directors" },
    { name: t("blog"), href: "/blog" },
    { name: t("watchParty"), href: "/party" },
    { name: t("roulette"), href: "/roulette" },
    { name: t("calendar"), href: "/calendar" },
    { name: t("profile"), href: "/profile" },
  ];

  const adminNavigation = [
    { name: "📊 Дашборд", href: "/admin" },
    { name: "🎬 Фильмы", href: "/admin/movies" },
    { name: "🎭 Актёры", href: "/admin/actors" },
    { name: "🎬 Режиссёры", href: "/admin/directors" },
    { name: "🏷️ Жанры", href: "/admin/genres" },
    { name: "👥 Пользователи", href: "/admin/users" },
    { name: "💬 Отзывы", href: "/admin/reviews" },
    { name: "📝 Статьи", href: "/admin/articles" },
    { name: "🌐 Импорт TMDB", href: "/admin/tmdb" },
    { name: "← На главную", href: "/" },
  ];

  const currentNav = isAdmin ? adminNavigation : navigation;

  const userMenuPanel =
    session && isUserMenuOpen ? (
      <div
        ref={userMenuPanelRef}
        role="menu"
        className="pointer-events-auto fixed z-[1020] w-60 overflow-hidden rounded-xl border border-white/[0.12] bg-[#1e1e1e] shadow-2xl shadow-black/60"
        style={{ top: userMenuPlacement.top, right: userMenuPlacement.right }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/[0.06] p-4">
          <p className="truncate text-sm font-medium text-white">{session.user.name}</p>
          <p className="truncate text-xs text-white/45">{session.user.email}</p>
        </div>
        <div className="py-1.5">
          <Link
            href="/profile"
            className="block px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            onClick={() => setIsUserMenuOpen(false)}
          >
            {t("profile")}
          </Link>
          <Link
            href="/profile/watchlist"
            className="block px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            onClick={() => setIsUserMenuOpen(false)}
          >
            {t("watchlist")}
          </Link>
          <Link
            href="/profile/favorites"
            className="block px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            onClick={() => setIsUserMenuOpen(false)}
          >
            {t("favorites")}
          </Link>
          <Link
            href="/profile/weekly-report"
            className="block px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            onClick={() => setIsUserMenuOpen(false)}
          >
            Еженедельный отчёт
          </Link>
          <Link
            href="/profile/export"
            className="block px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            onClick={() => setIsUserMenuOpen(false)}
          >
            Экспорт/Импорт
          </Link>
          {(session.user.role === "ADMIN" || session.user.role === "MODERATOR") && (
            <Link
              href="/admin"
              className="block px-4 py-2.5 text-sm font-medium text-[#e50914] transition hover:bg-white/[0.06]"
              onClick={() => setIsUserMenuOpen(false)}
            >
              {t("admin")}
            </Link>
          )}
        </div>
        <div className="border-t border-white/[0.06] py-1.5">
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full px-4 py-2.5 text-left text-sm text-rose-400/90 transition hover:bg-white/[0.06]"
          >
            {t("signOut")}
          </button>
        </div>
      </div>
    ) : null;

  const headerBar = (
    <header
      ref={headerRef}
      className={`site-header fixed left-0 right-0 top-0 z-[950] overflow-visible border-b border-white/[0.08] bg-[#141414] shadow-[0_1px_0_rgba(0,0,0,0.45)] ${
        isAdmin ? "md:left-[260px] left-0" : "sm:left-[76px] lg:left-[212px]"
      }`}
    >
      <div ref={headerBarRef} className="flex items-center gap-3 overflow-visible px-3 py-3 sm:px-5 lg:px-8">
        <div className="flex shrink-0 items-center gap-2 sm:hidden">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="relative z-[120] rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-white/80"
            aria-expanded={isMobileMenuOpen}
            aria-label="Меню"
          >
            {isMobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e50914] text-white shadow-md shadow-red-950/35"
            title={tCommon("siteName")}
          >
            <FilmStripMark className="h-[22px] w-[22px]" />
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 justify-center sm:pl-0">
          <HeaderSearch />
        </div>

        <div className="relative z-[2] flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          {session && <NotificationsButton />}

          {status === "loading" && !session ? (
            <div className="h-10 min-w-[2.5rem] shrink-0 animate-pulse rounded-full bg-white/10 sm:min-w-[7rem]" />
          ) : session ? (
            <div className="relative shrink-0">
              <button
                ref={userMenuButtonRef}
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="relative z-[120] flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#181818]/95 p-0.5 shadow-md transition hover:border-white/25 lg:py-1 lg:pl-1 lg:pr-3"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
              >
                {userAvatar ? (
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                    <Image src={userAvatar} alt="" fill className="object-cover" sizes="36px" />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/90 ring-1 ring-white/10">
                    {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="hidden max-w-[100px] truncate text-sm text-white/85 lg:inline">
                  {session.user.name ?? "—"}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="text-xs text-white/70 sm:text-sm">
                  {t("signIn")}
                </Button>
              </Link>
              <Link href="/auth/signup" className="hidden xs:block">
                <Button size="sm" className="text-xs sm:text-sm">
                  {t("signUp")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <>
      {!isAdmin && <div className="shrink-0" style={{ height: spacerHeight }} aria-hidden />}
      {userMenuMounted ? createPortal(headerBar, document.body) : headerBar}

      {isUserMenuOpen && userMenuMounted && session
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-x-0 bottom-0 z-[1010] bg-black/50"
                style={{ top: menuOverlayTopPx }}
                aria-label="Закрыть меню"
                onClick={() => setIsUserMenuOpen(false)}
              />
              {userMenuPanel}
            </>,
            document.body
          )
        : null}

      {isMobileMenuOpen && userMenuMounted
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-x-0 bottom-0 z-[1010] bg-black/65 backdrop-blur-sm sm:hidden"
                style={{ top: mobileMenuTopPx }}
                aria-label="Закрыть меню"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <nav
                ref={mobileMenuNavRef}
                className="pointer-events-auto fixed left-0 right-0 z-[1020] max-h-[min(75dvh,calc(100dvh-4rem))] overflow-y-auto border-b border-white/[0.12] bg-[#141414] px-3 py-3 shadow-2xl shadow-black/50 sm:hidden"
                style={{ top: mobileMenuTopPx }}
                aria-label="Навигация"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="mb-3">
                  <LanguageSwitcher currentLocale={locale} />
                </div>
                <div className="flex flex-col gap-0.5">
                  {currentNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/[0.08] hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </>,
            document.body
          )
        : null}
    </>
  );
}
