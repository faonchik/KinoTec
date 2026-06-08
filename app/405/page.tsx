import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function MethodNotAllowedPage() {
  const t = await getTranslations("errors.405");
  const tCommon = await getTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle 800px at center, rgba(245, 158, 11, 0.05), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Symmetrical glowing background circles */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-yellow-700/3 rounded-full filter blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Tangled reel / Projector error / 405 */}
        <div className="relative w-44 h-44 mx-auto mb-8 flex items-center justify-center">
          {/* Symmetrical Outer Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-white/5 animate-spin-slow" />
          <div className="absolute inset-3 rounded-full border border-dashed border-amber-500/20" />

          {/* Ban/Method Not Allowed Icon */}
          <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.12)]">
            <svg className="w-12 h-12 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.4em] text-[#ffb84d] bg-[#141414] px-3 border border-white/5 rounded-full py-0.5">
            CODE 405
          </span>
        </div>

        {/* Title */}
        <h1 className="font-oswald text-3xl font-bold text-white tracking-wide uppercase">
          {t("title")}
        </h1>
        
        {/* Subtitle */}
        <h2 className="font-mono text-xs text-amber-500 uppercase tracking-wider mt-1.5">
          {t("subtitle")}
        </h2>

        {/* Message */}
        <p className="font-mono text-sm text-white/45 mt-4 leading-relaxed max-w-sm mx-auto">
          {t("message")}
        </p>

        {/* Back Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-[13px] font-bold rounded-2xl transition-all shadow-xl shadow-amber-500/10 hover:scale-[1.03]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            {tCommon("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
