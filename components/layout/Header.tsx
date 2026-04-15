"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";
import type { Locale } from "@/i18n/config";

export function Header() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;

  // Загружаем аватар отдельно, чтобы не перегружать cookies
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/avatar`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
          }
          return res.json();
        })
        .then((data) => {
          if (data.avatar) {
            setUserAvatar(data.avatar);
          } else {
            setUserAvatar(null);
          }
        })
        .catch(() => {
          // Игнорируем ошибки
        });
    }
  }, [session?.user?.id]);

  // Слушаем события обновления аватара
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setUserAvatar(event.detail.avatar);
    };

    window.addEventListener("avatarUpdated", handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdate as EventListener);
    };
  }, []);

  const navigation = [
    { name: t("movies"), href: "/movies" },
    { name: t("series"), href: "/series" },
    { name: "Актёры", href: "/actors" },
    { name: t("collections"), href: "/collections" },
    { name: t("watchParty"), href: "/party" },
    { name: t("calendar"), href: "/calendar" },
  ];

  return (
    <header className="sticky top-0 z-40" style={{ backgroundColor: '#111827' }}>
      <div className="flex items-center justify-between h-16 px-8">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-8 h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#FF8400]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <span className="font-oswald text-xl font-bold text-[#FF8400]">
              {tCommon("siteName")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-mono text-[13px] text-[#8B95A8] hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          <ThemeSwitcher />
          <div className="hidden sm:block">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          <Link
            href="/search"
            className="text-[#8B95A8] hover:text-white transition-colors"
            aria-label={tCommon("search")}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {session && <NotificationsButton />}

          {status === "loading" ? (
            <div className="w-8 h-8 bg-[#2A3550] rounded-full animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center rounded-full hover:opacity-80 transition-opacity"
              >
                {userAvatar ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={userAvatar}
                      alt={session.user.name || ""}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-[#2A3550] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#8B95A8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[#1A2236] rounded-xl shadow-xl border border-[#2A3550] overflow-hidden z-20">
                    <div className="p-4 border-b border-[#2A3550]">
                      <p className="font-medium text-white truncate font-mono text-sm">{session.user.name}</p>
                      <p className="text-[13px] text-[#8B95A8] truncate font-mono">{session.user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 font-mono text-[13px] text-[#8B95A8] hover:text-white hover:bg-[#2A3550] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t("profile")}
                      </Link>
                      <Link
                        href="/profile/watchlist"
                        className="flex items-center gap-3 px-4 py-2 font-mono text-[13px] text-[#8B95A8] hover:text-white hover:bg-[#2A3550] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {t("watchlist")}
                      </Link>
                      <Link
                        href="/profile/favorites"
                        className="flex items-center gap-3 px-4 py-2 font-mono text-[13px] text-[#8B95A8] hover:text-white hover:bg-[#2A3550] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {t("favorites")}
                      </Link>
                      <Link
                        href="/profile/collections"
                        className="flex items-center gap-3 px-4 py-2 font-mono text-[13px] text-[#8B95A8] hover:text-white hover:bg-[#2A3550] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Мои подборки
                      </Link>
                      <Link
                        href="/profile/weekly-report"
                        className="flex items-center gap-3 px-4 py-2 font-mono text-[13px] text-[#8B95A8] hover:text-white hover:bg-[#2A3550] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Еженедельный отчёт
                      </Link>
                      <Link
                        href="/profile/export"
                        className="flex items-center gap-3 px-4 py-2 font-mono text-[13px] text-[#8B95A8] hover:text-white hover:bg-[#2A3550] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Экспорт/Импорт
                      </Link>
                      <Link
                        href="/challenges"
                        className="flex items-center gap-3 px-4 py-2 font-mono text-[13px] text-[#8B95A8] hover:text-white hover:bg-[#2A3550] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        {t("challenges")}
                      </Link>
                      {(session.user.role === "ADMIN" || session.user.role === "MODERATOR") && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2 font-mono text-[13px] text-[#FF8400] hover:text-[#FF9F2E] hover:bg-[#2A3550] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {t("admin")}
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[#2A3550] py-2">
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 w-full px-4 py-2 font-mono text-[13px] text-red-400 hover:text-red-300 hover:bg-[#2A3550] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t("signOut")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="font-mono text-[13px]">
                  {t("signIn")}
                </Button>
              </Link>
              <Link href="/auth/signup" className="hidden sm:block">
                <Button size="sm" className="font-mono text-[13px]">
                  {t("signUp")}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#8B95A8] hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden py-4 px-8 border-t border-[#2A3550]" style={{ backgroundColor: '#111827' }}>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 font-mono text-[13px] text-[#8B95A8] hover:text-white hover:bg-[#1A2236] rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
