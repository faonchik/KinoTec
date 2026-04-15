import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AIChatButton } from "@/components/ai/AIChatButton";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  const locale = await getLocale();
  
  return {
    title: {
      default: `${t("siteName")} — ${locale === "en" ? "Your guide to the world of cinema" : "Ваш путеводитель в мире кино"}`,
      template: `%s | ${t("siteName")}`,
    },
    description: locale === "en" 
      ? "Movie information website. Find movies, read reviews, follow the latest in the film industry."
      : "Информационный сайт о кино и фильмах. Находите фильмы, читайте отзывы, следите за новинками киноиндустрии.",
    keywords: locale === "en"
      ? ["movies", "films", "reviews", "ratings", "actors", "directors"]
      : ["кино", "фильмы", "отзывы", "рейтинги", "актеры", "режиссеры"],
    authors: [{ name: t("siteName") }],
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "ru_RU",
      siteName: t("siteName"),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0f172a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="theme-dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <AIChatButton />
            <ScrollToTop />
            <KeyboardShortcuts />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
