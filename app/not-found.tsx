import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#0e0e0e] px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white mb-4">{t("title")}</h1>
        <p className="text-2xl text-slate-300 mb-8">{t("message")}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}

