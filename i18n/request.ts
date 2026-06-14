import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

export default getRequestConfig(async () => {
  // Получаем язык из cookie или заголовка Accept-Language
  const cookieStore = await cookies();
  const headerStore = await headers();
  
  let locale: Locale = defaultLocale;
  
  // Сначала проверяем cookie (next-intl использует NEXT_LOCALE, но мы также поддерживаем старый формат)
  const nextLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const oldLocale = cookieStore.get("locale")?.value;
  const cookieLocale = (nextLocale || oldLocale) as Locale;
  
  if (cookieLocale && locales.includes(cookieLocale)) {
    locale = cookieLocale;
  } else {
    // Если нет cookie, проверяем Accept-Language
    const acceptLanguage = headerStore.get("accept-language");
    if (acceptLanguage) {
      const browserLocale = acceptLanguage.split(",")[0].split("-")[0] as Locale;
      if (locales.includes(browserLocale)) {
        locale = browserLocale;
      }
    }
  }

  let messages;
  if (locale === "ru") {
    messages = (await import("./messages/ru_clean.json")).default;
  } else {
    messages = (await import("./messages/en.json")).default;
  }

  return {
    locale,
    messages,
  };
});

