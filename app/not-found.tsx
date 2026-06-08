import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle 800px at center, rgba(255, 184, 77, 0.04), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Decorative Floating Circles */}
      <div className="absolute top-1/4 left-1/10 w-64 h-64 bg-[#ffb84d]/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-red-600/3 rounded-full filter blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Cinematic Film Slate Icon / 404 Visual */}
        <div className="relative w-44 h-44 mx-auto mb-8 flex items-center justify-center">
          {/* Symmetrical Glowing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/5 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border border-dashed border-[#ffb84d]/20" />
          
          {/* Slashed Film Strip Symbol */}
          <div className="relative text-7xl font-bold font-oswald text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] flex flex-col justify-center">
            <span>404</span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.4em] text-[#ffb84d] bg-[#141414] px-2">
              void
            </span>
          </div>
        </div>

        <h1 className="font-oswald text-3xl font-bold text-white tracking-wide uppercase">
          {t("title")}
        </h1>
        
        <p className="font-mono text-sm text-white/45 mt-3 leading-relaxed max-w-sm mx-auto">
          {t("message")}
        </p>

        {/* Home Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#ffb84d] hover:bg-[#ffc56a] text-black font-mono text-[13px] font-bold rounded-2xl transition-all shadow-xl shadow-amber-500/10 hover:scale-[1.03]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
