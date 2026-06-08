import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function HttpVersionNotSupportedPage() {
  const t = await getTranslations("errors.505");
  const tCommon = await getTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#100f0d] px-4 relative overflow-hidden select-none">
      {/* Sepia radial background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          background: "radial-gradient(circle 800px at center, rgba(139, 92, 26, 0.06), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Symmetrical glowing background circles */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-amber-950/20 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-900/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />

      {/* Retro film scratches overlay */}
      <div className="absolute inset-0 bg-retro-scratches pointer-events-none opacity-[0.03] mix-blend-overlay" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Vintage Silent Film Camera Visual / 505 */}
        <div className="relative w-44 h-44 mx-auto mb-8 flex items-center justify-center">
          {/* Symmetrical Outer Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-900/10 animate-spin-slow" />
          <div className="absolute inset-3 rounded-full border border-dashed border-amber-800/20" />

          {/* Vintage Camera Icon */}
          <div className="w-24 h-24 rounded-3xl bg-amber-950/30 border border-amber-800/35 flex items-center justify-center text-[#c29b68] shadow-[0_0_40px_rgba(139,92,26,0.15)]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125zM12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
            </svg>
          </div>

          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.4em] text-[#c29b68] bg-[#100f0d] px-3 border border-amber-800/20 rounded-full py-0.5">
            EST. 1920
          </span>
        </div>

        {/* Title */}
        <h1 className="font-oswald text-3xl font-bold text-[#e8d2b4] tracking-wide uppercase">
          {t("title")}
        </h1>

        {/* Subtitle */}
        <h2 className="font-mono text-xs text-[#c29b68] uppercase tracking-wider mt-1.5">
          {t("subtitle")}
        </h2>

        {/* Message */}
        <p className="font-mono text-sm text-[#e8d2b4]/45 mt-4 leading-relaxed max-w-sm mx-auto">
          {t("message")}
        </p>

        {/* Action Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#c29b68] hover:bg-[#d4b080] text-black font-mono text-[13px] font-bold rounded-2xl transition-all shadow-xl shadow-amber-950/20 hover:scale-[1.03]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h12.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {tCommon("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
