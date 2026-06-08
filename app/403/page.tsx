import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ForbiddenPage() {
  const t = await getTranslations("errors.403");
  const tCommon = await getTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle 800px at center, rgba(239, 68, 68, 0.05), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Symmetrical glowing background circles */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-red-600/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-rose-700/3 rounded-full filter blur-3xl pointer-events-none animate-pulse" />

      {/* Laser horizontal/vertical scanner grid lines */}
      <div className="absolute inset-x-0 top-1/3 h-[1px] bg-red-500/10 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse" />
      <div className="absolute inset-x-0 bottom-1/3 h-[1px] bg-red-500/10 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Security Scanner Visual / 403 */}
        <div className="relative w-44 h-44 mx-auto mb-8 flex items-center justify-center">
          {/* Symmetrical Outer Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-red-500/5 animate-spin-slow" />
          <div className="absolute inset-3 rounded-full border border-dashed border-red-500/20" />

          {/* Shield Lock Icon */}
          <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.15)] animate-pulse">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.4em] text-red-400 bg-[#141414] px-3 border border-red-500/20 rounded-full py-0.5 animate-pulse">
            RESTRICTED
          </span>
        </div>

        {/* Title */}
        <h1 className="font-oswald text-3xl font-bold text-white tracking-wide uppercase">
          {t("title")}
        </h1>
        
        {/* Subtitle */}
        <h2 className="font-mono text-xs text-red-500 uppercase tracking-wider mt-1.5 animate-pulse">
          {t("subtitle")}
        </h2>

        {/* Message */}
        <p className="font-mono text-sm text-white/45 mt-4 leading-relaxed max-w-sm mx-auto">
          {t("message")}
        </p>

        {/* Home Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono text-[13px] font-bold rounded-2xl transition-all shadow-xl shadow-red-900/30 hover:scale-[1.03]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {tCommon("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
