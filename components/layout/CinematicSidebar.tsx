"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { SVGProps, ReactNode } from "react";
import { FilmStripMark } from "@/components/layout/FilmStripMark";

const SP_BG = "#141414";
const SP_SURFACE = "#181818";

function NavIcon({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={`flex h-5 w-5 shrink-0 items-center justify-center ${className ?? ""}`}>{children}</span>;
}

function HomeIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  );
}
function GridIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  );
}
function TvIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 19v2" strokeLinecap="round" />
    </svg>
  );
}
function UserIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}
function CalendarIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}
function UsersIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function ArticleIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
    </svg>
  );
}
function DirectorIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <circle cx="12" cy="8" r="3" />
      <path d="M4 20a8 8 0 0116 0" strokeLinecap="round" />
    </svg>
  );
}

function PartyIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function RouletteIc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <line x1="12" y1="2" x2="12" y2="5" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" />
      <line x1="2" y1="12" x2="5" y2="12" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="12" strokeLinecap="round" />
    </svg>
  );
}

export function CinematicSidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const items: { href: string; label: string; Icon: (p: SVGProps<SVGSVGElement>) => React.ReactElement }[] = [
    { href: "/", label: t("home"), Icon: HomeIc },
    { href: "/movies", label: t("movies"), Icon: GridIc },
    { href: "/series", label: t("series"), Icon: TvIc },
    { href: "/actors", label: t("actors"), Icon: UsersIc },
    { href: "/directors", label: t("directors"), Icon: DirectorIc },
    { href: "/blog", label: t("blog"), Icon: ArticleIc },
    { href: "/party", label: t("watchParty"), Icon: PartyIc },
    { href: "/roulette", label: t("roulette"), Icon: RouletteIc },
    { href: "/calendar", label: t("calendar"), Icon: CalendarIc },
    { href: "/profile", label: t("profile"), Icon: UserIc },
  ];

  const active = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className="sticky top-0 z-20 hidden h-dvh w-[76px] shrink-0 flex-col self-start border-r border-white/[0.06] px-2 py-6 sm:flex lg:w-[212px] lg:px-3"
      style={{
        background: `linear-gradient(180deg, ${SP_SURFACE} 0%, ${SP_BG} 100%)`,
        boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="mb-8 flex shrink-0 items-center justify-center lg:justify-start lg:gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e50914] text-white shadow-md shadow-red-950/35"
          title={tCommon("siteName")}
        >
          <FilmStripMark className="h-6 w-6" />
        </Link>
        <span className="hidden shrink-0 font-display text-lg font-semibold tracking-tight text-white lg:inline">
          {tCommon("siteName")}
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto scrollbar-hide">
        {items.map(({ href, label, Icon }) => {
          const on = active(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center justify-center lg:justify-start gap-3 rounded-xl px-2 py-2.5 transition lg:px-3 ${
                on ? "bg-white/[0.12] text-white" : "text-white/72 hover:bg-white/[0.08] hover:text-white"
              }`}
              title={label}
            >
              <NavIcon>
                <Icon className={`h-5 w-5 ${on ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
              </NavIcon>
              <span className="hidden text-sm font-medium lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 hidden rounded-xl border border-white/[0.06] bg-black/20 p-2.5 text-[10px] leading-relaxed text-white/35 lg:block">
        <Link href="/streaming-preview" className="text-white/50 hover:text-white hover:underline">
          UI-превью
        </Link>
      </div>
    </aside>
  );
}
