"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Кинопленка анимация */}
        <div className="relative">
          {/* Внешнее кольцо */}
          <div className="w-24 h-24 rounded-full border-4 border-slate-700 animate-pulse" />
          
          {/* Вращающееся кольцо */}
          <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-amber-500 border-r-orange-500 animate-spin" />
          
          {/* Центральная иконка */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center animate-pulse">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Текст загрузки */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-white">Загрузка...</p>
          
          {/* Анимированные точки */}
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>

        {/* Декоративные элементы - кадры пленки */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 border-2 border-amber-500/30 rounded-sm"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${i * 45}deg) translateY(-120px)`,
                animation: `pulse 2s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

