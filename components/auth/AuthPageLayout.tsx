"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Locale } from "@/i18n/config";

/** Поля ввода в стиле портала */
export const authInputClass =
  "w-full rounded-xl border border-white/[0.12] bg-[#0b0f14]/90 px-5 py-3.5 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-white/35 outline-none transition focus:border-[#ffb84d]/55 focus:ring-2 focus:ring-[#ffb84d]/18 disabled:cursor-not-allowed disabled:opacity-50";

export const authLabelTextClass =
  "font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-white/45";

export const authLabelClass = `mb-2.5 block ${authLabelTextClass}`;

export const authPrimaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffb84d] px-5 py-4 font-mono text-sm font-semibold text-[#0b0f14] transition hover:bg-[#ffc56a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb84d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121821] disabled:pointer-events-none disabled:opacity-45";

export const authGhostButtonClass =
  "inline-flex w-full items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.04] px-5 py-4 font-mono text-sm font-medium text-white/85 transition hover:border-[#ffb84d]/35 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb84d]/30";

export const authLinkClass =
  "inline font-mono text-sm font-semibold text-[#ffb84d] transition-colors hover:text-[#ffc56a]";

export const authAlertErrorClass =
  "rounded-xl border border-red-500/25 bg-red-500/[0.08] p-5 text-center font-mono text-[13px] text-red-300";

export const authAlertSuccessClass =
  "rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-5 text-center font-mono text-[13px] text-emerald-200";

type AuthPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Ссылка «На главную» внутри карточки над заголовком */
  showHomeLink?: boolean;
  /** Переключатель языка (шапки на экране auth нет) */
  showLanguageSwitcher?: boolean;
};

export function AuthPageLayout({
  title,
  subtitle,
  children,
  footer,
  showHomeLink = true,
  showLanguageSwitcher = true,
}: AuthPageLayoutProps) {
  const locale = useLocale() as Locale;
  const tAuth = useTranslations("auth.common");
  const tCommon = useTranslations("common");

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[#0b0f14]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_110%_70%_at_50%_-25%,rgba(255,184,77,0.14),transparent_52%),radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(18,24,33,0.85),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.4)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[repeating-linear-gradient(90deg,transparent,transparent_31px,rgba(255,255,255,0.5)_31px,rgba(255,255,255,0.5)_32px)]"
        aria-hidden
      />

      {showLanguageSwitcher ? (
        <div className="pointer-events-auto absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
          <div className="rounded-xl border border-white/[0.1] bg-[#121821]/90 p-1 shadow-lg backdrop-blur-sm">
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col sm:max-w-2xl">
        <div className="rounded-2xl border border-white/[0.08] bg-[#121821]/95 p-8 shadow-[0_0_0_1px_rgba(255,184,77,0.05),0_28px_56px_-16px_rgba(0,0,0,0.65)] backdrop-blur-md sm:p-10 md:px-12 md:py-11">
          <header className="mb-9 text-center sm:mb-10">
            {showHomeLink ? (
              <p className="mb-6 font-mono text-[12px] text-white/40 sm:mb-7">
                <Link href="/" className="text-white/40 underline-offset-4 transition-colors hover:text-[#ffb84d] hover:underline">
                  {tAuth("backToHome")}
                </Link>
              </p>
            ) : null}
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#ffb84d]/75">{tCommon("siteName")}</p>
            <h1 className="mt-2 font-oswald text-3xl font-bold tracking-tight text-white sm:text-[2.125rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mx-auto mt-3 max-w-md font-mono text-[13px] leading-relaxed text-white/40 sm:text-[14px] sm:leading-relaxed">
                {subtitle}
              </p>
            ) : null}
          </header>

          {children}

          {footer ? (
            <div className="mt-10 border-t border-white/[0.06] pt-8">
              <div className="w-full text-center font-mono text-[13px] leading-relaxed text-white/40">
                {footer}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
