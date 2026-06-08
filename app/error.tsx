"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Логируем ошибку для отслеживания
    console.error("Application runtime error:", error);
  }, [error]);

  const errorMessage = error?.message || "";
  const errorName = error?.name || "";
  const isDatabaseError =
    errorMessage.includes("PrismaClientInitializationError") ||
    errorMessage.includes("database") ||
    errorMessage.includes("PostgreSQL") ||
    errorMessage.includes("railwaypostgresql") ||
    errorMessage.includes("ECONNREFUSED") ||
    errorMessage.includes("P1001") ||
    errorMessage.includes("P1002") ||
    errorMessage.includes("P1003") ||
    errorName.includes("PrismaClientInitializationError");

  if (isDatabaseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 relative overflow-hidden select-none">
        {/* Background radial glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(circle 800px at center, rgba(168, 85, 247, 0.05), transparent 70%)",
          }}
          aria-hidden
        />

        {/* Symmetrical glowing background circles */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/3 rounded-full filter blur-3xl pointer-events-none animate-pulse" />

        <div className="max-w-xl w-full text-center relative z-10">
          {/* Retro TV Static / 503 Visual */}
          <div className="relative w-52 h-44 mx-auto mb-8 flex flex-col items-center justify-center bg-black/60 rounded-3xl p-4 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden group">
            {/* TV Screen overlay (Scanlines) */}
            <div className="absolute inset-0 bg-scanlines pointer-events-none z-10 opacity-30" />

            {/* SMPTE Color Bars Graphic */}
            <div className="absolute inset-0 flex flex-col opacity-65">
              <div className="flex-1 flex">
                <div className="flex-1 bg-gray-300/40" />
                <div className="flex-1 bg-yellow-500/40" />
                <div className="flex-1 bg-cyan-500/40" />
                <div className="flex-1 bg-green-500/40" />
                <div className="flex-1 bg-magenta-500/40" />
                <div className="flex-1 bg-red-500/40" />
                <div className="flex-1 bg-blue-500/40" />
              </div>
              <div className="h-6 flex">
                <div className="flex-1 bg-blue-900/40" />
                <div className="flex-1 bg-white/40" />
                <div className="flex-1 bg-purple-900/40" />
                <div className="flex-1 bg-black" />
              </div>
            </div>

            {/* Glowing central indicator */}
            <div className="relative z-20 flex flex-col items-center justify-center bg-black/80 border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl">
              <span className="font-mono text-[9px] text-purple-400 uppercase tracking-[0.3em] animate-pulse">
                Database Offline
              </span>
              <span className="font-oswald text-2xl font-bold text-white tracking-widest mt-1">
                503
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-oswald text-3xl font-bold text-white tracking-wide uppercase">
            База данных временно недоступна
          </h1>
          
          {/* Subtitle */}
          <h2 className="font-mono text-xs text-purple-400 uppercase tracking-wider mt-1.5 animate-pulse">
            Сбой подключения к PostgreSQL
          </h2>

          {/* Message */}
          <p className="font-mono text-sm text-white/45 mt-4 leading-relaxed max-w-md mx-auto">
            Сервер не смог получить ответ от хранилища данных. Возможно, база данных находится на техническом обслуживании или перезапускается на Railway.
          </p>

          {/* Technical Details Toggle */}
          <div className="mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="font-mono text-xs text-purple-400/80 hover:text-purple-350 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <span>{showDetails ? "▼ Скрыть детали сбоя" : "▶ Показать лог подключения"}</span>
            </button>

            {showDetails && (
              <div className="w-full mt-4 bg-black/50 rounded-2xl p-4 border border-purple-500/10 text-left font-mono text-[10px] text-purple-300/60 max-h-48 overflow-y-auto leading-relaxed animate-in slide-in-from-top-2 duration-200">
                <p className="text-purple-400 font-bold mb-1">Состояние соединения Prisma Client:</p>
                <p>{error.message || "Ошибка инициализации клиента базы данных"}</p>
                {error.digest && <p className="mt-1">Digest: {error.digest}</p>}
                {error.stack && <p className="mt-2 text-[9px] text-purple-400/40 whitespace-pre-wrap">{error.stack}</p>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-sm mx-auto">
            <button
              onClick={() => reset()}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-[13px] font-bold transition-all shadow-lg hover:shadow-purple-500/20"
            >
              🔄 Повторить попытку
            </button>
            <Link
              href="/"
              className="flex-1 py-3.5 px-6 rounded-2xl border border-white/10 hover:bg-white/[0.05] text-white/80 font-mono text-[13px] transition-all flex items-center justify-center"
            >
              🏠 На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle 800px at center, rgba(239, 68, 68, 0.08), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="max-w-xl w-full text-center relative z-10">
        {/* Animated Broken Projector Icon */}
        <div className="w-24 h-24 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)] mb-8 animate-pulse">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
          </svg>
        </div>

        <h1 className="font-oswald text-4xl font-bold text-white tracking-wide uppercase">
          Что-то пошло не так (500)
        </h1>
        
        <p className="font-mono text-sm text-white/55 mt-3 leading-relaxed max-w-md mx-auto">
          Произошла критическая ошибка при обработке запроса сервером. Кинолента воспроизведения временно оборвалась.
        </p>

        {/* Technical Details Toggle */}
        <div className="mt-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="font-mono text-xs text-red-400/80 hover:text-red-300 transition-colors flex items-center gap-1.5 mx-auto"
          >
            <span>{showDetails ? "▼ Скрыть детали ошибки" : "▶ Показать технические детали"}</span>
          </button>

          {showDetails && (
            <div className="w-full mt-4 bg-black/50 rounded-2xl p-4 border border-red-500/10 text-left font-mono text-[10px] text-red-300/60 max-h-48 overflow-y-auto leading-relaxed animate-in slide-in-from-top-2 duration-200">
              <p className="text-red-400 font-bold mb-1">Информация об ошибке:</p>
              <p>{error.message || "Неизвестная ошибка выполнения сервера"}</p>
              {error.digest && <p className="mt-1">Digest: {error.digest}</p>}
              {error.stack && <p className="mt-2 text-[9px] text-red-400/40 whitespace-pre-wrap">{error.stack}</p>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-sm mx-auto">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono text-[13px] font-bold transition-all shadow-lg hover:shadow-red-500/20"
          >
            🔄 Перезапустить
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-6 rounded-2xl border border-white/10 hover:bg-white/[0.05] text-white/80 font-mono text-[13px] transition-all flex items-center justify-center"
          >
            🏠 На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
