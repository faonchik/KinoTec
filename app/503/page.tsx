import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ServiceUnavailablePage() {
  const t = await getTranslations("errors.503");
  const tCommon = await getTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle 800px at center, rgba(168, 85, 247, 0.04), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Symmetrical glowing background circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/3 rounded-full filter blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Retro TV Static / 503 Visual */}
        <div className="relative w-52 h-44 mx-auto mb-8 flex flex-col items-center justify-center bg-black/60 rounded-3xl p-4 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden group">
          {/* TV Screen overlay (Scanlines) */}
          <div className="absolute inset-0 bg-scanlines pointer-events-none z-10 opacity-30" />

          {/* SMPTE Color Bars Graphic */}
          <div className="absolute inset-0 flex flex-col opacity-65">
            {/* Top row bars */}
            <div className="flex-1 flex">
              <div className="flex-1 bg-gray-300/40" />
              <div className="flex-1 bg-yellow-500/40" />
              <div className="flex-1 bg-cyan-500/40" />
              <div className="flex-1 bg-green-500/40" />
              <div className="flex-1 bg-magenta-500/40" />
              <div className="flex-1 bg-red-500/40" />
              <div className="flex-1 bg-blue-500/40" />
            </div>
            {/* Bottom row bars */}
            <div className="h-6 flex">
              <div className="flex-1 bg-blue-900/40" />
              <div className="flex-1 bg-white/40" />
              <div className="flex-1 bg-purple-900/40" />
              <div className="flex-1 bg-black" />
            </div>
          </div>

          {/* Glowing central indicator */}
          <div className="relative z-20 flex flex-col items-center justify-center bg-black/80 border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl">
            <span className="font-mono text-[10px] text-purple-400 uppercase tracking-[0.3em] animate-pulse">
              Please Stand By
            </span>
            <span className="font-oswald text-2xl font-bold text-white tracking-widest mt-1">
              503
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-oswald text-3xl font-bold text-white tracking-wide uppercase">
          {t("title")}
        </h1>
        
        {/* Subtitle */}
        <h2 className="font-mono text-xs text-purple-400 uppercase tracking-wider mt-1.5">
          {t("subtitle")}
        </h2>

        {/* Message */}
        <p className="font-mono text-sm text-white/45 mt-4 leading-relaxed max-w-sm mx-auto">
          {t("message")}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-sm mx-auto">
          <Link
            href="/503"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-[13px] font-bold rounded-2xl transition-all shadow-xl shadow-purple-900/30 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            🔄 Обновить
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
