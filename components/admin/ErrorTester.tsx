"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type ModalType = "critical" | "security" | "ratelimit" | "bsod";

export function ErrorTester() {
  const [activeToast, setActiveToast] = useState<{ message: string; sub: string; type: "error" | "warning" } | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [rateLimitTimer, setRateLimitTimer] = useState(45);

  // Auto-hide toast
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Rate Limit Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeModal === "ratelimit" && rateLimitTimer > 0) {
      interval = setInterval(() => {
        setRateLimitTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeModal, rateLimitTimer]);

  const triggerToast = (type: "error" | "warning") => {
    if (type === "error") {
      setActiveToast({
        message: "Ошибка соединения с БД PostgreSQL",
        sub: "Код ошибки: ECONNREFUSED · Попытка переподключения через 5 сек.",
        type: "error",
      });
    } else {
      setActiveToast({
        message: "Низкая скорость ответа внешнего API",
        sub: "Предупреждение: Сервис TMDB отвечает дольше 1500мс.",
        type: "warning",
      });
    }
  };

  const triggerModal = (type: ModalType) => {
    if (type === "ratelimit") {
      setRateLimitTimer(45);
    }
    setActiveModal(type);
  };

  return (
    <div className="bg-[#121821] rounded-2xl p-6 border border-white/[0.08] shadow-xl">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-xl">🛠️</span>
        <h2 className="font-oswald text-lg font-bold text-white">Инструменты тестирования интерфейса ошибок</h2>
      </div>
      <p className="font-mono text-[11px] text-white/35 mb-5 leading-relaxed">
        Служебная панель для проверки UX/UI обработчиков ошибок. Нажмите на кнопки, чтобы симулировать критические ситуации и проверить отзывчивость дизайна.
      </p>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <button
          onClick={() => triggerToast("error")}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] sm:text-xs font-mono transition-all duration-300 gap-1.5"
        >
          <span className="text-lg">⚠️</span>
          <span>Ошибочный Toast</span>
        </button>

        <button
          onClick={() => triggerToast("warning")}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 text-[10px] sm:text-xs font-mono transition-all duration-300 gap-1.5"
        >
          <span className="text-lg">🔔</span>
          <span>Предупреждение</span>
        </button>

        <button
          onClick={() => triggerModal("critical")}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl border border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 text-[10px] sm:text-xs font-mono transition-all duration-300 gap-1.5"
        >
          <span className="text-lg">🛑</span>
          <span>Критический модал</span>
        </button>

        <button
          onClick={() => triggerModal("security")}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-[10px] sm:text-xs font-mono transition-all duration-300 gap-1.5"
        >
          <span className="text-lg">🛡️</span>
          <span>Security Block</span>
        </button>

        <button
          onClick={() => triggerModal("bsod")}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 text-[10px] sm:text-xs font-mono transition-all duration-300 gap-1.5 col-span-2 sm:col-span-1 md:col-span-1"
        >
          <span className="text-lg">💥</span>
          <span>Синий экран (BSOD)</span>
        </button>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-white/[0.08] my-6" />

      {/* Error Pages Preview Grid */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-xl">🖥️</span>
        <h2 className="font-oswald text-lg font-bold text-white">Индивидуальные страницы ошибок (HTTP status pages)</h2>
      </div>
      <p className="font-mono text-[11px] text-white/35 mb-5 leading-relaxed">
        Нажмите на карточки ниже, чтобы перейти на соответствующую стилизованную страницу ошибки и проверить локализацию и верстку.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
        <Link
          href="/401"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#ffb84d]/5 hover:border-[#ffb84d]/30 text-white transition-all duration-300 text-center select-none group cursor-pointer hover:scale-[1.03]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform">🔑</span>
          <span className="font-oswald text-[13px] font-bold text-white group-hover:text-[#ffb84d] transition-colors">401</span>
          <span className="font-mono text-[8px] text-white/35 uppercase tracking-wider mt-0.5">Unauthorized</span>
        </Link>

        <Link
          href="/403"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-red-500/5 hover:border-red-500/30 text-white transition-all duration-300 text-center select-none group cursor-pointer hover:scale-[1.03]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform">🛡️</span>
          <span className="font-oswald text-[13px] font-bold text-white group-hover:text-red-400 transition-colors">403</span>
          <span className="font-mono text-[8px] text-white/35 uppercase tracking-wider mt-0.5">Forbidden</span>
        </Link>

        <Link
          href="/404-preview"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-amber-500/5 hover:border-amber-500/30 text-white transition-all duration-300 text-center select-none group cursor-pointer hover:scale-[1.03]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform">🔍</span>
          <span className="font-oswald text-[13px] font-bold text-white group-hover:text-[#ffb84d] transition-colors">404</span>
          <span className="font-mono text-[8px] text-white/35 uppercase tracking-wider mt-0.5">Not Found</span>
        </Link>

        <Link
          href="/405"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-amber-600/5 hover:border-amber-600/30 text-white transition-all duration-300 text-center select-none group cursor-pointer hover:scale-[1.03]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform">🚫</span>
          <span className="font-oswald text-[13px] font-bold text-white group-hover:text-amber-500 transition-colors">405</span>
          <span className="font-mono text-[8px] text-white/35 uppercase tracking-wider mt-0.5">Method</span>
        </Link>

        <Link
          href="/500-preview"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-rose-500/5 hover:border-rose-500/30 text-white transition-all duration-300 text-center select-none group cursor-pointer hover:scale-[1.03]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform">💥</span>
          <span className="font-oswald text-[13px] font-bold text-white group-hover:text-rose-400 transition-colors">500</span>
          <span className="font-mono text-[8px] text-white/35 uppercase tracking-wider mt-0.5">Server Error</span>
        </Link>

        <Link
          href="/503"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-purple-500/5 hover:border-purple-500/30 text-white transition-all duration-300 text-center select-none group cursor-pointer hover:scale-[1.03]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform">📺</span>
          <span className="font-oswald text-[13px] font-bold text-white group-hover:text-purple-400 transition-colors">503</span>
          <span className="font-mono text-[8px] text-white/35 uppercase tracking-wider mt-0.5">Maintenance</span>
        </Link>

        <Link
          href="/505"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#c29b68]/5 hover:border-[#c29b68]/30 text-white transition-all duration-300 text-center select-none group cursor-pointer hover:scale-[1.03]"
        >
          <span className="text-lg mb-1 group-hover:scale-110 transition-transform">📽️</span>
          <span className="font-oswald text-[13px] font-bold text-white group-hover:text-[#e8d2b4] transition-colors">505</span>
          <span className="font-mono text-[8px] text-white/35 uppercase tracking-wider mt-0.5">HTTP Version</span>
        </Link>
      </div>

      {/* --- TOAST SIMULATOR --- */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full rounded-2xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3.5 ${
              activeToast.type === "error"
                ? "border-red-500/30 bg-red-950/80 text-white shadow-red-500/10"
                : "border-amber-500/30 bg-amber-950/80 text-white shadow-amber-500/10"
            }`}
          >
            <div className={`p-1.5 rounded-xl ${activeToast.type === "error" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
              {activeToast.type === "error" ? (
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-mono text-[13px] font-bold text-white/95 leading-tight">{activeToast.message}</h4>
              <p className="font-mono text-[10px] text-white/55 mt-1 leading-normal">{activeToast.sub}</p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL SIMULATORS --- */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Body */}
            {activeModal === "critical" && (
              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="relative max-w-lg w-full rounded-3xl border border-rose-500/30 bg-[#170e10] p-6 shadow-[0_0_50px_rgba(244,63,94,0.15)] z-10"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 animate-bounce mb-5">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="font-oswald text-2xl font-bold text-rose-200 tracking-wide uppercase">Критический сбой сервиса</h3>
                  <p className="font-mono text-xs text-rose-400/80 mt-2 leading-relaxed max-w-sm">
                    Обнаружена непредвиденная ошибка в ядре приложения. Запрос к API вернул статус 500.
                  </p>

                  <div className="w-full mt-6 bg-black/60 rounded-2xl p-4 border border-rose-500/10 text-left font-mono text-[10px] text-rose-300/60 max-h-40 overflow-y-auto leading-normal">
                    <p className="text-rose-400 font-bold mb-1">Stack Trace:</p>
                    <p>PrismaClientKnownRequestError: Failed to validate Database URL connection string</p>
                    <p className="mt-1">  at prisma.user.findMany() in /app/api/admin/route.ts:54:21</p>
                    <p>  at runNextServerMigration() in /app/node_modules/next/server.js:12:43</p>
                    <p>  at process.processTicksAndRejections (node:internal/process/task_queues:95:5)</p>
                  </div>

                  <div className="flex gap-3.5 w-full mt-6">
                    <button
                      onClick={() => alert("Симуляция перезагрузки...")}
                      className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-[13px] font-bold transition-all shadow-lg shadow-rose-900/40"
                    >
                      Повторить попытку
                    </button>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/[0.05] text-white/70 font-mono text-[13px] transition-all"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeModal === "security" && (
              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="relative max-w-md w-full rounded-3xl border border-cyan-500/30 bg-[#0d1521] p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] z-10"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse mb-5">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  
                  {/* Cyber Alert Bar */}
                  <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-3 animate-pulse">
                    🚨 Security Shield
                  </div>

                  <h3 className="font-oswald text-2xl font-bold text-cyan-100 tracking-wide uppercase">Доступ заблокирован</h3>
                  <p className="font-mono text-[11px] text-cyan-300/70 mt-2.5 leading-relaxed max-w-xs">
                    Ваш IP-адрес <span className="text-cyan-400 font-bold">192.168.1.104</span> временно заблокирован защитным фильтром. Обнаружена подозрительная активность в API.
                  </p>

                  <div className="w-full mt-5 bg-[#080d15] rounded-xl p-3 border border-cyan-500/10 text-left font-mono text-[10px] text-cyan-400/50 leading-relaxed">
                    <div>Событие: REQUEST_RATE_LIMIT_BYPASS</div>
                    <div>Уровень опасности: HIGH (Высокий)</div>
                    <div>Блокировка: 00:14:59 секунд</div>
                  </div>

                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full mt-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-[13px] font-bold transition-all shadow-lg shadow-cyan-900/30"
                  >
                    Вернуться на сайт
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- BSOD OVERLAY --- */}
            {activeModal === "bsod" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#00469b] p-8 sm:p-16 flex flex-col justify-between text-white font-mono z-50 overflow-y-auto select-none"
              >
                <div className="max-w-4xl mx-auto w-full my-auto space-y-8">
                  {/* Sad face */}
                  <div className="text-8xl sm:text-[140px] font-light leading-none select-none">:(</div>
                  
                  <h1 className="text-lg sm:text-2xl font-normal leading-relaxed">
                    На сайте KinoTec произошла непредвиденная ошибка, требующая перезагрузки. Мы собираем некоторые диагностические данные, после чего веб-приложение будет перезапущено автоматически.
                  </h1>

                  <div className="text-lg font-normal">
                    Завершено: 100%
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 pt-4 border-t border-white/10 items-start">
                    {/* Placeholder QR */}
                    <div className="w-28 h-28 bg-white p-2 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center p-2 text-center text-white text-[8px] font-bold">
                        <span>KinoTec</span>
                        <span className="text-[6px] text-white/50 mt-1">QR CODE</span>
                      </div>
                    </div>
                    
                    <div className="text-[12px] sm:text-sm space-y-2.5 text-white/80">
                      <p>Для получения дополнительных сведений об этой ошибке перейдите по адресу:</p>
                      <p className="text-[#ffb84d] font-bold underline hover:text-white cursor-pointer select-text">https://kinoteck.ru/support/errors</p>
                      <p className="text-white/45 select-text">При обращении в службу поддержки укажите код остановки: KINOTEC_POSTGRES_TIMEOUT</p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-6 py-2.5 bg-white text-[#00469b] hover:bg-white/90 font-bold rounded-xl text-xs transition-colors"
                    >
                      Выход из BSOD
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
