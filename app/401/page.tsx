import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function UnauthorizedPage() {
  const t = await getTranslations("errors.401");
  const tCommon = await getTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle 800px at center, rgba(255, 184, 77, 0.05), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Symmetrical glowing background circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/3 rounded-full filter blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Ticket Scanner Visual / 401 */}
        <div className="relative w-44 h-44 mx-auto mb-8 flex items-center justify-center">
          {/* Symmetrical Outer Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-white/5 animate-spin-slow" />
          <div className="absolute inset-3 rounded-full border border-dashed border-[#ffb84d]/20" />

          {/* Ticket Icon / Ticket Booth concept */}
          <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-[#ffb84d]/20 flex items-center justify-center text-[#ffb84d] shadow-[0_0_40px_rgba(255,184,77,0.1)]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h12c.621 0 1.125.504 1.125 1.125V17m-13.125-3.375a1.5 1.5 0 000-3.000V7.125c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v3.375a1.5 1.5 0 000 3.000V17c0 .621-.504 1.125-1.125 1.125h-12.75a1.125 1.125 0 01-1.125-1.125v-3.375zm1.5-3.375a1.5 1.5 0 001.5-1.5V6m0 12v-1.5a1.5 1.5 0 00-1.5-1.5" />
            </svg>
          </div>
          
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.4em] text-white bg-[#141414] px-3 border border-white/5 rounded-full py-0.5">
            401
          </span>
        </div>

        {/* Title */}
        <h1 className="font-oswald text-3xl font-bold text-white tracking-wide uppercase">
          {t("title")}
        </h1>
        
        {/* Subtitle */}
        <h2 className="font-mono text-xs text-[#ffb84d] uppercase tracking-wider mt-1.5">
          {t("subtitle")}
        </h2>

        {/* Message */}
        <p className="font-mono text-sm text-white/45 mt-4 leading-relaxed max-w-sm mx-auto">
          {t("message")}
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-sm mx-auto">
          <Link
            href="/auth/signin"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ffb84d] hover:bg-[#ffc56a] text-black font-mono text-[13px] font-bold rounded-2xl transition-all shadow-xl shadow-amber-500/10 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            {t("signIn")}
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/10 hover:bg-white/[0.04] text-white/80 font-mono text-[13px] rounded-2xl transition-all hover:scale-[1.02]"
          >
            {tCommon("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
